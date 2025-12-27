/**
 * POST /api/users/auth/magic-link
 * Validate magic link and authenticate user
 * Copied from inrManager/backend/controllers/userManagement.controller.js - validateMagicLink
 */

import { queryOne, execute, query } from '../../../utils/database'
import { validateMagicLinkToken } from '../../../utils/magicLinkService'
import { getFirebaseApp } from '../../../utils/firebase'
import { getAuth } from 'firebase-admin/auth'
import { sendCredentialsEmail } from '../../../utils/email'
import crypto from 'crypto'

// Generate secure random password (same as inrManager)
const generatePassword = (): string => {
  const length = 12
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  let password = ''
  const values = crypto.randomBytes(length)
  for (let i = 0; i < length; i++) {
    password += charset[values[i] % charset.length]
  }
  return password
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ token: string }>(event)

  if (!body.token) {
    throw createError({
      statusCode: 400,
      message: 'Token is required'
    })
  }

  // Validate token
  const validation = validateMagicLinkToken(body.token)
  
  if (!validation.valid) {
    throw createError({
      statusCode: 401,
      message: validation.error || 'Invalid or expired token'
    })
  }

  try {
    // Find user by token - EXACT SAME as inrManager
    const user = await queryOne<any>(
      `SELECT * FROM authorized_users WHERE invite_token = ?`,
      [body.token]
    )

    if (!user) {
      throw createError({
        statusCode: 404,
        message: 'Invalid token or token already used'
      })
    }

    // Check if token expired (inrManager uses invite_expires_at)
    if (user.invite_expires_at && new Date() > new Date(user.invite_expires_at)) {
      throw createError({
        statusCode: 401,
        message: 'Token has expired'
      })
    }

    // Update user status to active
    await execute(
      'UPDATE authorized_users SET status = ? WHERE id = ?',
      ['active', user.id]
    )

    // Invalidate the token (one-time use)
    await execute(
      'UPDATE authorized_users SET invite_token = NULL WHERE id = ?',
      [user.id]
    )

    // Create Firebase UID for the user (same format as inrManager)
    const firebaseUid = `user_${user.id}_${user.account_owner_id}`
    
    console.log(`🔧 Processing magic link for ${user.email}, Firebase UID: ${firebaseUid}`)

    // Ensure password exists and is valid (inrManager uses 'password' column)
    if (!user.password || user.password.length < 6) {
      console.warn(`⚠️ User ${user.email} has invalid password, generating new one`)
      user.password = generatePassword()
      // Update password in database
      await execute(
        'UPDATE authorized_users SET password = ? WHERE id = ?',
        [user.password, user.id]
      )
    }

    const app = getFirebaseApp()
    if (!app) {
      throw createError({
        statusCode: 500,
        message: 'Firebase not configured'
      })
    }

    const auth = getAuth(app)
    let firebaseUserCreated = false

    // Create or update the user in Firebase Auth
    try {
      // Try to get existing user by UID first
      const existingUser = await auth.getUser(firebaseUid)
      console.log(`ℹ️ Firebase user ${firebaseUid} already exists with email: ${existingUser.email}`)
      
      // Update email if needed
      await auth.updateUser(firebaseUid, {
        email: user.email,
        displayName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        emailVerified: true
      })
      console.log(`✅ Updated Firebase user ${firebaseUid} with email ${user.email}`)
    } catch (getUserError: any) {
      if (getUserError.code === 'auth/user-not-found') {
        // User with this UID doesn't exist, try to create
        try {
          console.log(`🔧 Creating Firebase user:`, {
            email: user.email,
            uid: firebaseUid
          })
          
          // Step 1: Create user WITHOUT password first
          const newUser = await auth.createUser({
            uid: firebaseUid,
            email: user.email,
            displayName: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            emailVerified: true,
            disabled: false
          })
          
          console.log(`✅ Created Firebase user (step 1):`, {
            uid: newUser.uid,
            email: newUser.email
          })
          
          // Step 2: Update user with password to enable email/password authentication
          await auth.updateUser(firebaseUid, {
            password: user.password
          })
          
          console.log(`✅ Set password for user (step 2) - email/password auth now enabled`)
          
          firebaseUserCreated = true
        } catch (createError: any) {
          // If email already exists, this is an error
          if (createError.code === 'auth/email-already-exists') {
            console.error(`❌ Email ${user.email} already exists in Firebase`)
            throw createError({
              statusCode: 409,
              message: 'This email address already has a Praxio account. Users cannot be added to multiple organizations with the same email address.'
            })
          } else {
            throw createError
          }
        }
      } else {
        console.error('❌ Error checking Firebase user:', getUserError)
        throw getUserError
      }
    }

    // Create user profile in users table (copy from account owner like inrManager)
    const existingProfiles = await query<any[]>(
      'SELECT * FROM users WHERE userId = ? OR userEmail = ?',
      [firebaseUid, user.email]
    )
    
    if (!existingProfiles || existingProfiles.length === 0) {
      // Get account owner's profile to copy
      const ownerProfile = await queryOne<any>(
        'SELECT * FROM users WHERE userId = ?',
        [user.account_owner_id]
      )
      
      if (ownerProfile) {
        // Create new user profile with invited user's name and email, but copy other info from owner
        await execute(
          `INSERT INTO users (
            userId, organizationName, organizationType, address, userName, userLastName, userEmail,
            phoneNumber, city, country, postalCode, telephone, fax
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            firebaseUid,
            ownerProfile.organizationName,
            ownerProfile.organizationType,
            ownerProfile.address,
            user.first_name,
            user.last_name,
            user.email,
            ownerProfile.phoneNumber,
            ownerProfile.city,
            ownerProfile.country,
            ownerProfile.postalCode,
            ownerProfile.telephone,
            ownerProfile.fax
          ]
        )
        console.log(`✅ Created user profile for ${user.first_name} ${user.last_name} (${firebaseUid})`)
      } else {
        console.warn(`⚠️ Account owner profile not found for ${user.account_owner_id}`)
      }
    } else {
      console.log(`ℹ️ User profile already exists for ${user.email} (${firebaseUid})`)
    }

    // Set custom claims on the Firebase user
    await auth.setCustomUserClaims(firebaseUid, {
      email: user.email,
      role: user.role,
      accountOwnerId: user.account_owner_id,
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name
    })
    
    console.log(`✅ Set custom claims for ${firebaseUid}:`, {
      role: user.role,
      accountOwnerId: user.account_owner_id
    })

    // Create Firebase custom token for auto sign-in
    const firebaseToken = await auth.createCustomToken(firebaseUid, {
      email: user.email,
      role: user.role,
      accountOwnerId: user.account_owner_id,
      userId: user.id,
      firstName: user.first_name,
      lastName: user.last_name
    })

    // Send credentials email after successful validation
    try {
      // Get organization info from account owner
      const ownerProfile = await queryOne<any>(
        'SELECT organizationName, userName FROM users WHERE userId = ?',
        [user.account_owner_id]
      )
      
      await sendCredentialsEmail({
        email: user.email,
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        password: user.password,
        organizationName: ownerProfile?.organizationName || '',
        ownerFirstName: ownerProfile?.userName || '',
        lang: 'fr'
      })
      console.log('📧 Credentials email sent to', user.email)
    } catch (emailError) {
      console.error('⚠️ Failed to send credentials email:', emailError)
      // Don't fail the authentication if email fails
    }

    // Return user info and Firebase token for authentication
    return {
      success: true,
      message: 'Authentication successful',
      firebaseToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        accountOwnerId: user.account_owner_id
      }
    }

  } catch (error: any) {
    console.error('❌ Error in magic link validation:', error)
    
    // Re-throw if already a createError
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Error creating authentication token or user profile'
    })
  }
})
