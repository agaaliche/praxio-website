/**
 * Magic Link Service
 * Copied from inrManager/backend/services/magicLinkService.js
 * Uses JWT for secure token generation and validation
 */

import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const MAGIC_LINK_EXPIRY = '48h'

interface MagicLinkPayload {
  userId: number | null
  email: string
  accountOwnerId: string
  role: string
  type: 'magic-link'
  nonce: string
}

// Generate magic link token
export const generateMagicLinkToken = (
  userId: number | null,
  email: string,
  accountOwnerId: string,
  role: string
): string => {
  const token = jwt.sign(
    {
      userId,
      email,
      accountOwnerId,
      role,
      type: 'magic-link',
      nonce: crypto.randomBytes(16).toString('hex') // Add uniqueness
    },
    JWT_SECRET,
    { expiresIn: MAGIC_LINK_EXPIRY }
  )

  return token
}

// Validate magic link token
export const validateMagicLinkToken = (token: string): { valid: boolean; data?: MagicLinkPayload; error?: string } => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as MagicLinkPayload
    
    if (decoded.type !== 'magic-link') {
      throw new Error('Invalid token type')
    }

    return {
      valid: true,
      data: decoded
    }
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return {
        valid: false,
        error: 'Token has expired'
      }
    }
    
    return {
      valid: false,
      error: error.message
    }
  }
}

// Calculate token expiration date
export const getTokenExpiryDate = (): Date => {
  const expiryDate = new Date()
  expiryDate.setHours(expiryDate.getHours() + 48) // 48 hours from now
  return expiryDate
}

// Generate invite link URL
export const generateInviteLink = (token: string, baseUrl?: string): string => {
  const appUrl = baseUrl || process.env.SITE_URL || 'http://localhost:3000'
  return `${appUrl}/auth/magic-link?token=${token}`
}
