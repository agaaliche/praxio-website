import { defineEventHandler, readBody, createError, getHeader } from 'h3'
import jwt from 'jsonwebtoken'
import { getFirebaseAdmin } from '../../utils/firebase-admin'
import { queryOne } from '../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // Get secret directly from environment
    const secret = process.env.SSO_SECRET || process.env.JWT_SECRET || 'R3tr0@ct-SSO-S3cr3t-2025!Pr0duct10n'
    console.log('🔑 Using secret for signing:', secret.substring(0, 10) + '...')
    
    // Get Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        message: 'Unauthorized - No token provided'
      })
    }

    const idToken = authHeader.substring(7)

    // Get Firebase Admin instance
    const admin = getFirebaseAdmin()

    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Get user data
    const userRecord = await admin.auth().getUser(uid)

    // Get custom claims (role, accountOwnerId, etc.)
    let customClaims = userRecord.customClaims || {}
    
    console.log('📋 Custom claims from Firebase:', customClaims)
    
    // If custom claims are missing role/accountOwnerId, try to get from database
    if (!customClaims.role || !customClaims.accountOwnerId) {
      console.log('⚠️ Custom claims missing role/accountOwnerId, checking database...')
      
      // First check if this is a team member (invited user)
      const authorizedUser = await queryOne<any>(
        `SELECT id, email, first_name, last_name, role, account_owner_id
         FROM authorized_users 
         WHERE email = ? AND status = 'active'`,
        [userRecord.email]
      )
      
      if (authorizedUser) {
        console.log('✅ Found authorized_user:', authorizedUser)
        // Update custom claims with DB values
        customClaims = {
          ...customClaims,
          role: authorizedUser.role,
          accountOwnerId: authorizedUser.account_owner_id, // DB column name
          userId: authorizedUser.id,
          firstName: authorizedUser.first_name,
          lastName: authorizedUser.last_name
        }
        
        // Also update Firebase custom claims for future requests
        await admin.auth().setCustomUserClaims(uid, customClaims)
        console.log('✅ Updated Firebase custom claims')
      } else {
        // Check if this is an account owner
        const owner = await queryOne<any>(
          `SELECT userId, userName, userLastName, userEmail 
           FROM users 
           WHERE userId = ?`,
          [uid]
        )
        
        if (owner) {
          console.log('✅ Found account owner:', owner)
          // Account owners should NOT have a role claim
          // Role is only for invited team members (viewer/editor)
          // Create fresh claims object WITHOUT role
          customClaims = {
            accountOwnerId: owner.userId,
            userId: owner.userId,
            firstName: owner.userName,
            lastName: owner.userLastName
            // Explicitly NO role property
          }
          
          // Update Firebase custom claims
          await admin.auth().setCustomUserClaims(uid, customClaims)
          console.log('✅ Updated Firebase custom claims for owner (no role)')
        }
      }
    }

    // Generate SSO token (short-lived, 5 minutes) with ALL custom claims
    const ssoToken = jwt.sign(
      {
        uid: uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: customClaims.role || null,
        accountOwnerId: customClaims.accountOwnerId || null,
        userId: customClaims.userId || null,
        firstName: customClaims.firstName || null,
        lastName: customClaims.lastName || null,
        type: 'sso'
      },
      secret,
      { expiresIn: '5m' }
    )

    console.log('✅ SSO token generated for:', { 
      uid, 
      email: userRecord.email, 
      role: customClaims.role,
      accountOwnerId: customClaims.accountOwnerId,
      allClaims: customClaims
    })

    return {
      ssoToken,
      expiresIn: 300 // 5 minutes in seconds
    }
  } catch (error: any) {
    console.error('SSO token generation error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to generate SSO token'
    })
  }
})
