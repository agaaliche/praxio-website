import { useAuth } from './useAuth'

/**
 * Composable for role-based permissions
 *
 * Roles:
 * - viewer: Read-only access, no CRUD operations
 * - editor: Can CRUD patients/results/appointments, no access to User Management/Billing/Organization CRUD
 * - superuser (account owner, no role): Full access to everything
 */
export function usePermissions() {
  const {
    user,
    userRole,
    isViewer,
    isEditor,
    isAccountOwner
  } = useAuth()

  // Read permissions (everyone can read)
  const canRead = computed(() => true)

  // Create permissions
  const canCreate = computed(() => !isViewer.value)

  // Update permissions
  const canUpdate = computed(() => !isViewer.value)

  // Delete permissions
  const canDelete = computed(() => !isViewer.value)

  // CRUD combined
  const canEdit = computed(() => !isViewer.value)

  // User Management access (superuser/account owner only)
  const canManageUsers = computed(() => isAccountOwner.value)

  // Billing access (superuser/account owner only)
  const canManageBilling = computed(() => isAccountOwner.value)

  // Organization CRUD (superuser/account owner only)
  const canEditOrganization = computed(() => isAccountOwner.value)

  // Settings access (everyone)
  const canAccessSettings = computed(() => true)

  // Helper to check if action is allowed with feedback
  const checkPermission = (action: string, showAlert: boolean = true): boolean => {
    let allowed = false
    let message = ''

    switch (action) {
      case 'create':
      case 'update':
      case 'delete':
      case 'edit':
        allowed = canEdit.value
        message = 'You do not have permission to modify data. Viewers have read-only access.'
        break
      case 'manage-users':
        allowed = canManageUsers.value
        message = 'Only the account owner can manage users.'
        break
      case 'manage-billing':
        allowed = canManageBilling.value
        message = 'Only the account owner can manage billing.'
        break
      case 'edit-organization':
        allowed = canEditOrganization.value
        message = 'Only the account owner can modify organization settings.'
        break
      default:
        allowed = true
    }

    if (!allowed && showAlert) {
      console.warn(message)
    }

    return allowed
  }

  return {
    // User info
    user,
    userRole,

    // Role checks
    isViewer,
    isEditor,
    isAccountOwner,

    // Permission checks
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canEdit,
    canManageUsers,
    canManageBilling,
    canEditOrganization,
    canAccessSettings,

    // Helper
    checkPermission
  }
}
