<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-display font-bold text-gray-900">Organization Settings</h1>
      <p class="mt-1 text-gray-600">Manage your organization details</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">Loading organization...</p>
    </div>

    <!-- No Access for Invited Users -->
    <div v-else-if="isInvitedUser" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <i class="fa-solid fa-building text-gray-300 text-4xl mb-4"></i>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Organization Settings</h3>
      <p class="text-gray-600">Only account owners can modify organization settings.</p>
      <div v-if="organization" class="mt-6 bg-gray-50 rounded-xl p-4 text-left">
        <p class="text-sm text-gray-500 mb-1">Your Organization</p>
        <p class="font-medium text-gray-900">{{ organization.name || 'Not set' }}</p>
        <p v-if="organization.type" class="text-sm text-gray-600">{{ organization.type }}</p>
      </div>
    </div>

    <form v-else @submit.prevent="saveOrganization" class="space-y-6">
      <!-- Organization Info Card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="fa-light fa-building text-primary-600"></i>
          Organization Details
        </h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
          <input
            v-model="form.organizationName"
            type="text"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
          <select
            v-model="form.organizationType"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select type...</option>
            <option value="clinic">Clinic</option>
            <option value="hospital">Hospital</option>
            <option value="private_practice">Private Practice</option>
            <option value="laboratory">Laboratory</option>
            <option value="pharmacy">Pharmacy</option>
            <option value="research_center">Research Center</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              v-model="form.telephone"
              type="tel"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fax</label>
            <input
              v-model="form.fax"
              type="tel"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Address Card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="fa-light fa-location-dot text-primary-600"></i>
          Address
        </h2>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
            <input
              v-model="form.postalCode"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              v-model="form.city"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              v-model="form.country"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Messages Container -->
      <div class="min-h-[52px]">
        <!-- Error Message -->
        <div v-if="error" class="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
          <i class="fa-solid fa-exclamation-circle text-red-500 mt-0.5"></i>
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-else-if="success" class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-green-500 mt-0.5"></i>
          <p class="text-sm text-green-700">Organization updated successfully!</p>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="saving"
          class="px-6 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-50 inline-flex items-center"
        >
          <SpinnerIcon v-if="saving" class="mr-2" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { getAuthHeaders, userRole } = useAuth()

const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref(false)

const isInvitedUser = computed(() => !!userRole.value)
const organization = ref<any>(null)

const form = ref({
  organizationName: '',
  organizationType: '',
  telephone: '',
  fax: '',
  address: '',
  postalCode: '',
  city: '',
  country: ''
})

const loadOrganization = async () => {
  try {
    loading.value = true
    const headers = await getAuthHeaders()
    const data = await $fetch<any>('/api/users/current', { headers })
    
    // Store organization for display to invited users
    organization.value = data.organization
    
    // Only populate form if account owner
    if (!data.role) {
      form.value = {
        organizationName: data.organization?.name || '',
        organizationType: data.organization?.type || '',
        telephone: data.organization?.telephone || '',
        fax: data.organization?.fax || '',
        address: data.organization?.address || '',
        postalCode: data.organization?.postalCode || '',
        city: data.organization?.city || '',
        country: data.organization?.country || ''
      }
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load organization'
  } finally {
    loading.value = false
  }
}

const saveOrganization = async () => {
  saving.value = true
  error.value = ''
  success.value = false
  
  try {
    const headers = await getAuthHeaders()
    await $fetch('/api/users/organization', {
      method: 'PUT',
      headers,
      body: form.value
    })
    
    success.value = true
    setTimeout(() => { success.value = false }, 3000)
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save organization'
  } finally {
    saving.value = false
  }
}

onMounted(loadOrganization)
</script>
