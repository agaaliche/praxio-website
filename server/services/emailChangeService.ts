/**
 * Email Change Service
 * Handles secure email change flow with custom tokens
 * Uses database for token storage (persists across restarts)
 * Copied from inrManager/backend/services/emailChangeService.js
 */
import { execute, queryOne, query } from '../utils/database'
import crypto from 'crypto'

// Token expiry time: 1 hour
const TOKEN_EXPIRY_MS = 60 * 60 * 1000

/**
 * Initialize the email_change_tokens table if it doesn't exist
 */
export const initTable = async () => {
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS email_change_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(64) NOT NULL UNIQUE,
        user_id VARCHAR(128) NOT NULL,
        current_email VARCHAR(255) NOT NULL,
        new_email VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_user_id (user_id),
        INDEX idx_expires_at (expires_at)
      )
    `)
    console.log('✅ email_change_tokens table ready')
  } catch (error: any) {
    console.error('❌ Failed to create email_change_tokens table:', error.message)
  }
}

/**
 * Generate a secure token for email change verification
 */
const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create an email change request
 * Stores the token in database and returns it for email sending
 */
export const createEmailChangeRequest = async (
  userId: string, 
  currentEmail: string, 
  newEmail: string
): Promise<{ token: string; expiresAt: number }> => {
  console.log(`🔑 Creating email change request for user ${userId}`)
  console.log(`📧 Email change: ${currentEmail} -> ${newEmail}`)
  
  // Invalidate any existing tokens for this user
  await execute('DELETE FROM email_change_tokens WHERE user_id = ?', [userId])
  console.log(`🗑️ Cleared existing email change tokens for user ${userId}`)

  // Generate new token
  const token = generateSecureToken()
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS)
  
  // Format datetime for MySQL (YYYY-MM-DD HH:MM:SS)
  const expiresAtFormatted = expiresAt.toISOString().slice(0, 19).replace('T', ' ')

  console.log(`🔐 Generated token: ${token.substring(0, 10)}...`)
  console.log(`⏰ Token expires at: ${expiresAt.toISOString()}`)

  // Store token in database
  await execute(
    'INSERT INTO email_change_tokens (token, user_id, current_email, new_email, expires_at) VALUES (?, ?, ?, ?, ?)',
    [token, userId, currentEmail, newEmail, expiresAtFormatted]
  )

  console.log(`📝 Token stored in database`)

  return { token, expiresAt: expiresAt.getTime() }
}

/**
 * Verify an email change token
 * Returns the token data if valid, null otherwise
 */
export const verifyEmailChangeToken = async (token: string): Promise<{
  userId: string
  currentEmail: string
  newEmail: string
} | null> => {
  console.log(`🔍 Looking up email change token: ${token ? token.substring(0, 10) + '...' : 'null'}`)
  
  // Find token and check expiry
  const tokenData = await queryOne<any>(
    `SELECT user_id, current_email, new_email, expires_at 
     FROM email_change_tokens 
     WHERE token = ? AND expires_at > NOW()`,
    [token]
  )
  
  if (!tokenData) {
    console.log('❌ Token not found or expired')
    return null
  }
  
  console.log(`✅ Token valid for user ${tokenData.user_id}`)
  
  return {
    userId: tokenData.user_id,
    currentEmail: tokenData.current_email,
    newEmail: tokenData.new_email
  }
}

/**
 * Complete email change (delete token after use)
 */
export const completeEmailChange = async (token: string): Promise<void> => {
  await execute('DELETE FROM email_change_tokens WHERE token = ?', [token])
  console.log('🗑️ Email change token deleted after use')
}

/**
 * Clean up expired tokens (can be called periodically)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await execute('DELETE FROM email_change_tokens WHERE expires_at < NOW()')
  const deleted = (result as any).affectedRows || 0
  if (deleted > 0) {
    console.log(`🧹 Cleaned up ${deleted} expired email change tokens`)
  }
  return deleted
}
