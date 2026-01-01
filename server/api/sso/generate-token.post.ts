import { defineEventHandler, readBody, createError, getHeader } from 'h3'
import jwt from 'jsonwebtoken'
import { getFirebaseAdmin } from '../../utils/firebase-admin'

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

    // Generate SSO token (short-lived, 5 minutes)
    const ssoToken = jwt.sign(
      {
        uid: uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        type: 'sso'
      },
      secret,
      { expiresIn: '5m' }
    )

    console.log('✅ SSO token generated for:', { uid, email: userRecord.email })

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
