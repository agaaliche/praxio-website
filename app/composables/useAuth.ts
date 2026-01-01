import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signInWithCustomToken as firebaseSignInWithCustomToken,
  applyActionCode as firebaseApplyActionCode,
  checkActionCode as firebaseCheckActionCode,
  type User as FirebaseUser,
  type Auth
} from 'firebase/auth'
import { getFirebaseAuth } from '~/plugins/01.firebase.client'

// Types
export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: string | null
  accountOwnerId: string | null
  userId: number | null
}

export interface AuthResult {
  success: boolean
  user?: FirebaseUser
  error?: string
  message?: string
  emailSent?: boolean
}

// State
const user = ref<AuthUser | null>(null)
const isAuthenticated = ref(false)
const userRole = ref<string | null>(null)
const userClaims = ref<Record<string, any> | null>(null)
const isLoading = ref(true)
const authInitialized = ref(false)

// Get auth instance - uses the exported function from firebase plugin
const getAuthInstance = (): Auth => {
  return getFirebaseAuth()
}

// Error messages
const getErrorMessage = (code: string): string => {
  const messages: Record<string, string> = {
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/email-already-in-use': 'An account already exists with this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid credentials. Please try again.',
  }
  return messages[code] || 'An error occurred. Please try again.'
}

// API base URL
const getApiBaseUrl = (): string => {
  const config = useRuntimeConfig()
  return config.public.apiUrl as string || 'https://inr-backend-pq7nv4e3fq-uk.a.run.app'
}

