import { Metadata } from 'next'
import { Suspense } from 'react'
import { Search } from 'lucide-react'
import prisma from '@/lib/prisma'
import { PostGrid, PostGridSkeleton } from '@/components/posts/post-grid'
import { SearchForm } from '@/components/search/search-form'
import { FadeUp } from '@/components/animations/motion-wrapper'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for articles on FoodKeys Weblog.',
}

interface SearchPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

async function searchPosts(query: string, page: number = 1) {
  if (!query.trim()) {
    return { posts: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } }
  }

  const limit = 12
  const skip = (page - 1) * limit

  const where = {
    status: 'PUBLISHED' as const,
    publishedAt: { not: null },
    OR: [
      { title: { contains: query } },
      { content: { contains: query } },
      { excerpt: { contains: query } },
      { category: { name: { contains: query } } },
      { tags: { some: { tag: { name: { contains: query } } } } },
    ],
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

async function SearchResults({ query, page }: { query: string; page: number }) {
  const { posts, pagination } = await searchPosts(query, page)

  if (!query.trim()) {
    return (
      <div className="text-center py-20">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          Enter a search term to find articles
        </p>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">No results found</p>
        <p className="text-muted-foreground">
          No articles match &quot;{query}&quot;. Try different keywords.
        </p>
      </div>
    )
  }

  return (
    <>
      <p className="text-muted-foreground mb-8">
        Found {pagination.total} result{pagination.total !== 1 ? 's' : ''} for &quot;{query}&quot;
      </p>
      
      <PostGrid posts={posts} columns={3} />
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
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
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const page = parseInt(params.page || '1')

  return (
    <div className="container-wrapper py-12">
      <FadeUp>
        <div className="max-w-2xl mx-auto mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Search Articles</h1>
          <p className="text-muted-foreground mb-8">
            Search through all articles, categories, and tags
          </p>
          <SearchForm initialQuery={query} />
        </div>
      </FadeUp>

      <Suspense fallback={<PostGridSkeleton count={6} columns={3} />}>
        <SearchResults query={query} page={page} />
      </Suspense>
    </div>
  )
}
