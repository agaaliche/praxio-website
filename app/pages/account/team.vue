<template>
  <ClientOnly>
  <div class="h-[calc(100vh-13rem)] flex">
    <!-- No Team Members Landing -->
    <div v-if="!loading && !error && teamMembers.length === 0" class="flex-1 flex items-center justify-center">
      <div class="max-w-2xl mx-auto text-center px-6">
        <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fa-duotone fa-user-doctor text-primary-600 text-5xl"></i>
        </div>
        <h1 class="text-3xl font-display font-bold text-gray-900 mb-4">
          Invite your first team member
        </h1>
        <p class="text-lg text-gray-600 mb-8">
          Collaborate with colleagues on patient care. Invite team members to share access and work together.
        </p>
        <button
          @click="openInviteModal"
          class="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium text-lg rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-600/25"
        >
          <i class="fa-solid fa-user-plus mr-3"></i>
          Invite Your First Member
        </button>
      
        <!-- Features Card -->
        <div class="mt-10 bg-primary-50 rounded-2xl p-6 text-left">
          <h3 class="font-bold text-primary-900 mb-4">What team members can do:</h3>
          <ul class="space-y-3">
            <li class="flex items-center gap-3 text-gray-700">
              <i class="fa-duotone fa-users text-primary-600 w-5"></i>
              <span>View and manage shared patients</span>
            </li>
            <li class="flex items-center gap-3 text-gray-700">
              <i class="fa-duotone fa-vial text-primary-600 w-5"></i>
              <span>Add INR results and notes</span>
            </li>
            <li class="flex items-center gap-3 text-gray-700">
              <i class="fa-duotone fa-pills text-primary-600 w-5"></i>
              <span>Adjust dosing schedules</span>
            </li>
            <li class="flex items-center gap-3 text-gray-700">
              <i class="fa-duotone fa-shield-check text-primary-600 w-5"></i>
              <span>Work under your subscription</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <div class="flex-1 overflow-y-auto p-6">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-3xl font-display font-bold text-gray-900">Team</h1>
            <p class="mt-2 text-gray-600">Invite and manage team members</p>
          </div>
          <button
            @click="openInviteModal"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 transition"
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-12">
          <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p class="mt-2 text-gray-500">Loading team members...</p>
        </div>

        <!-- Error State (inline) -->
        <div v-if="error && !loading" class="bg-red-50 border border-red-600 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-exclamation-circle text-red-600"></i>
            <p class="text-red-600">{{ error }}</p>
          </div>
          <button @click="error = ''" class="text-red-600 hover:text-red-600">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <!-- Team Members List -->
        <div v-if="!loading && teamMembers.length > 0" class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div 
        v-for="(member, index) in teamMembers" 
        :key="member.id"
        class="team-member-row flex items-center justify-between px-4 py-3 transition-colors"
        :class="{ 'bg-gray-50': index % 2 === 0 }"
        @mouseenter="hoveredMember = member.id"
        @mouseleave="hoveredMember = null"
      >
        <div class="flex items-center gap-4">
          <!-- Status Button / Refresh on hover -->
          <button
            :key="`status-${member.id}-${memberRefreshKeys[member.id] || 0}`"
            @click="hoveredMember === member.id ? refreshMemberStatus(member) : null"
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center transition-all',
              hoveredMember === member.id 
                ? 'bg-primary-100 text-primary-600 hover:bg-primary-200' 
                : getStatusBgClass(member.status)
            ]"
            :disabled="refreshingStatus === member.id"
          >
            <SpinnerIcon v-if="getButtonIcon(member) === 'spinner'" />
            <i v-else :class="getButtonIcon(member)"></i>
          </button>

          <div>
            <h3 class="font-medium text-gray-900">
              {{ member.firstName }} {{ member.lastName }}
            </h3>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-sm text-gray-500">{{ member.email }}</span>
              <span 
                :class="member.role === 'editor' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'"
                class="px-2 py-0.5 text-xs font-medium rounded-full"
              >
                {{ member.role === 'editor' ? 'Editor' : 'Viewer' }}
              </span>
              <span 
                :class="getStatusChipClass(member.status)"
                class="px-2 py-0.5 text-xs font-medium rounded-full"
              >
                {{ member.status }}
              </span>
              <span v-if="member.lastAccess" class="text-xs text-gray-400">
                Last access: {{ formatDate(member.lastAccess) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons - hidden until hover -->
        <div class="action-buttons flex items-center gap-1">
          <!-- Resend Invite (only for pending) -->
          <button
            v-if="member.status === 'pending'"
            @click="resendInvite(member)"
            :disabled="resendingEmail === member.email"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-green-600 hover:bg-green-50 transition"
            title="Resend invite"
          >
            <SpinnerIcon v-if="resendingEmail === member.email" />
            <i v-else class="fa-regular fa-paper-plane"></i>
          </button>

          <!-- Copy Link -->
          <button
            @click="copyInviteLink(member)"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-blue-600 hover:bg-blue-50 transition"
            title="Copy invite link"
          >
            <i class="fa-regular fa-link"></i>
          </button>

          <!-- Edit Role -->
          <button
            @click="openEditRoleModal(member)"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 transition"
            title="Edit role"
          >
            <i class="fa-regular fa-user-pen"></i>
          </button>

          <!-- Remove User -->
          <button
            @click="confirmRemove(member)"
            class="w-9 h-9 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition"
            title="Remove"
          >
            <i class="fa-regular fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
      </div>
    </template>

    <!-- Invite Modal -->
    <Teleport to="body">
      <div v-if="showInviteModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="closeInviteModal"></div>
          
          <div class="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Invite Team Member</h2>
              <button @click="closeInviteModal" class="text-gray-400 hover:text-gray-600">
                <i class="fa-solid fa-times text-xl"></i>
              </button>
            </div>

            <form @submit.prevent="sendInvite" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    v-model="inviteForm.firstName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    v-model="inviteForm.lastName"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  v-model="inviteForm.email"
                  type="email"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  v-model="inviteForm.role"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer (read-only)</option>
                  <option value="editor">Editor (can edit patients)</option>
                </select>
              </div>

              <div v-if="inviteError" class="bg-red-50 border border-red-600 rounded-lg p-3 text-sm text-red-600">
                {{ inviteError }}
              </div>

              <div v-if="inviteSuccess" class="bg-green-50 border border-green-200 rounded-lg p-3">
                <p class="text-sm text-green-700 font-medium">Invitation sent successfully!</p>
              </div>

              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  @click="closeInviteModal"
                  class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="sending || inviteSuccess"
                  class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  <SpinnerIcon v-if="sending" class="mr-2" />
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Role Modal -->
    <Teleport to="body">
      <div v-if="showEditRoleModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showEditRoleModal = false"></div>
          
          <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Edit Role</h2>
            <p class="text-gray-600 mb-4">
              Change role for {{ editingMember?.firstName }} {{ editingMember?.lastName }}
            </p>

            <select
              v-model="selectedRole"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-6"
            >
              <option value="viewer">Viewer (read-only)</option>
              <option value="editor">Editor (can edit patients)</option>
            </select>

            <div class="flex justify-end gap-3">
              <button
                @click="showEditRoleModal = false"
                class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                @click="updateRole"
                :disabled="updatingRole"
                class="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                <SpinnerIcon v-if="updatingRole" class="mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Remove Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showRemoveModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showRemoveModal = false"></div>
          
          <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-user-minus text-red-600 text-2xl"></i>
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Remove Team Member?</h2>
              <p class="text-gray-600 mb-6">
                Are you sure you want to remove <strong>{{ removingMember?.firstName }} {{ removingMember?.lastName }}</strong>? 
                They will lose access to all patient data.
              </p>
              <div class="flex justify-center gap-3">
                <button
                  @click="showRemoveModal = false"
                  class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  @click="removeMember"
                  :disabled="removing"
                  class="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  <SpinnerIcon v-if="removing" class="mr-2" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { showNotification } from '~/stores/notification'

definePageMeta({
  middleware: ['auth']
})

interface TeamMember {
  id: number
  email: string
  firstName: string
  lastName: string
  role: 'viewer' | 'editor'
  status: 'pending' | 'active' | 'expired'
  lastAccess: string | null
  createdAt: string
  inviteLink: string | null
}

// Data
const teamMembers = ref<TeamMember[]>([])
const loading = ref(true)
const error = ref('')

// Hover state
const hoveredMember = ref<number | null>(null)
const refreshingStatus = ref<number | null>(null)
const resendingEmail = ref<string | null>(null)
const memberRefreshKeys = ref<Record<number, number>>({})

// Invite modal state
const showInviteModal = ref(false)
const sending = ref(false)
const inviteError = ref('')
const inviteSuccess = ref(false)
const inviteForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: 'viewer' as 'viewer' | 'editor'
})

