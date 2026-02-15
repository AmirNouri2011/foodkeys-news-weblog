import { Post, Category, Tag, PostMeta, Media } from '@prisma/client'

// PostStatus as string (SQLite doesn't support enums)
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED'

export const PostStatusValues: Record<PostStatus, PostStatus> = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  SCHEDULED: 'SCHEDULED',
  ARCHIVED: 'ARCHIVED',
}

// Re-export Prisma types
export type { Post, Category, Tag, PostMeta, Media }

// Extended types with relations
export type PostWithRelations = Post & {
  category: Category | null
  tags: { tag: Tag }[]
  meta: PostMeta[]
  media: Media[]
}

export type CategoryWithRelations = Category & {
  parent: Category | null
  children: Category[]
  _count?: {
    posts: number
  }
}

export type TagWithCount = Tag & {
  _count?: {
    posts: number
  }
}

// API Request/Response types
export interface CreatePostInput {
  title: string
  slug?: string
  content: string
  excerpt?: string
  featuredImage?: string
  status?: PostStatus
  categoryId?: number
  tagIds?: number[]
  meta?: Record<string, string>
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  publishedAt?: string
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: number
}

export interface CreateCategoryInput {
  name: string
  slug?: string
  description?: string
  parentId?: number
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: number
}

export interface CreateTagInput {
  name: string
  slug?: string
  metaTitle?: string
  metaDescription?: string
}

export interface UpdateTagInput extends Partial<CreateTagInput> {
  id: number
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

// Filter types
export interface PostFilters extends PaginationParams {
  status?: PostStatus
  categoryId?: number
  categorySlug?: string
  tagId?: number
  tagSlug?: string
  search?: string
  featured?: boolean
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// SEO types
export interface SeoData {
  title: string
  description: string
  canonical?: string
  openGraph?: {
    title?: string
    description?: string
    images?: { url: string; width?: number; height?: number; alt?: string }[]
    type?: 'website' | 'article'
    publishedTime?: string
    modifiedTime?: string
    authors?: string[]
    tags?: string[]
  }
  twitter?: {
    card?: 'summary' | 'summary_large_image'
    title?: string
    description?: string
    images?: string[]
  }
}

// JSON-LD types
export interface ArticleJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Article' | 'NewsArticle' | 'BlogPosting'
  headline: string
  description: string
  image?: string[]
  datePublished?: string
  dateModified?: string
  author?: {
    '@type': 'Person' | 'Organization'
    name: string
  }
  publisher?: {
    '@type': 'Organization'
    name: string
    logo?: {
      '@type': 'ImageObject'
      url: string
    }
  }
  mainEntityOfPage?: {
    '@type': 'WebPage'
    '@id': string
  }
}
