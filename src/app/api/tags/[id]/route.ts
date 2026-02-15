import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { validateRequest } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/tags/[id]
 * Get a single tag by ID or slug with its posts
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    
    const isNumericId = /^\d+$/.test(id)
    
    const tag = await prisma.tag.findFirst({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      include: {
        posts: {
          where: {
            post: { status: 'PUBLISHED' },
          },
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { post: { publishedAt: 'desc' } },
          include: {
            post: {
              include: {
                category: true,
                tags: { include: { tag: true } },
              },
            },
          },
        },
        _count: { select: { posts: true } },
      },
    })
    
    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      )
    }
    
    // Transform the response to flatten posts
    const transformedTag = {
      ...tag,
      posts: tag.posts.map((pt) => pt.post),
    }
    
    return NextResponse.json({
      success: true,
      data: transformedTag,
      pagination: {
        page,
        limit,
        total: tag._count.posts,
        totalPages: Math.ceil(tag._count.posts / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tag' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tags/[id]
 * Update a tag (requires authentication)
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
    const tagId = parseInt(id)
    
    if (isNaN(tagId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tag ID' },
        { status: 400 }
      )
    }
    
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
    })
    
    if (!existingTag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const { name, slug: customSlug, metaTitle, metaDescription } = body
    
    // Check slug conflict if changing
    if (customSlug && customSlug !== existingTag.slug) {
      const slugConflict = await prisma.tag.findUnique({ where: { slug: customSlug } })
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'A tag with this slug already exists' },
          { status: 400 }
        )
      }
    }
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    
    if (name !== undefined) {
      updateData.name = name
      if (!customSlug && name !== existingTag.name) {
        updateData.slug = slugify(name)
      }
    }
    if (customSlug !== undefined) updateData.slug = customSlug
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    
    const tag = await prisma.tag.update({
      where: { id: tagId },
      data: updateData,
      include: {
        _count: { select: { posts: true } },
      },
    })
    
    return NextResponse.json({
      success: true,
      data: tag,
      message: 'Tag updated successfully',
    })
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update tag' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tags/[id]
 * Delete a tag (requires authentication)
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
    const tagId = parseInt(id)
    
    if (isNaN(tagId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid tag ID' },
        { status: 400 }
      )
    }
    
    const tag = await prisma.tag.findUnique({
      where: { id: tagId },
    })
    
    if (!tag) {
      return NextResponse.json(
        { success: false, error: 'Tag not found' },
        { status: 404 }
      )
    }
    
    // Delete tag (PostTag relations will be cascade deleted)
    await prisma.tag.delete({ where: { id: tagId } })
    
    return NextResponse.json({
      success: true,
      message: 'Tag deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete tag' },
      { status: 500 }
    )
  }
}
