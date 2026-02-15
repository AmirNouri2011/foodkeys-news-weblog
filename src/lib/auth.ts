import { authenticator } from 'otplib'
import { NextRequest } from 'next/server'
import crypto from 'crypto'

// Configure TOTP settings
authenticator.options = {
  digits: 6,
  step: 30, // 30 seconds validity
  window: 1, // Allow 1 step before/after for time drift
}

// Dev mode credentials
const DEV_API_KEY = 'armo'
const DEV_TOTP_CODE = '123456'

export interface AuthResult {
  success: boolean
  error?: string
}

// RFC4648 Base32 encoding (no padding), for TOTP secrets.
// We implement this to avoid depending on packages that use deprecated `new Buffer()`
// which can crash under Next.js bundling in development.
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

function base32EncodeRfc4648NoPadding(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

/**
 * Validates API Key
 */
export function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false

  // Dev mode: accept 'armo'
  if (process.env.NODE_ENV === 'development' && apiKey === DEV_API_KEY) {
    return true
  }

  // Production: validate against environment variable
  const validApiKey = process.env.API_KEY
  if (!validApiKey) {
    console.error('API_KEY environment variable is not set')
    return false
  }

  return apiKey === validApiKey
}

/**
 * Validates TOTP code
 */
export function validateTOTP(totpCode: string | null): boolean {
  if (!totpCode) return false

  // Dev mode: accept '123456'
  if (process.env.NODE_ENV === 'development' && totpCode === DEV_TOTP_CODE) {
    return true
  }

  // Production: validate against TOTP secret
  const secret = process.env.TOTP_SECRET
  if (!secret) {
    console.error('TOTP_SECRET environment variable is not set')
    return false
  }

  try {
    return authenticator.verify({ token: totpCode, secret })
  } catch (error) {
    console.error('TOTP verification error:', error)
    return false
  }
}

/**
 * Validates both API Key and TOTP
 */
export function validateAuth(apiKey: string | null, totpCode: string | null): AuthResult {
  if (!validateApiKey(apiKey)) {
    return { success: false, error: 'Invalid API key' }
  }

  if (!validateTOTP(totpCode)) {
    return { success: false, error: 'Invalid TOTP code' }
  }

  return { success: true }
}

/**
 * Extract auth headers from request
 */
export function extractAuthFromRequest(request: NextRequest): { apiKey: string | null; totpCode: string | null } {
  const apiKey = request.headers.get('X-API-Key') || request.headers.get('x-api-key')
  const totpCode = request.headers.get('X-TOTP-Code') || request.headers.get('x-totp-code')
  
  return { apiKey, totpCode }
}

/**
 * Validates request authentication
 */
export function validateRequest(request: NextRequest): AuthResult {
  const { apiKey, totpCode } = extractAuthFromRequest(request)
  return validateAuth(apiKey, totpCode)
}

/**
 * Generate a new TOTP secret (useful for setup)
 */
export function generateTOTPSecret(): string {
  // 20 bytes => 32 Base32 chars (common default for TOTP secrets)
  const bytes = crypto.randomBytes(20)
  return base32EncodeRfc4648NoPadding(bytes)
}

/**
 * Generate current TOTP code from secret (useful for testing)
 */
export function generateTOTPCode(secret: string): string {
  return authenticator.generate(secret)
}

/**
 * Get TOTP URI for QR code generation
 */
export function getTOTPUri(secret: string, accountName: string, issuer: string = 'FoodKeys'): string {
  return authenticator.keyuri(accountName, issuer, secret)
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}

/**
 * Higher-order function to protect API routes
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = validateRequest(request)
    
    if (!authResult.success) {
      return unauthorizedResponse(authResult.error)
    }
    
    return handler(request, ...args)
  }
}
