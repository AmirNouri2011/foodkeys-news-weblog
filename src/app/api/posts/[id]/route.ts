import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { PostStatus } from '@/types'
import { slugify, generateExcerpt } from '@/lib/utils'
import { validateRequest } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/posts/[id]
 * Get a single post by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const incrementView = searchParams.get('view') === 'true'
    
    // Check if id is a number (ID) or string (slug)
    const isNumericId = /^\d+$/.test(id)
    
    const post = await prisma.post.findFirst({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      include: {
        category: true,
        tags: { include: { tag: true } },
        meta: true,
        media: true,
      },
    })
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Increment view count if requested
    if (incrementView) {
      await prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      })
    }
    
    return NextResponse.json({
      success: true,
      data: post,
    })
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/posts/[id]
 * Update a post (requires authentication)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  // Validate authentication
  const authResult = validateRequest(request)
  if (!authResult.success) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: 401 }
    )
  }
  
  try {
    const { id } = await params
    const postId = parseInt(id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      )
    }
    
    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      include: { tags: true, meta: true },
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const {
      title,
      slug: customSlug,
      content,
      excerpt: customExcerpt,
      featuredImage,
      status,
      categoryId,
      tagIds,
      meta,
      metaTitle,
      metaDescription,
      canonicalUrl,
      publishedAt,
    } = body
    
    // If slug is being changed, check for conflicts
    if (customSlug && customSlug !== existingPost.slug) {
      const slugConflict = await prisma.post.findUnique({ where: { slug: customSlug } })
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'A post with this slug already exists' },
          { status: 400 }
        )
      }
    }
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    
    if (title !== undefined) {
      updateData.title = title
      // Update slug if title changed and no custom slug provided
      if (!customSlug && title !== existingPost.title) {
        updateData.slug = slugify(title)
      }
    }
    
    if (customSlug !== undefined) updateData.slug = customSlug
    if (content !== undefined) {
      updateData.content = content
      // Update excerpt if content changed
      if (!customExcerpt) {
        updateData.excerpt = generateExcerpt(content, 160)
      }
    }
    if (customExcerpt !== undefined) updateData.excerpt = customExcerpt
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl
    
    if (status !== undefined) {
      updateData.status = status
      // Set publishedAt when publishing for the first time
      if (status === 'PUBLISHED' && !existingPost.publishedAt) {
        updateData.publishedAt = new Date()
      }
    }
    
    if (publishedAt !== undefined) {
      updateData.publishedAt = publishedAt ? new Date(publishedAt) : null
    }
    
    // Handle category
    if (categoryId !== undefined) {
      if (categoryId === null) {
        updateData.category = { disconnect: true }
      } else {
        updateData.category = { connect: { id: categoryId } }
      }
    }
    
    // Update post
    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        category: true,
        tags: { include: { tag: true } },
        meta: true,
      },
    })
    
    // Handle tags update if provided
    if (tagIds !== undefined) {
      // Delete existing tag relations
      await prisma.postTag.deleteMany({ where: { postId } })
      
      // Create new tag relations
      if (tagIds.length > 0) {
        await prisma.postTag.createMany({
          data: tagIds.map((tagId: number) => ({
            postId,
            tagId,
          })),
        })
      }
    }
    
    // Handle meta update if provided
    if (meta !== undefined) {
      // Delete existing meta
      await prisma.postMeta.deleteMany({ where: { postId } })
      
      // Create new meta
      if (Object.keys(meta).length > 0) {
        await prisma.postMeta.createMany({
          data: Object.entries(meta).map(([key, value]) => ({
            postId,
            key,
            value: String(value),
          })),
        })
      }
    }
    
    // Fetch updated post with all relations
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        category: true,
        tags: { include: { tag: true } },
        meta: true,
        media: true,
      },
    })
    
    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: 'Post updated successfully',
    })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/posts/[id]
 * Delete a post and its associated media (requires authentication)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // Validate authentication
  const authResult = validateRequest(request)
  if (!authResult.success) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: 401 }
    )
  }
  
  try {
    const { id } = await params
    const postId = parseInt(id)
    
    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid post ID' },
        { status: 400 }
      )
    }
    
    // Get post with media
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    })
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Delete associated media files from filesystem
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    for (const media of post.media) {
      try {
        const filePath = path.join(uploadsDir, media.path)
        await fs.unlink(filePath)
      } catch (err) {
        // File might not exist, continue
        console.warn(`Could not delete file: ${media.path}`, err)
      }
    }
    
    // Delete featured image if it's in uploads
    if (post.featuredImage && post.featuredImage.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', post.featuredImage)
        await fs.unlink(filePath)
      } catch (err) {
        console.warn(`Could not delete featured image: ${post.featuredImage}`, err)
      }
    }
    
    // Delete post (cascade will delete relations)
    await prisma.post.delete({ where: { id: postId } })
    
    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    )
  }
}
