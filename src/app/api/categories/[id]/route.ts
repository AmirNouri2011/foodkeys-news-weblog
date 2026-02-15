import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { slugify } from '@/lib/utils'
import { validateRequest } from '@/lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/categories/[id]
 * Get a single category by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const isNumericId = /^\d+$/.test(id)
    
    const category = await prisma.category.findFirst({
      where: isNumericId ? { id: parseInt(id) } : { slug: id },
      include: {
        parent: true,
        children: {
          include: {
            _count: { select: { posts: true } },
          },
        },
        posts: {
          where: { status: 'PUBLISHED' },
          take: 10,
          orderBy: { publishedAt: 'desc' },
          include: {
            tags: { include: { tag: true } },
          },
        },
        _count: { select: { posts: true } },
      },
    })
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: category,
    })
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/categories/[id]
 * Update a category (requires authentication)
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
    const categoryId = parseInt(id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      )
    }
    
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const {
      name,
      slug: customSlug,
      description,
      parentId,
      metaTitle,
      metaDescription,
    } = body
    
    // Check slug conflict if changing
    if (customSlug && customSlug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({ where: { slug: customSlug } })
      if (slugConflict) {
        return NextResponse.json(
          { success: false, error: 'A category with this slug already exists' },
          { status: 400 }
        )
      }
    }
    
    // Prevent circular parent reference
    if (parentId === categoryId) {
      return NextResponse.json(
        { success: false, error: 'A category cannot be its own parent' },
        { status: 400 }
      )
    }
    
    // Build update data
    const updateData: Record<string, unknown> = {}
    
    if (name !== undefined) {
      updateData.name = name
      if (!customSlug && name !== existingCategory.name) {
        updateData.slug = slugify(name)
      }
    }
    if (customSlug !== undefined) updateData.slug = customSlug
    if (description !== undefined) updateData.description = description
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription
    
    if (parentId !== undefined) {
      if (parentId === null) {
        updateData.parent = { disconnect: true }
      } else {
        // Validate parent exists
        const parentCategory = await prisma.category.findUnique({ where: { id: parentId } })
        if (!parentCategory) {
          return NextResponse.json(
            { success: false, error: 'Parent category not found' },
            { status: 400 }
          )
        }
        updateData.parent = { connect: { id: parentId } }
      }
    }
    
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
      include: {
        parent: true,
        children: true,
        _count: { select: { posts: true } },
      },
    })
    
    return NextResponse.json({
      success: true,
      data: category,
      message: 'Category updated successfully',
    })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/categories/[id]
 * Delete a category (requires authentication)
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
    const categoryId = parseInt(id)
    
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      )
    }
    
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: { select: { posts: true, children: true } },
      },
    })
    
    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Check if category has posts
    if (category._count.posts > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with posts. Remove posts first or reassign them.' },
        { status: 400 }
      )
    }
    
    // Check if category has children
    if (category._count.children > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete category with subcategories. Delete or move subcategories first.' },
        { status: 400 }
      )
    }
    
    await prisma.category.delete({ where: { id: categoryId } })
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
