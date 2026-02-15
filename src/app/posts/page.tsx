import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { PostGrid } from '@/components/posts/post-grid'
import { FadeUp } from '@/components/animations/motion-wrapper'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Browse all articles, news, and stories on FoodKeys Weblog.',
}

interface PostsPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    tag?: string
  }>
}

async function getPosts(page: number = 1, categorySlug?: string, tagSlug?: string) {
  const limit = 12
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {
    status: 'PUBLISHED',
    publishedAt: { not: null },
  }

  if (categorySlug) {
    where.category = { slug: categorySlug }
  }

  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } }
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    }),
    prisma.post.count({ where }),
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

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const { posts, pagination } = await getPosts(page, params.category, params.tag)

  return (
    <div className="container-wrapper py-12">
      <FadeUp>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">All Articles</h1>
          <p className="text-muted-foreground">
            Explore our collection of {pagination.total} articles
          </p>
        </div>
      </FadeUp>

      {posts.length > 0 ? (
        <>
          <PostGrid posts={posts} columns={3} />
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/posts?page=${p}`}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    p === pagination.page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-accent'
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No articles found.</p>
        </div>
      )}
    </div>
  )
}
