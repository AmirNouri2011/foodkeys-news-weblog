'use client'

import { motion } from 'framer-motion'
import { PostCard, PostCardSkeleton } from './post-card'
import { StaggerContainer, StaggerItem } from '@/components/animations/motion-wrapper'
import { cn } from '@/lib/utils'

interface PostTag {
  tag: {
    id: number
    name: string
    slug: string
  }
}

interface Category {
  id: number
  name: string
  slug: string
}

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  viewCount: number
  publishedAt: Date | string | null
  category: Category | null
  tags: PostTag[]
}

interface PostGridProps {
  posts: Post[]
  columns?: 2 | 3 | 4
  variant?: 'default' | 'featured' | 'compact' | 'horizontal'
  className?: string
}

export function PostGrid({ posts, columns = 3, variant = 'default', className }: PostGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (variant === 'horizontal' || variant === 'compact') {
    return (
      <StaggerContainer className={cn('space-y-4', className)}>
        {posts.map((post) => (
          <StaggerItem key={post.id}>
            <PostCard post={post} variant={variant} />
          </StaggerItem>
        ))}
      </StaggerContainer>
    )
  }

  return (
    <StaggerContainer
      className={cn('grid grid-cols-1 gap-6', gridCols[columns], className)}
    >
      {posts.map((post) => (
        <StaggerItem key={post.id}>
          <PostCard post={post} variant={variant} />
        </StaggerItem>
      ))}
    </StaggerContainer>
  )
}

interface PostGridSkeletonProps {
  count?: number
  columns?: 2 | 3 | 4
  variant?: 'default' | 'compact' | 'horizontal'
}

export function PostGridSkeleton({ count = 6, columns = 3, variant = 'default' }: PostGridSkeletonProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  if (variant === 'horizontal' || variant === 'compact') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <PostCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-1 gap-6', gridCols[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  )
}

// Featured posts section with hero + grid layout
interface FeaturedPostsProps {
  posts: Post[]
  className?: string
}

export function FeaturedPosts({ posts, className }: FeaturedPostsProps) {
  if (posts.length === 0) return null

  const [heroPost, ...gridPosts] = posts

  return (
    <div className={cn('space-y-6', className)}>
      {/* Hero Post */}
      {heroPost && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PostCard post={heroPost} variant="featured" />
        </motion.div>
      )}

      {/* Grid Posts */}
      {gridPosts.length > 0 && (
        <PostGrid posts={gridPosts.slice(0, 3)} columns={3} />
      )}
    </div>
  )
}