export function useAuth() {
  // Initialize auth state listener (call once on app init)
  const initAuth = () => {
    // Guard against double initialization
    if (authInitialized.value) {
      return
    }
    authInitialized.value = true
    
    const auth = getAuthInstance()
    
    onAuthStateChanged(auth, async (firebaseUser) => {
      isLoading.value = true
      
      if (firebaseUser) {
        console.log('🔐 Auth state changed - Firebase user:', {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        })

        try {
          const idTokenResult = await firebaseUser.getIdTokenResult()
          userClaims.value = idTokenResult.claims as Record<string, any>
          userRole.value = (idTokenResult.claims.role as string) || null

          const userEmail = firebaseUser.email || (idTokenResult.claims.email as string)

          user.value = {
            uid: firebaseUser.uid,
            email: userEmail,
            displayName: firebaseUser.displayName || userEmail?.split('@')[0] || null,
            photoURL: firebaseUser.photoURL,
            role: userRole.value,
            accountOwnerId: (idTokenResult.claims.accountOwnerId as string) || null,
            userId: (idTokenResult.claims.userId as number) || null
          }

          console.log('👤 User object set:', user.value)
        } catch (error) {
          console.error('Error getting user claims:', error)
          user.value = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null,
            photoURL: firebaseUser.photoURL,
            role: null,
            accountOwnerId: null,
            userId: null
          }
        }
        isAuthenticated.value = true
      } else {
        console.log('🚪 User signed out')
        user.value = null
        userRole.value = null
        userClaims.value = null
        isAuthenticated.value = false
      }
      
      isLoading.value = false
    })
  }

  // Sign up with email and password
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string = ''
  ): Promise<AuthResult> => {
    try {
      const auth = getAuthInstance()
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      if (displayName) {
        await updateProfile(userCredential.user, { displayName })
      }

      await sendEmailVerification(userCredential.user)

      return {
        success: true,
        user: userCredential.user,
        emailSent: true
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: getErrorMessage(error.code)
      }
    }
  }

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const auth = getAuthInstance()
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Create session on server
      try {
        const token = await userCredential.user.getIdToken()
        await $fetch('/api/sessions/create', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
        // Session created - custom claims will be picked up on next token refresh
      } catch (sessionError) {
        console.error('Failed to create session:', sessionError)
        // Don't fail login if session creation fails
      }
      
      return {
        success: true,
        user: userCredential.user
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: getErrorMessage(error.code)
      }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async (): Promise<AuthResult> => {
    try {
      const auth = getAuthInstance()
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Create session on server
      try {
        const token = await result.user.getIdToken()
        await $fetch('/api/sessions/create', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
        // Session created - custom claims will be picked up on next token refresh
      } catch (sessionError) {
        console.error('Failed to create session:', sessionError)
        // Don't fail login if session creation fails
      }
      
      return {
        success: true,
        user: result.user
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: getErrorMessage(error.code)
      }
    }
  }

  // Sign out
  const signOutUser = async (): Promise<AuthResult> => {
    try {
      const auth = getAuthInstance()
      await signOut(auth)
      user.value = null
      userRole.value = null
      userClaims.value = null
      isAuthenticated.value = false
      
      // Clear subscription state
      try {
        const { clearSubscription } = useSubscription()
        clearSubscription()
      } catch (e) {
        // Ignore if subscription composable not available
      }
      
      // SSO: Also logout from retroact (service app)
      // Use hidden iframe to trigger retroact logout without redirecting
      if (typeof window !== 'undefined') {
        try {
          const retroactLogoutUrl = 'http://localhost:8081/sso-logout'
          const iframe = document.createElement('iframe')
          iframe.style.display = 'none'
          iframe.src = retroactLogoutUrl
          document.body.appendChild(iframe)
          
          // Remove iframe after logout completes
          setTimeout(() => {
            document.body.removeChild(iframe)
          }, 2000)
        } catch (e) {
          console.log('Could not logout from retroact:', e)
          // Don't fail praxio logout if retroact logout fails
        }
      }
      
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: getErrorMessage(error.code)
      }
    }
  }

  // Sign in with custom token (for magic links)
  const signInWithCustomToken = async (token: string): Promise<AuthResult> => {
    try {
      const auth = getAuthInstance()
      const userCredential = await firebaseSignInWithCustomToken(auth, token)
      return {
        success: true,
        user: userCredential.user
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: getErrorMessage(error.code)
      }
    }
  }

  // Send password reset email via backend (for custom branding)
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const response = await $fetch<{ success: boolean; message: string }>(
        '/api/auth/reset-password',
        {
          method: 'POST',
          body: { email }
        }
      )
      return {
        success: response.success || true,
        message: response.message
      }
    } catch (error: any) {
      return {
        success: false,
        error: 'network-error',
        message: error.message || 'Failed to send password reset email.'
      }
    }
  }

  // Apply action code (verify email, etc.)
  const applyActionCode = async (code: string): Promise<AuthResult> => {
    try {
      const auth = getAuthInstance()
      await firebaseApplyActionCode(auth, code)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: getErrorMessage(error.code)
      }
    }
  }

  // Check action code
  const checkActionCode = async (code: string) => {
    try {
      const auth = getAuthInstance()
      const info = await firebaseCheckActionCode(auth, code)
      return { success: true, info }
    } catch (error: any) {
      return {
        success: false,
        error: error.code,
        message: getErrorMessage(error.code)
      }
    }
  }

  // Refresh user claims
  const refreshUserClaims = async (): Promise<boolean> => {
    const auth = getAuthInstance()
    const currentUser = auth.currentUser
    
    if (!currentUser) {
      console.log('⚠️ No user to refresh claims for')
      return false
    }

    try {
      console.log('🔄 Refreshing user claims...')
      await currentUser.reload()
      const idTokenResult = await currentUser.getIdTokenResult(true)

      const previousRole = userRole.value
      userClaims.value = idTokenResult.claims as Record<string, any>
      userRole.value = (idTokenResult.claims.role as string) || null

      if (user.value) {
        user.value = {
          ...user.value,
          role: userRole.value,
          accountOwnerId: (idTokenResult.claims.accountOwnerId as string) || null,
          userId: (idTokenResult.claims.userId as number) || null
        }
      }

      console.log('✅ Claims refreshed:', { previousRole, newRole: userRole.value })
      return true
    } catch (error) {
      console.error('Error refreshing claims:', error)
      return false
    }
  }

  // Get current Firebase user
  const getCurrentUser = (): FirebaseUser | null => {
    const auth = getAuthInstance()
    return auth.currentUser
  }

  // Get ID token for API calls
  const getIdToken = async (): Promise<string | null> => {
    const currentUser = getCurrentUser()
    if (!currentUser) return null
    try {
      return await currentUser.getIdToken()
    } catch {
      return null
    }
  }

  // Get auth headers for API calls (convenience function)
  const getAuthHeaders = async (): Promise<{ Authorization: string }> => {
    const token = await getIdToken()
    return { Authorization: `Bearer ${token}` }
  }

  // Permission helpers
  const isViewer = computed(() => userRole.value === 'viewer')
  const isEditor = computed(() => userRole.value === 'editor')
  const isAccountOwner = computed(() => !userRole.value && isAuthenticated.value)
  const canEdit = computed(() => isAccountOwner.value || isEditor.value)
  const canManageUsers = computed(() => isAccountOwner.value)

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    userRole: readonly(userRole),
    userClaims: readonly(userClaims),

    // Auth methods
    initAuth,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOutUser,
    signInWithCustomToken,
    resetPassword,
    applyActionCode,
    checkActionCode,
    refreshUserClaims,
    getCurrentUser,
    getIdToken,
    getAuthHeaders,

    // Permission helpers
    isViewer,
    isEditor,
    isAccountOwner,
    canEdit,
    canManageUsers
  }
}
