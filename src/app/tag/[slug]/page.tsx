import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Tag, ArrowLeft } from 'lucide-react'
import prisma from '@/lib/prisma'
import { generateTagMetadata } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { PostGrid } from '@/components/posts/post-grid'
import { FadeUp } from '@/components/animations/motion-wrapper'
import { BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { Pagination } from '@/components/ui/pagination'

interface TagPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

async function getTag(slug: string) {
  return prisma.tag.findUnique({
    where: { slug },
    include: {
      _count: { select: { posts: true } },
    },
  })
}

async function getTagPosts(tagId: number, page: number = 1) {
  const limit = 12
  const where = {
    tagId,
    post: {
      status: 'PUBLISHED' as const,
      publishedAt: { not: null },
    },
  }

  const total = await prisma.postTag.count({ where })
  const totalPages = Math.ceil(total / limit)
  const safePage = totalPages > 0 ? Math.min(Math.max(1, page), totalPages) : 1
  const skip = (safePage - 1) * limit

  const postTags = await prisma.postTag.findMany({
    where,
    skip,
    take: limit,
    orderBy: [{ post: { publishedAt: 'desc' } }, { post: { id: 'desc' } }],
    include: {
      post: {
        include: {
          category: true,
          tags: { include: { tag: true } },
        },
      },
    },
  })

  return {
    posts: postTags.map((pt) => pt.post),
    pagination: {
      page: safePage,
      limit,
      total,
      totalPages,
    },
  }
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) {
    return { title: 'برچسب یافت نشد' }
  }

  return generateTagMetadata(tag)
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const rawPage = parseInt(pageParam || '1', 10)
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage
  
  const tag = await getTag(slug)

  if (!tag) {
    notFound()
  }

  const { posts, pagination } = await getTagPosts(tag.id, page)
  const getPageHref = (targetPage: number) => `/tag/${slug}?page=${targetPage}`

  // If requested page is out of range, redirect to the last valid page
  if (pagination.totalPages > 0 && page !== pagination.page) {
    return redirect(getPageHref(pagination.page))
  }

  const breadcrumbs = [
    { name: 'خانه', url: '/' },
    { name: 'برچسب‌ها', url: '/tags' },
    { name: tag.name, url: `/tag/${tag.slug}` },
  ]

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="container-wrapper py-12">
        {/* Back Link */}
        <FadeUp>
          <Link href="/tags" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              همه برچسب‌ها
            </Button>
          </Link>
        </FadeUp>

        {/* Header */}
        <FadeUp>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Tag className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold">#{tag.name}</h1>
                <p className="text-muted-foreground">
                  {pagination.total} نوشته با این برچسب
                </p>
              </div>
            </div>
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
            <p className="text-muted-foreground">هنوز نوشته‌ای با این برچسب نیست.</p>
          </div>
        )}
      </div>
    </>
  )
}
