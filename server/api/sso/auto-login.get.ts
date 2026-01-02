/**
 * Auto-login SSO endpoint
 * 
 * This endpoint is accessed when users navigate directly to retroact.
 * It checks if user is authenticated in praxio:
 * - If authenticated: generates SSO token and redirects to retroact with token
 * - If not authenticated: redirects to praxio signin
 */

export default defineEventHandler(async (event) => {
  try {
    // Get the intended retroact destination from query params
    const query = getQuery(event)
    const config = useRuntimeConfig()
    const retroactUrl = (query.returnUrl as string) || config.public.retroactUrl
    
    console.log('🔐 SSO Auto-login requested, returnUrl:', retroactUrl)
    
    // Check if user is authenticated
    const authHeader = getHeader(event, 'cookie')
    if (!authHeader) {
      console.log('❌ No auth cookie, redirecting to signin')
      return sendRedirect(event, `/signin?redirect=${encodeURIComponent('/api/sso/auto-login?returnUrl=' + encodeURIComponent(retroactUrl))}`, 302)
    }
    
    // Try to verify Firebase auth (check if valid session exists)
    const token = authHeader.match(/token=([^;]+)/)?.[1]
    if (!token) {
      console.log('❌ No token in cookie, redirecting to signin')
      return sendRedirect(event, `/signin?redirect=${encodeURIComponent('/api/sso/auto-login?returnUrl=' + encodeURIComponent(retroactUrl))}`, 302)
    }
    
    // Get Firebase Admin instance
    const { getFirebaseApp } = await import('../../utils/firebase')
    const adminApp = getFirebaseApp()
    
    if (!adminApp) {
      throw new Error('Firebase Admin not initialized')
    }
    
    const admin = await import('firebase-admin')
    
    // Verify the session token
    let decodedToken
    try {
      decodedToken = await admin.auth(adminApp).verifyIdToken(token)
    } catch (err) {
      console.log('❌ Invalid token, redirecting to signin')
      return sendRedirect(event, `/signin?redirect=${encodeURIComponent('/api/sso/auto-login?returnUrl=' + encodeURIComponent(retroactUrl))}`, 302)
    }
    
    console.log('✅ User authenticated:', decodedToken.email)
    
    // Generate SSO token
    const jwt = await import('jsonwebtoken')
    const secret = process.env.SSO_SECRET || process.env.JWT_SECRET || 'R3tr0@ct-SSO-S3cr3t-2025!Pr0duct10n'
    
    const ssoToken = jwt.sign(
      {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0],
        type: 'sso',
        source: 'praxio'
      },
      secret,
      { expiresIn: '5m' }
    )
    
    console.log('🎫 SSO token generated, redirecting to retroact')
    
    // Redirect to retroact SSO auth page with token and return URL
    const retroactAuthUrl = new URL('/auth/sso', config.public.retroactUrl)
    retroactAuthUrl.searchParams.set('token', ssoToken)
    
    // Extract the path from retroactUrl to use as return path in retroact
    const retroactUrlObj = new URL(retroactUrl)
    if (retroactUrlObj.pathname !== '/') {
      retroactAuthUrl.searchParams.set('returnUrl', retroactUrlObj.pathname)
    }
    
    return sendRedirect(event, retroactAuthUrl.toString(), 302)
    
  } catch (error: any) {
    console.error('❌ SSO auto-login error:', error)
    return sendRedirect(event, '/signin', 302)
  }
})
