import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PostStatus } from '@/types'
import { slugify, generateExcerpt } from '@/lib/utils'
import { validateRequest } from '@/lib/auth'

/**
 * GET /api/posts
 * List posts with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'publishedAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'
    
    // Filters
    const status = searchParams.get('status') as PostStatus | null
    const categoryId = searchParams.get('categoryId')
    const categorySlug = searchParams.get('categorySlug')
    const tagId = searchParams.get('tagId')
    const tagSlug = searchParams.get('tagSlug')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured') === 'true'
    
    // Build where clause
    const where: Record<string, unknown> = {}
    
    // By default, only show published posts for public access
    // Unless explicitly requesting a specific status
    if (status) {
      where.status = status
    } else {
      where.status = 'PUBLISHED'
    }
    
    if (categoryId) {
      where.categoryId = parseInt(categoryId)
    }
    
    if (categorySlug) {
      where.category = { slug: categorySlug }
    }
    
    if (tagId) {
      where.tags = { some: { tagId: parseInt(tagId) } }
    }
    
    if (tagSlug) {
      where.tags = { some: { tag: { slug: tagSlug } } }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { excerpt: { contains: search } },
      ]
    }
    
    if (featured) {
      // Featured posts could be those with high view count or explicitly marked
      where.viewCount = { gt: 100 }
    }
    
    // Execute query
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { media: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ])
    
    const totalPages = Math.ceil(total / limit)
    
    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/posts
 * Create a new post (requires authentication)
 */
export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = validateRequest(request)
  if (!authResult.success) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    const {
      title,
      slug: customSlug,
      content,
      excerpt: customExcerpt,
      featuredImage,
      status = 'DRAFT' as PostStatus,    
      categoryId,
      tagIds = [],
      meta = {},
      metaTitle,
      metaDescription,
      canonicalUrl,
      publishedAt,
    } = body
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      )
    }
    
    // Generate slug from title if not provided
    const slug = customSlug || slugify(title)
    
    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({ where: { slug } })
    if (existingPost) {
      return NextResponse.json(
        { success: false, error: 'A post with this slug already exists' },
        { status: 400 }
      )
    }
    
    // Generate excerpt if not provided
    const excerpt = customExcerpt || generateExcerpt(content, 160)
    
    // Create post with relations
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        status,
        metaTitle,
        metaDescription,
        canonicalUrl,
        publishedAt: publishedAt ? new Date(publishedAt) : (status === 'PUBLISHED' ? new Date() : null),
        ...(categoryId && { category: { connect: { id: categoryId } } }),
        ...(tagIds.length > 0 && {
          tags: {
            create: tagIds.map((tagId: number) => ({
              tag: { connect: { id: tagId } },
            })),
          },
        }),
        ...(Object.keys(meta).length > 0 && {
          meta: {
            create: Object.entries(meta).map(([key, value]) => ({
              key,
              value: String(value),
            })),
          },
        }),
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
        meta: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: post,
      message: 'Post created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
