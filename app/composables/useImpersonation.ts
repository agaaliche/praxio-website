/**
 * Composable for managing impersonation state across components
 * Uses Nuxt's useState for reactive cross-component state
 */
export const useImpersonation = () => {
    const isImpersonating = useState('isImpersonating', () => false)
    const impersonatingAs = useState('impersonatingAs', () => '')

    // Initialize state from localStorage
    const initializeFromStorage = () => {
        if (typeof window !== 'undefined') {
            isImpersonating.value = localStorage.getItem('isImpersonating') === 'true'
            impersonatingAs.value = localStorage.getItem('impersonatingAs') || ''
        }
    }

    // Set impersonation state
    const setImpersonation = (email: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('isImpersonating', 'true')
            localStorage.setItem('impersonatingAs', email)
        }
        isImpersonating.value = true
        impersonatingAs.value = email
    }

    // Clear impersonation state
    const clearImpersonation = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('isImpersonating')
            localStorage.removeItem('impersonatingAs')
        }
        isImpersonating.value = false
        impersonatingAs.value = ''
    }

    return {
        isImpersonating,
        impersonatingAs,
        initializeFromStorage,
        setImpersonation,
        clearImpersonation
    }
}