// Edit role modal state
const showEditRoleModal = ref(false)
const editingMember = ref<TeamMember | null>(null)
const selectedRole = ref<'viewer' | 'editor'>('viewer')
const updatingRole = ref(false)

// Remove modal state
const showRemoveModal = ref(false)
const removingMember = ref<TeamMember | null>(null)
const removing = ref(false)

// Status helpers
const getStatusBgClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-600'
    case 'pending': return 'bg-yellow-100 text-yellow-600'
    case 'expired': return 'bg-red-50 text-red-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active': return 'fa-regular fa-check'
    case 'pending': return 'fa-regular fa-clock'
    case 'expired': return 'fa-regular fa-exclamation'
    default: return 'fa-regular fa-question'
  }
}

const getStatusChipClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'pending': return 'bg-yellow-100 text-yellow-700'
    case 'expired': return 'bg-red-50 text-red-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString()
}

// Get initial for avatar
const getInitial = (member: TeamMember): string => {
  const firstName = member.firstName ?? ''
  const email = member.email ?? ''
  if (firstName.length > 0) {
    return firstName.charAt(0).toUpperCase()
  }
  if (email.length > 0) {
    return email.charAt(0).toUpperCase()
  }
  return '?'
}

// Get button icon based on state
const getButtonIcon = (member: TeamMember): string => {
  if (refreshingStatus.value === member.id) {
    return 'spinner'
  }
  if (hoveredMember.value === member.id) {
    return 'fa-regular fa-arrows-rotate'
  }
  return getStatusIcon(member.status)
}

