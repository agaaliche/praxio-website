/**
 * Firebase Admin SDK wrapper
 * Provides getFirebaseAdmin() for consistency with inrManager codebase
 */
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getFirebaseApp } from './firebase'

/**
 * Get the Firebase Admin SDK instance with auth and firestore methods
 * Initializes app if needed and returns an object with admin methods
 */
export function getFirebaseAdmin() {
  // Ensure app is initialized
  const app = getFirebaseApp()
  
  return {
    auth: () => getAuth(app!),
    firestore: () => getFirestore(app!)
  }
}
