import { H3Event, createError, getHeader } from 'h3'
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth'
import { getFirebaseApp } from './firebase'
import { queryOne } from './database'

export interface AuthenticatedUser {
  uid: string
  email: string
  role?: string
  accountOwnerId?: string
  userId?: number
  dbRole?: string | null // Role from database (source of truth)
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
    
    const user: AuthenticatedUser = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role as string | undefined,
      accountOwnerId: decodedToken.accountOwnerId as string | undefined
    }

    // Fetch role from database (source of truth)
    await fetchDatabaseRole(user)
    
    return user
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
 * Fetch user role from database (source of truth)
 * Checks users table first (account owners), then authorized_users table
 */
async function fetchDatabaseRole(user: AuthenticatedUser): Promise<void> {
  try {
    // First check if user exists in users table (account owner)
    const userRecord = await queryOne<any>(
      'SELECT userId FROM users WHERE userId = ?',
      [user.uid]
    )
    
    if (userRecord) {
      // Found in users table = account owner (no role)
      user.dbRole = null
      console.log('✅ Backend: User is account owner (found in users table)', user.uid)
      return
    }
    
    // Not in users table, check authorized_users table
    const accountOwnerId = user.accountOwnerId || user.uid
    const authorizedUser = await queryOne<any>(
      'SELECT role FROM authorized_users WHERE account_owner_id = ? AND email = ? AND status = "active"',
      [accountOwnerId, user.email]
    )
    
    if (authorizedUser) {
      // Found in authorized_users = team member with role
      user.dbRole = authorizedUser.role
      console.log('✅ Backend: User is team member with role:', authorizedUser.role, user.email)
    } else {
      // Not found in either table - use token role as fallback
      user.dbRole = user.role || null
      console.log('⚠️ Backend: User not found in DB, using token role:', user.role, user.email)
    }
  } catch (error) {
    console.error('Failed to fetch database role:', error)
    // On error, fall back to token role
    user.dbRole = user.role || null
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
 * Uses database role as source of truth
 */
export function isAccountOwner(user: AuthenticatedUser): boolean {
  // Use dbRole if available (source of truth), otherwise fall back to token role
  const effectiveRole = user.dbRole !== undefined ? user.dbRole : user.role
  const isOwner = !effectiveRole
  console.log('🔍 Backend isAccountOwner check:', { 
    uid: user.uid, 
    email: user.email,
    tokenRole: user.role, 
    dbRole: user.dbRole, 
    effectiveRole,
    isOwner 
  })
  return isOwner
}

/**
 * Check if user can edit (account owner or editor)
 */
export function canEdit(user: AuthenticatedUser): boolean {
  const effectiveRole = user.dbRole !== undefined ? user.dbRole : user.role
  return !effectiveRole || effectiveRole === 'editor'
}

/**
 * Check if user is viewer (read-only)
 */
export function isViewer(user: AuthenticatedUser): boolean {
  const effectiveRole = user.dbRole !== undefined ? user.dbRole : user.role
  return effectiveRole === 'viewer'
}

/**
 * Verify that the user is a site admin
 * This checks the siteadmin custom claim from Firebase
 */
export async function verifySiteAdmin(event: H3Event): Promise<AuthenticatedUser> {
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
    const decodedToken = await auth.verifyIdToken(token)
    
    // Check if user has siteadmin claim
    if (decodedToken.siteadmin !== true) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        message: 'Site admin access required'
      })
    }
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role as string | undefined,
      accountOwnerId: decodedToken.accountOwnerId as string | undefined
    }
  } catch (error: any) {
    if (error.statusCode === 403) throw error
    
    console.error('Auth verification error:', error.message || error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: error.message || 'Invalid token'
    })
  }
}