// API helpers
const getAuthHeaders = async () => {
  const { $auth } = useNuxtApp()
  const token = await $auth.currentUser?.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

// Fetch team members
const fetchTeam = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<TeamMember[]>('/api/users/team', { headers })
    teamMembers.value = data
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load team members'
  } finally {
    loading.value = false
  }
}

// Refresh member status
const refreshMemberStatus = async (member: TeamMember) => {
  refreshingStatus.value = member.id
  hoveredMember.value = null // Clear hover to show new status after refresh
  try {
    await fetchTeam()
    memberRefreshKeys.value[member.id] = (memberRefreshKeys.value[member.id] || 0) + 1
    showNotification('Status refreshed', 'success')
  } finally {
    refreshingStatus.value = null
  }
}

// Resend invite
const resendInvite = async (member: TeamMember) => {
  resendingEmail.value = member.email
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/users/team/${member.id}/resend`, {
      method: 'POST',
      headers
    })
    await fetchTeam()
    showNotification('Invite resent successfully', 'success')
  } catch (e: any) {
    console.error('Failed to resend invite:', e)
    showNotification(e.data?.message || 'Failed to resend invite', 'error')
  } finally {
    resendingEmail.value = null
  }
}

// Copy invite link
const copyInviteLink = async (member: TeamMember) => {
  try {
    if (member.inviteLink) {
      await navigator.clipboard.writeText(member.inviteLink)
      showNotification('Invite link copied to clipboard', 'success')
    } else {
      showNotification('No invite link available for this member', 'warning')
    }
  } catch (e: any) {
    console.error('Failed to copy link:', e)
    showNotification('Failed to copy link to clipboard', 'error')
  }
}

// Open invite modal
const openInviteModal = () => {
  inviteForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: 'viewer'
  }
  inviteError.value = ''
  inviteSuccess.value = false
  showInviteModal.value = true
}

// Close invite modal
const closeInviteModal = () => {
  showInviteModal.value = false
  if (inviteSuccess.value) {
    fetchTeam()
  }
}

// Send invite
const sendInvite = async () => {
  sending.value = true
  inviteError.value = ''
  
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/users/team', {
      method: 'POST',
      headers,
      body: inviteForm.value
    })
    
    inviteSuccess.value = true
    await fetchTeam()
    
    // Close modal after showing success message
    setTimeout(() => {
      closeInviteModal()
    }, 1500)
  } catch (e: any) {
    inviteError.value = e.data?.message || 'Failed to send invite'
  } finally {
    sending.value = false
  }
}

// Open edit role modal
const openEditRoleModal = (member: TeamMember) => {
  editingMember.value = member
  selectedRole.value = member.role
  showEditRoleModal.value = true
}

// Update role
const updateRole = async () => {
  if (!editingMember.value) return
  
  updatingRole.value = true
  
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/users/team/${editingMember.value.id}`, {
      method: 'PUT',
      headers,
      body: { role: selectedRole.value }
    })
    
    showNotification(`Role updated to ${selectedRole.value}. User will see changes after signing out and back in.`, 'success', 6000)
    showEditRoleModal.value = false
    editingMember.value = null
    await fetchTeam()
  } catch (e: any) {
    console.error('Failed to update role:', e)
    showNotification('Failed to update role', 'error')
  } finally {
    updatingRole.value = false
  }
}

// Confirm remove
const confirmRemove = (member: TeamMember) => {
  removingMember.value = member
  showRemoveModal.value = true
}

// Remove member
const removeMember = async () => {
  if (!removingMember.value) return
  
  removing.value = true
  
  try {
    const headers = await getAuthHeaders()
    await $fetch(`/api/users/team/${removingMember.value.id}`, {
      method: 'DELETE',
      headers
    })
    
    showRemoveModal.value = false
    removingMember.value = null
    await fetchTeam()
  } catch (e: any) {
    console.error('Failed to remove member:', e)
  } finally {
    removing.value = false
  }
}

// Load on mount
onMounted(fetchTeam)
</script>

<style scoped>
.team-member-row .action-buttons {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.team-member-row:hover .action-buttons {
  opacity: 1;
}
</style>