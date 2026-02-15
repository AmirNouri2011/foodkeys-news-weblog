import { NextRequest, NextResponse } from 'next/server'
import { validateRequest, generateTOTPSecret, getTOTPUri } from '@/lib/auth'

export const runtime = 'nodejs'

/**
 * POST /api/auth/verify
 * Verify API key and TOTP code
 */
export async function POST(request: NextRequest) {
  const authResult = validateRequest(request)
  
  if (authResult.success) {
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
    })
  }
  
  return NextResponse.json(
    { success: false, error: authResult.error },
    { status: 401 }
  )
}

/**
 * GET /api/auth/verify
 * Get authentication info (only in development)
 */
export async function GET() {
  // Only allow in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'Not available in production' },
      { status: 403 }
    )
  }

  // Generate a new TOTP secret for setup purposes
  const secret = generateTOTPSecret()
  const uri = getTOTPUri(secret, 'admin', 'FoodKeys')

  return NextResponse.json({
    success: true,
    message: 'Development mode authentication info',
    devCredentials: {
      apiKey: 'armo',
      totpCode: '123456',
    },
    setupInfo: {
      generatedSecret: secret,
      totpUri: uri,
      note: 'Use this secret in your .env file as TOTP_SECRET for production',
    },
    headers: {
      required: ['X-API-Key', 'X-TOTP-Code'],
      example: {
        'X-API-Key': 'armo',
        'X-TOTP-Code': '123456',
      },
    },
  })
}
