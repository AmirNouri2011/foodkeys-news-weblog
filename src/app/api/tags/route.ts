import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { validateRequest } from '@/lib/auth'

/**
 * GET /api/tags
 * List all tags with post counts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')
    const sortBy = searchParams.get('sortBy') || 'name' // name, postCount
    
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { posts: true },
        },
      },
      ...(limit && { take: parseInt(limit) }),
      orderBy: sortBy === 'postCount' 
        ? { posts: { _count: 'desc' } }
        : { name: 'asc' },
    })
    
    return NextResponse.json({
      success: true,
      data: tags,
    })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tags
 * Create a new tag (requires authentication)
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
    const { name, slug: customSlug, metaTitle, metaDescription } = body
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      )
    }
    
    // Generate slug from name if not provided
    const slug = customSlug || slugify(name)
    
    // Check if slug already exists
    const existingTag = await prisma.tag.findUnique({ where: { slug } })
    if (existingTag) {
      return NextResponse.json(
        { success: false, error: 'A tag with this slug already exists' },
        { status: 400 }
      )
    }
    
    const tag = await prisma.tag.create({
      data: {
        name,
        slug,
        metaTitle,
        metaDescription,
      },
      include: {
        _count: { select: { posts: true } },
      },
    })
    
    return NextResponse.json({
      success: true,
      data: tag,
      message: 'Tag created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tag' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tags/bulk
 * Create multiple tags at once (requires authentication)
 */
export async function PUT(request: NextRequest) {
  // This handles bulk operations
  const authResult = validateRequest(request)
  if (!authResult.success) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json()
    const { tags: tagNames } = body
    
    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tags array is required' },
        { status: 400 }
      )
    }
    
    const createdTags = []
    const existingTags = []
    
    for (const name of tagNames) {
      if (!name || typeof name !== 'string') continue
      
      const slug = slugify(name)
      const existing = await prisma.tag.findUnique({ where: { slug } })
      
      if (existing) {
        existingTags.push(existing)
      } else {
        const tag = await prisma.tag.create({
          data: { name: name.trim(), slug },
        })
        createdTags.push(tag)
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        created: createdTags,
        existing: existingTags,
      },
      message: `Created ${createdTags.length} tags, ${existingTags.length} already existed`,
    })
  } catch (error) {
    console.error('Error creating tags:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create tags' },
      { status: 500 }
    )
  }
}
