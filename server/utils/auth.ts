import { H3Event, createError, getHeader } from 'h3'
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth'
import { getFirebaseApp } from './firebase'

export interface AuthenticatedUser {
  uid: string
  email: string
  role?: string
  accountOwnerId?: string
  userId?: number
}

/**
 * Verify Firebase ID token from Authorization header
 * Returns the decoded user info or throws an error
 */
export async function verifyAuth(event: H3Event): Promise<AuthenticatedUser> {
  const authHeader = getHeader(event, 'authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid authorization header'
    })
  }
  
  const token = authHeader.substring(7)
  
  try {
    const app = getFirebaseApp()
    if (!app) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Firebase Admin SDK not initialized'
      })
    }
    const auth = getAuth(app)
    
    // Verify the Firebase ID token
    const decodedToken: DecodedIdToken = await auth.verifyIdToken(token)
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role as string | undefined,
      accountOwnerId: decodedToken.accountOwnerId as string | undefined
    }
  } catch (error: any) {
    console.error('Auth verification error:', error.message || error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: error.message || 'Invalid token'
    })
  }
}

/**
 * Get the effective account owner ID for queries
 * For account owners, this is their own UID
 * For invited users, this is their accountOwnerId claim
 */
export function getEffectiveAccountOwnerId(user: AuthenticatedUser): string {
  return user.accountOwnerId || user.uid
}

/**
 * Check if user is account owner (has no role = superuser)
 */
export function isAccountOwner(user: AuthenticatedUser): boolean {
  return !user.role
}

/**
 * Check if user can edit (account owner or editor)
 */
export function canEdit(user: AuthenticatedUser): boolean {
  return isAccountOwner(user) || user.role === 'editor'
}

/**
 * Check if user is viewer (read-only)
 */
export function isViewer(user: AuthenticatedUser): boolean {
  return user.role === 'viewer'
}
