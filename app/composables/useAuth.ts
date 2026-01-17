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
const userRole = ref<string | null>(null) // Role from Firebase token (may be stale)
const dbRole = ref<string | null>(null) // Role from database (source of truth)
const dbRoleFetched = ref(false) // Track if DB role has been loaded
const userClaims = ref<Record<string, any> | null>(null)
const isSiteAdmin = ref(false) // Track if user is a site admin
const isLoading = ref(true)
const authInitialized = ref(false)

// Load dbRole from localStorage on init
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('praxio_db_role')
  if (stored !== null) {
    dbRole.value = stored === 'null' ? null : stored
    dbRoleFetched.value = true
  }
}

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
  // Fetch user role from database (source of truth)
  const fetchDatabaseRole = async (showNotification = false): Promise<{ success: boolean, needsSession?: boolean }> => {
    console.log('🔎 fetchDatabaseRole called, isAuthenticated:', isAuthenticated.value)

    if (!isAuthenticated.value) {
      dbRole.value = null
      dbRoleFetched.value = false
      if (typeof window !== 'undefined') {
        localStorage.removeItem('praxio_db_role')
      }
      return { success: false }
    }

    try {
      const auth = getAuthInstance()
      const currentUser = auth.currentUser
      if (!currentUser) {
        console.log('⚠️ No current user')
        return { success: false }
      }

      const token = await currentUser.getIdToken()
      console.log('📡 Fetching /api/users/current...')
      const response = await $fetch('/api/users/current', {
        headers: { Authorization: `Bearer ${token}` }
      })

      console.log('📥 API Response received:', {
        fullResponse: response,
        hasRole: 'role' in (response || {}),
        roleValue: (response as any)?.role,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : []
      })

      // Get the role from API response - null means account owner
      const newRole = (response as any).role || null
      const previousRole = dbRole.value
      const roleChanged = dbRoleFetched.value && previousRole !== newRole

      // Update state
      dbRole.value = newRole
      dbRoleFetched.value = true

      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('praxio_db_role', dbRole.value === null ? 'null' : dbRole.value)
      }

      console.log('✅ Database role fetched:', {
        tokenRole: userRole.value,
        dbRole: dbRole.value,
        previousRole,
        roleChanged,
        isAccountOwner: !dbRole.value,
        stored: true
      })

      // If role changed and notification requested, show alert
      if (roleChanged && showNotification) {
        console.warn('🔄 Role changed from', previousRole, 'to', newRole)

        // Dynamically import notification to avoid circular deps
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('role-changed', {
            detail: { previousRole, newRole }
          })
          window.dispatchEvent(event)
        }
      }

      return { success: true, needsSession: false }
    } catch (error: any) {
      console.error('❌ Failed to fetch database role:', error)
      console.log('📊 Full error object:', JSON.stringify(error, null, 2))
      console.log('📊 Error details:', {
        message: error?.message,
        status: error?.status,
        statusCode: error?.statusCode,
        statusMessage: error?.statusMessage,
        data: error?.data,
        responseStatus: error?.response?.status,
        errorType: typeof error,
        errorConstructor: error?.constructor?.name
      })
      dbRoleFetched.value = false

      // Check if error is 401 - indicates no session
      const is401 = error?.status === 401 ||
        error?.statusCode === 401 ||
        error?.response?.status === 401 ||
        error?.data?.statusCode === 401 ||
        (error?.message && error.message.includes('401'))

      console.log(`🔍 Is 401 error? ${is401}`)
      return { success: false, needsSession: is401 }
    }
  }

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
          isSiteAdmin.value = idTokenResult.claims.siteadmin === true

          console.log('🎫 ID Token claims:', {
            role: idTokenResult.claims.role,
            accountOwnerId: idTokenResult.claims.accountOwnerId,
            userId: idTokenResult.claims.userId,
            siteadmin: idTokenResult.claims.siteadmin,
            allClaims: idTokenResult.claims
          })

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
          console.log('👑 isAccountOwner will be:', !userRole.value && true)

          // Fetch role from database (source of truth)
          const roleResult = await fetchDatabaseRole()

          // If session was revoked (401), dispatch event to show notification
          if (roleResult.needsSession) {
            console.log('🚪 Session was revoked (401) - dispatching session-revoked event')

            // Check if currently impersonating - don't auto-logout in that case
            const isImpersonating = typeof window !== 'undefined' &&
              localStorage.getItem('isImpersonating') === 'true'

            if (isImpersonating) {
              console.log('⚠️ Session revoked but user is impersonating - not triggering auto-logout')
              return
            }

            if (typeof window !== 'undefined') {
              const event = new CustomEvent('session-revoked', {
                detail: { reason: 'Session signed out from another device' }
              })
              window.dispatchEvent(event)
            }
            return
          }
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
          // Still try to fetch database role even if token parsing failed
          await fetchDatabaseRole()
        }
        isAuthenticated.value = true
      } else {
        console.log('🚪 User signed out')
        user.value = null
        userRole.value = null
        dbRole.value = null
        dbRoleFetched.value = false
        userClaims.value = null
        isSiteAdmin.value = false
        isAuthenticated.value = false
        if (typeof window !== 'undefined') {
          localStorage.removeItem('praxio_db_role')
        }
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
        console.log('✅ Session created successfully after login')

        // Force token refresh to get updated custom claims
        await userCredential.user.getIdToken(true)
      } catch (sessionError) {
        console.error('❌ Failed to create session:', sessionError)
        // Don't fail login if session creation fails, but log it prominently
        throw sessionError
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
        console.log('✅ Session created successfully after Google login')

        // Force token refresh to get updated custom claims
        await result.user.getIdToken(true)
      } catch (sessionError) {
        console.error('❌ Failed to create session:', sessionError)
        throw sessionError
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

      // Delete current session from database
      try {
        const token = await auth.currentUser?.getIdToken()
        if (token) {
          await $fetch('/api/sessions/delete-current', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          })
        }
      } catch (sessionError) {
        console.error('Failed to delete session:', sessionError)
        // Don't fail logout if session deletion fails
      }

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
          const config = useRuntimeConfig()
          const retroactLogoutUrl = `${config.public.retroactUrl}/sso-logout`
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

  // Permission helpers - use dbRole when fetched, fallback to token role
  const effectiveRole = computed(() => dbRoleFetched.value ? dbRole.value : userRole.value)
  const isViewer = computed(() => effectiveRole.value === 'viewer')
  const isEditor = computed(() => effectiveRole.value === 'editor')
  const isAccountOwner = computed(() => {
    const role = effectiveRole.value
    const result = !role && isAuthenticated.value
    console.log('🔍 isAccountOwner check:', {
      effectiveRole: role,
      dbRoleFetched: dbRoleFetched.value,
      dbRole: dbRole.value,
      tokenRole: userRole.value,
      isAuthenticated: isAuthenticated.value,
      result
    })
    return result
  })
  const canEdit = computed(() => isAccountOwner.value || isEditor.value)
  const canManageUsers = computed(() => isAccountOwner.value)

  return {
    // State
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    userRole: readonly(userRole), // Token role (may be stale)
    dbRole: readonly(dbRole), // Database role (source of truth)
    dbRoleFetched: readonly(dbRoleFetched), // Whether DB role has been loaded
    effectiveRole: readonly(effectiveRole), // The role actually being used
    userClaims: readonly(userClaims),
    isSiteAdmin: readonly(isSiteAdmin), // Site admin status

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
    fetchDatabaseRole, // New method to refresh role from database

    // Permission helpers
    isViewer,
    isEditor,
    isAccountOwner,
    canEdit,
    canManageUsers
  }
}
