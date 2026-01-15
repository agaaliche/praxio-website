/**
 * POST /api/admin/users
 * Create a new Firebase user (siteadmin only)
 */
import { defineEventHandler, readBody, createError } from 'h3'
import { getAuth } from 'firebase-admin/auth'
import { verifySiteAdmin } from '../../../utils/auth'
import { getFirebaseApp } from '../../../utils/firebase'

export default defineEventHandler(async (event) => {
  // Verify siteadmin access
  await verifySiteAdmin(event)
  
  const body = await readBody(event)
  const { email, password, displayName, makeSiteAdmin } = body
  
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Email and password are required'
    })
  }
  
  try {
    const app = getFirebaseApp()
    const auth = getAuth(app)
    
    // Create Firebase user
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false
    })
    
    // Set custom claims
    const claims: Record<string, any> = { userId: userRecord.uid }
    if (makeSiteAdmin) {
      claims.siteadmin = true
    }
    await auth.setCustomUserClaims(userRecord.uid, claims)
    
    console.log(`✅ Admin created user: ${email}`)
    
    return { 
      success: true, 
      message: 'User created successfully',
      uid: userRecord.uid
    }
  } catch (error: any) {
    console.error('❌ Error creating user:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Failed to create user'
    })
  }
})
