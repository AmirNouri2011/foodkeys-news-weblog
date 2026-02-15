import Link from 'next/link'
import { ArrowRight, TrendingUp, Sparkles, Clock } from 'lucide-react'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PostGrid, FeaturedPosts } from '@/components/posts/post-grid'
import { PostCard } from '@/components/posts/post-card'
import { HeroSection } from '@/components/home/hero-section'
import { CategoriesSection } from '@/components/home/categories-section'
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/seo/json-ld'

async function getFeaturedPosts() {
  return prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      publishedAt: { not: null },
    },
    orderBy: [
      { viewCount: 'desc' },
      { publishedAt: 'desc' },
    ],
    take: 4,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })
}

async function getLatestPosts() {
  return prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })
}

async function getCategories() {
  return prisma.category.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { posts: { _count: 'desc' } },
    take: 6,
  })
}

async function getPopularPosts() {
  return prisma.post.findMany({
    where: { 
      status: 'PUBLISHED',
      publishedAt: { not: null },
    },
    orderBy: { viewCount: 'desc' },
    take: 5,
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })
}

export default async function HomePage() {
  const [featuredPosts, latestPosts, categories, popularPosts] = await Promise.all([
    getFeaturedPosts(),
    getLatestPosts(),
    getCategories(),
    getPopularPosts(),
  ])

  return (
    <>
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <div className="container-wrapper py-12 lg:py-16">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl md:text-3xl font-bold">Featured Articles</h2>
              </div>
              <Link href="/posts">
                <Button variant="ghost" className="group">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <FeaturedPosts posts={featuredPosts} />
          </section>
        )}

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Latest Posts - Main Column */}
          <div className="lg:col-span-2">
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl md:text-3xl font-bold">Latest Articles</h2>
                </div>
              </div>
              {latestPosts.length > 0 ? (
                <PostGrid posts={latestPosts} columns={2} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No articles published yet.</p>
                </div>
              )}
              
              {latestPosts.length > 0 && (
                <div className="mt-8 text-center">
                  <Link href="/posts">
                    <Button variant="outline" size="lg">
                      Browse All Articles
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Categories */}
            <CategoriesSection categories={categories} />

            {/* Popular Posts */}
            {popularPosts.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold">Trending</h3>
                </div>
                <div className="space-y-1">
                  {popularPosts.map((post, index) => (
                    <PostCard key={post.id} post={post} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {/* Newsletter CTA */}
            <section className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border">
              <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest articles and news delivered to your inbox.
              </p>
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button className="w-full" variant="gradient">
                  Subscribe
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </>
  )
}
