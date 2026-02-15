import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { validateRequest } from '@/lib/auth'

/**
 * GET /api/categories
 * List all categories with post counts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeChildren = searchParams.get('includeChildren') === 'true'
    const parentId = searchParams.get('parentId')
    
    const where: Record<string, unknown> = {}
    
    if (parentId !== null) {
      if (parentId === 'null' || parentId === '') {
        where.parentId = null // Only root categories
      } else {
        where.parentId = parseInt(parentId)
      }
    }
    
    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: true,
        ...(includeChildren && {
          children: {
            include: {
              _count: { select: { posts: true } },
            },
          },
        }),
        _count: {
          select: { posts: true },
        },
      },
      orderBy: { name: 'asc' },
    })
    
    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/categories
 * Create a new category (requires authentication)
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
      name,
      slug: customSlug,
      description,
      parentId,
      metaTitle,
      metaDescription,
    } = body
    
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
    const existingCategory = await prisma.category.findUnique({ where: { slug } })
    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'A category with this slug already exists' },
        { status: 400 }
      )
    }
    
    // Validate parent exists if provided
    if (parentId) {
      const parentCategory = await prisma.category.findUnique({ where: { id: parentId } })
      if (!parentCategory) {
        return NextResponse.json(
          { success: false, error: 'Parent category not found' },
          { status: 400 }
        )
      }
    }
    
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        metaTitle,
        metaDescription,
        ...(parentId && { parent: { connect: { id: parentId } } }),
      },
      include: {
        parent: true,
        children: true,
        _count: { select: { posts: true } },
      },
    })
    
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
