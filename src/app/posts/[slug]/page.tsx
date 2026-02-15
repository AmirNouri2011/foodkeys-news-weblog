import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, Tag, Folder, ArrowLeft, Share2 } from 'lucide-react'
import prisma from '@/lib/prisma'
import { generatePostMetadata, generateArticleJsonLd, generateBreadcrumbJsonLd, absoluteUrl } from '@/lib/seo'
import { formatDate, getReadingTime } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/posts/post-card'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld'
import { PostContent } from '@/components/posts/post-content'
import { ShareButtons } from '@/components/posts/share-buttons'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      meta: true,
    },
  })

  if (!post || post.status !== 'PUBLISHED') {
    return null
  }

  // Increment view count
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: { increment: 1 } },
  })

  return post
}

async function getRelatedPosts(postId: number, categoryId: number | null, tagIds: number[]) {
  return prisma.post.findMany({
    where: {
      status: 'PUBLISHED',
      id: { not: postId },
      OR: [
        ...(categoryId ? [{ categoryId }] : []),
        ...(tagIds.length > 0 ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      tags: { include: { tag: true } },
    },
  })
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: true,
      tags: { include: { tag: true } },
      meta: true,
    },
  })

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return generatePostMetadata(post)
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  const tagIds = post.tags.map((pt) => pt.tag.id)
  const relatedPosts = await getRelatedPosts(post.id, post.categoryId, tagIds)
  const readingTime = getReadingTime(post.content)

  // SEO structured data
  const articleJsonLd = generateArticleJsonLd(post)
  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Articles', url: '/posts' },
    ...(post.category ? [{ name: post.category.name, url: `/category/${post.category.slug}` }] : []),
    { name: post.title, url: `/posts/${post.slug}` },
  ]
  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs)

  return (
    <>
      <ArticleJsonLd data={articleJsonLd} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <article className="pb-16">
        {/* Hero Header */}
        <header className="relative">
          {post.featuredImage ? (
            <div className="relative h-[50vh] md:h-[60vh] lg:h-[70vh]">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
                <div className="container-wrapper">
                  <PostHeader post={post} readingTime={readingTime} light />
                </div>
              </div>
            </div>
          ) : (
            <div className="container-wrapper pt-12 pb-8">
              <PostHeader post={post} readingTime={readingTime} />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="container-wrapper">
          <div className="max-w-3xl mx-auto">
            {/* Back Link */}
            <div className="py-6">
              <Link href="/posts">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Articles
                </Button>
              </Link>
            </div>

            {/* Article Content */}
            <PostContent content={post.content} />

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  {post.tags.map((pt) => (
                    <Link key={pt.tag.id} href={`/tag/${pt.tag.slug}`}>
                      <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                        {pt.tag.name}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-8 pt-8 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share this article
                </span>
                <ShareButtons url={absoluteUrl(`/posts/${post.slug}`)} title={post.title} />
              </div>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="container-wrapper mt-16 pt-16 border-t">
            <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}

// Post Header Component
interface PostHeaderProps {
  post: {
    title: string
    excerpt: string | null
    publishedAt: Date | null
    viewCount: number
    category: { name: string; slug: string } | null
  }
  readingTime: number
  light?: boolean
}

function PostHeader({ post, readingTime, light }: PostHeaderProps) {
  const textColor = light ? 'text-white' : 'text-foreground'
  const mutedColor = light ? 'text-white/70' : 'text-muted-foreground'

  return (
    <div className={`max-w-3xl ${light ? '' : 'mx-auto'}`}>
      {/* Category */}
      {post.category && (
        <Link href={`/category/${post.category.slug}`}>
          <Badge 
            className={`mb-4 ${light ? 'bg-white/20 text-white hover:bg-white/30' : ''}`}
            variant={light ? 'default' : 'secondary'}
          >
            <Folder className="h-3 w-3 mr-1" />
            {post.category.name}
          </Badge>
        </Link>
      )}

      {/* Title */}
      <h1 className={`text-3xl md:text-4xl lg:text-5xl font-bold mb-4 ${textColor}`}>
        {post.title}
      </h1>

      {/* Excerpt */}
      {post.excerpt && (
        <p className={`text-lg md:text-xl mb-6 ${mutedColor}`}>
          {post.excerpt}
        </p>
      )}

      {/* Meta */}
      <div className={`flex flex-wrap items-center gap-4 text-sm ${mutedColor}`}>
        {post.publishedAt && (
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedAt)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {readingTime} min read
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {post.viewCount} views
        </span>
      </div>
    </div>
  )
}
