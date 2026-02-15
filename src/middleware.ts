import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// API routes that require authentication
const PROTECTED_API_ROUTES = [
  '/api/posts',
  '/api/categories',
  '/api/tags',
  '/api/media',
]

// API routes that are always public (read-only endpoints)
const PUBLIC_API_ROUTES = [
  '/api/auth/verify',
]

// Dev mode credentials
const DEV_API_KEY = 'armo'
const DEV_TOTP_CODE = '123456'

function isProtectedRoute(pathname: string): boolean {
  // Check if it's a public route first
  if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
    return false
  }
  
  // Check if it's a protected API route
  return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
}

function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false

  // Dev mode: accept 'armo'
  if (process.env.NODE_ENV === 'development' && apiKey === DEV_API_KEY) {
    return true
  }

  // Production: validate against environment variable
  return apiKey === process.env.API_KEY
}

function validateTOTPSimple(totpCode: string | null): boolean {
  if (!totpCode) return false

  // Dev mode: accept '123456'
  if (process.env.NODE_ENV === 'development' && totpCode === DEV_TOTP_CODE) {
    return true
  }

  // For production TOTP validation, we'll do it in the API route
  // since otplib doesn't work well in Edge runtime
  // Return true here and let the route handler do full validation
  return totpCode.length === 6 && /^\d{6}$/.test(totpCode)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Check if route requires authentication
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  // Allow GET requests to be public (read-only access)
  // Only POST, PUT, DELETE require authentication
  if (request.method === 'GET') {
    return NextResponse.next()
  }

  // Extract auth headers
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key')
  const totpCode = request.headers.get('X-TOTP-Code') || request.headers.get('x-totp-code')

  // Validate API key
  if (!validateApiKey(apiKey)) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Invalid API key' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Basic TOTP validation (format check)
  if (!validateTOTPSimple(totpCode)) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Invalid TOTP code' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  // Pass the validation status to the route handler
  const response = NextResponse.next()
  response.headers.set('X-Auth-Validated', 'true')
  
  return response
}

export const config = {
  matcher: '/api/:path*',
}
