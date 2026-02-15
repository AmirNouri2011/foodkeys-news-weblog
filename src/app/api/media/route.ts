import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { validateRequest } from '@/lib/auth'
import fs from 'fs/promises'
import path from 'path'

// Allowed file types for upload
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * GET /api/media
 * List all media files
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const postId = searchParams.get('postId')
    
    const where: Record<string, unknown> = {}
    if (postId) {
      where.postId = parseInt(postId)
    }
    
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      prisma.media.count({ where }),
    ])
    
    return NextResponse.json({
      success: true,
      data: media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
 * POST /api/media
 * Upload a new media file (requires authentication)
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
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const postId = formData.get('postId') as string | null
    const alt = formData.get('alt') as string | null
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }
    
    // Generate unique filename
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const timestamp = now.getTime()
    const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`
    const safeName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .replace(/-+/g, '-')
      .replace(ext, '')
    const filename = `${safeName}-${timestamp}${ext}`
    
    // Create directory structure: uploads/YYYY/MM/
    const relativePath = `${year}/${month}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', relativePath)
    
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true })
    
    // Save file
    const filePath = path.join(uploadDir, filename)
    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filePath, buffer)
    
    // Get image dimensions if applicable
    let width: number | null = null
    let height: number | null = null
    
    // Try to get dimensions using sharp (if available)
    try {
      const sharp = (await import('sharp')).default
      const metadata = await sharp(buffer).metadata()
      width = metadata.width || null
      height = metadata.height || null
    } catch {
      // Sharp not available or not an image, continue without dimensions
    }
    
    // Save to database
    const storagePath = `${relativePath}/${filename}`
    const publicUrl = `/uploads/${storagePath}`
    
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        path: storagePath,
        url: publicUrl,
        mimeType: file.type,
        size: file.size,
        width,
        height,
        alt,
        ...(postId && { post: { connect: { id: parseInt(postId) } } }),
      },
    })
    
    return NextResponse.json({
      success: true,
      data: media,
      message: 'File uploaded successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
