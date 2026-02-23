import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Folder, ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import { generateCategoryMetadata } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PostGrid } from '@/components/posts/post-grid'
import { FadeUp } from '@/components/animations/motion-wrapper'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { Pagination } from '@/components/ui/pagination'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

async function getCategory(slug: string) {
  const decodedSlug = decodeURIComponent(slug)
  const category = await prisma.category.findUnique({
    where: { slug: decodedSlug },
    include: {
      parent: true,
      children: {
        include: {
          _count: { select: { posts: true } },
        },
      },
      _count: { select: { posts: true } },
    },
  })
  if (category) return category

  const nameFromSlug = decodedSlug.replace(/-/g, ' ').replace(/%20/g, ' ')
  return prisma.category.findFirst({
    where: { name: nameFromSlug },
    include: {
      parent: true,
      children: {
        include: {
          _count: { select: { posts: true } },
        },
      },
      _count: { select: { posts: true } },
    },
  })
}

async function getCategoryPosts(categoryId: number, page: number = 1) {
  const limit = 12
  const where = {
    categoryId,
    status: 'PUBLISHED' as const,
    publishedAt: { not: null },
  }

  const total = await prisma.post.count({ where })
  const totalPages = Math.ceil(total / limit)
  const safePage = totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1
  const skip = (safePage - 1) * limit

  const posts = await prisma.post.findMany({
    where,
    skip,
    take: limit,
    orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })

  return {
    posts,
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'دسته یافت نشد' }
  }

  return generateCategoryMetadata(category)
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const rawPage = parseInt(pageParam || '1', 10)
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
  
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const { posts, pagination } = await getCategoryPosts(category.id, page)
  const getPageHref = (targetPage: number) => `/category/${encodeURIComponent(category.slug)}?page=${targetPage}`

  const decodedSlug = decodeURIComponent(slug)
  if (decodedSlug !== category.slug) {
    const q = pagination.page > 1 ? `?page=${pagination.page}` : ''
    return redirect(`/category/${encodeURIComponent(category.slug)}${q}`)
  }

  // If requested page is out of range, redirect to the last valid page
  if (pagination.totalPages > 0 && page !== pagination.page) {
    return redirect(getPageHref(pagination.page))
  }

  const breadcrumbs = [
    { name: 'خانه', url: '/' },
    { name: 'دسته‌ها', url: '/categories' },
    ...(category.parent ? [{ name: category.parent.name, url: `/category/${encodeURIComponent(category.parent.slug)}` }] : []),
    { name: category.name, url: `/category/${encodeURIComponent(category.slug)}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="container-wrapper py-12">
        {/* Back Link */}
        <FadeUp>
          <Link href="/categories" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              همه دسته‌ها
            </Button>
          </Link>
        </FadeUp>

        {/* Header */}
        <FadeUp>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Folder className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">{category.name}</h1>
                <p className="text-muted-foreground">
                  {pagination.total} نوشته
                </p>
              </div>
            </div>
            
            {category.description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category.description}
              </p>
            )}

            {/* Subcategories */}
            {category.children.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground ml-2">زیردسته‌ها:</span>
                {category.children.map((child) => (
                  <Link key={child.id} href={`/category/${encodeURIComponent(child.slug)}`}>
                    <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground">
                      {child.name} ({child._count.posts})
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </FadeUp>

        {/* Posts */}
        {posts.length > 0 ? (
          <>
            <PostGrid posts={posts} columns={3} />
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                getPageHref={getPageHref}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">هنوز نوشته‌ای در این دسته نیست.</p>
          </div>
        )}
      </div>
    </>
  )
}
