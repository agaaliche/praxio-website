/**
 * Firebase Admin SDK initialization
 * Shared across auth.ts, email.ts and other server utilities
 */
import { initializeApp, cert, getApps, type App } from 'firebase-admin/app'

let adminApp: App | null = null
let initialized = false

/**
 * Get or initialize the Firebase Admin SDK app
 * Uses service account from FIREBASE_SERVICE_ACCOUNT env var if available
 */
export function getFirebaseApp(): App | null {
  if (initialized) return adminApp
  initialized = true
  
  // Check if already initialized by another module
  const apps = getApps()
  if (apps.length > 0) {
    adminApp = apps[0]
    console.log('✓ Firebase Admin already initialized')
    return adminApp
  }
  
  const config = useRuntimeConfig()
  
  // Option 1: Service account from environment variable (JSON string) - Recommended
  if (config.firebaseServiceAccount) {
    try {
      const serviceAccount = JSON.parse(config.firebaseServiceAccount)
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id
      })
      console.log('✓ Firebase Admin initialized with service account credentials')
      return adminApp
    } catch (parseError: any) {
      console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT:', parseError.message)
    }
  }
  
  // Option 2: Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS env var)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      adminApp = initializeApp({
        projectId: 'retroact-fb'
      })
      console.log('✓ Firebase Admin initialized with application default credentials')
      return adminApp
    } catch (error: any) {
      console.error('❌ Error initializing with ADC:', error.message)
    }
  }
  
  // Option 3: Initialize without credentials (limited functionality - only token verification)
  try {
    adminApp = initializeApp({
      projectId: 'retroact-fb'
    })
    console.log('⚠️ Firebase Admin initialized without credentials (limited functionality)')
    console.log('   Firestore/email sending will NOT work')
    console.log('   Set FIREBASE_SERVICE_ACCOUNT env var for full functionality')
    return adminApp
  } catch (error: any) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message)
    return null
  }
}

/**
 * Check if Firebase has full credentials (can use Firestore)
 */
export function hasFirebaseCredentials(): boolean {
  const config = useRuntimeConfig()
  return !!(config.firebaseServiceAccount || process.env.GOOGLE_APPLICATION_CREDENTIALS)
}
