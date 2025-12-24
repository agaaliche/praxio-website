import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

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

export const getFirebaseAuth = (): Auth => {
  if (!auth) {
    if (!app) {
      app = initializeApp(firebaseConfig)
    }
    auth = getAuth(app)
  }
  return auth
}

export default defineNuxtPlugin(() => {
  // Initialize Firebase eagerly
  const firebaseApp = initializeApp(firebaseConfig)
  const firebaseAuth = getAuth(firebaseApp)
  
  app = firebaseApp
  auth = firebaseAuth

  return {
    provide: {
      firebase: firebaseApp,
      auth: firebaseAuth
    }
  }
})
