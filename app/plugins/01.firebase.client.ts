import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth'

// Firebase configuration - shared with inrManager (retroact.app)
const firebaseConfig = {
  apiKey: "AIzaSyD85SpficYQHZ38cNym0lpCFv2UrUj9dl8",
  authDomain: "retroact-fb.firebaseapp.com",
  projectId: "retroact-fb",
  storageBucket: "retroact-fb.firebasestorage.app",
  messagingSenderId: "3766473485",
  appId: "1:3766473485:web:f47ca5c85a89f226781644"
}

let app: FirebaseApp | null = null
let auth: Auth | null = null
let persistenceSet = false

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    if (!app) {
      app = initializeApp(firebaseConfig)
    }
    auth = getAuth(app)
    
    // Set persistence immediately if not already set
    if (!persistenceSet) {
      persistenceSet = true
      setPersistence(auth, browserLocalPersistence)
        .then(() => console.log('🔐 Firebase persistence set to browserLocalPersistence'))
        .catch((error) => {
          console.error('Failed to set persistence:', error)
          // Try IndexedDB as fallback
          return setPersistence(auth!, indexedDBLocalPersistence)
        })
    }
  }
  return auth
}

export default defineNuxtPlugin(async () => {
  // Initialize Firebase eagerly
  const firebaseApp = initializeApp(firebaseConfig)
  const firebaseAuth = getAuth(firebaseApp)
  
  // Set persistence BEFORE any auth operations
  try {
    await setPersistence(firebaseAuth, browserLocalPersistence)
    console.log('✅ Firebase Auth persistence configured: browserLocalPersistence')
  } catch (error) {
    console.error('❌ Failed to set browserLocalPersistence:', error)
    // Fallback to IndexedDB
    try {
      await setPersistence(firebaseAuth, indexedDBLocalPersistence)
      console.log('✅ Firebase Auth persistence configured: indexedDBLocalPersistence (fallback)')
    } catch (fallbackError) {
      console.error('❌ Failed to set any persistence:', fallbackError)
    }
  }
  
  persistenceSet = true
  app = firebaseApp
  auth = firebaseAuth

  return {
    provide: {
      firebase: firebaseApp,
      auth: firebaseAuth
    }
  }
})
