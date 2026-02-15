import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

interface RouteParams {
  params: Promise<{ id: string }>
}

/**
 * GET /api/media/[id]
 * Get a single media file by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const mediaId = parseInt(id)
    
    if (isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid media ID' },
        { status: 400 }
      )
    }
    
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        post: {
          select: { id: true, title: true, slug: true },
        },
      },
    })
    
    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: media,
    })
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/media/[id]
 * Update media metadata (requires authentication)
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
    const mediaId = parseInt(id)
    
    if (isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid media ID' },
        { status: 400 }
      )
    }
    
    const existingMedia = await prisma.media.findUnique({
      where: { id: mediaId },
    })
    
    if (!existingMedia) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }
    
    const body = await request.json()
    const { alt, postId } = body
    
    const updateData: Record<string, unknown> = {}
    
    if (alt !== undefined) updateData.alt = alt
    
    if (postId !== undefined) {
      if (postId === null) {
        updateData.post = { disconnect: true }
      } else {
        // Validate post exists
        const post = await prisma.post.findUnique({ where: { id: postId } })
        if (!post) {
          return NextResponse.json(
            { success: false, error: 'Post not found' },
            { status: 400 }
          )
        }
        updateData.post = { connect: { id: postId } }
      }
    }
    
    const media = await prisma.media.update({
      where: { id: mediaId },
      data: updateData,
      include: {
        post: {
          select: { id: true, title: true, slug: true },
        },
      },
    })
    
    return NextResponse.json({
      success: true,
      data: media,
      message: 'Media updated successfully',
    })
  } catch (error) {
    console.error('Error updating media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update media' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/media/[id]
 * Delete a media file (requires authentication)
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
    const mediaId = parseInt(id)
    
    if (isNaN(mediaId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid media ID' },
        { status: 400 }
      )
    }
    
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
    })
    
    if (!media) {
      return NextResponse.json(
        { success: false, error: 'Media not found' },
        { status: 404 }
      )
    }
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', 'uploads', media.path)
    try {
      await fs.unlink(filePath)
    } catch (err) {
      console.warn(`Could not delete file: ${media.path}`, err)
      // Continue with database deletion even if file doesn't exist
    }
    
    // Delete from database
    await prisma.media.delete({ where: { id: mediaId } })
    
    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}
