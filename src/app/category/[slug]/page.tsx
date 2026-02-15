import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Folder, ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import { generateCategoryMetadata } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PostGrid } from '@/components/posts/post-grid'
import { FadeUp } from '@/components/animations/motion-wrapper'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

async function getCategory(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
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
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        categoryId,
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.post.count({
      where: {
        categoryId,
        status: 'PUBLISHED',
        publishedAt: { not: null },
      },
    }),
  ])

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return generateCategoryMetadata(category)
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = parseInt(pageParam || '1')
  
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const { posts, pagination } = await getCategoryPosts(category.id, page)

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    ...(category.parent ? [{ name: category.parent.name, url: `/category/${category.parent.slug}` }] : []),
    { name: category.name, url: `/category/${category.slug}` },
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
              All Categories
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
                  {pagination.total} article{pagination.total !== 1 ? 's' : ''}
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
                <span className="text-sm text-muted-foreground mr-2">Subcategories:</span>
                {category.children.map((child) => (
                  <Link key={child.id} href={`/category/${child.slug}`}>
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
              <div className="flex justify-center gap-2 mt-12">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/category/${slug}?page=${p}`}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      p === pagination.page
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-accent'
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </>
  )
}
