<template>
  <div>
    <div class="mb-6">
      <h1 class="text-2xl font-display font-bold text-gray-900">{{ t('account.settings.organization.title') }}</h1>
      <p class="mt-1 text-gray-600">{{ t('account.settings.organization.description') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
      <p class="mt-2 text-gray-500">{{ t('common.loading') }}</p>
    </div>

    <!-- No Access for Invited Users -->
    <div v-else-if="isInvitedUser" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
      <i class="fa-solid fa-building text-gray-300 text-4xl mb-4"></i>
      <h3 class="text-lg font-bold text-gray-900 mb-2">{{ t('account.settings.organization.title') }}</h3>
      <p class="text-gray-600">{{ t('account.settings.organization.ownerOnly') }}</p>
      <div v-if="organization" class="mt-6 bg-gray-50 rounded-xl p-4 text-left">
        <p class="text-sm text-gray-500 mb-1">{{ t('account.settings.organization.yourOrganization') }}</p>
        <p class="font-medium text-gray-900">{{ organization.name || t('account.settings.organization.notSet') }}</p>
        <p v-if="organization.type" class="text-sm text-gray-600">{{ organization.type }}</p>
      </div>
    </div>

    <form v-else @submit.prevent="saveOrganization" class="space-y-6">
      <!-- Organization Info Card -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="fa-light fa-building text-primary-600"></i>
          {{ t('account.settings.organization.details') }}
        </h2>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.name') }}</label>
          <input
            v-model="form.organizationName"
            type="text"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.type') }}</label>
          <select
            v-model="form.organizationType"
            class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">{{ t('account.settings.organization.selectType') }}</option>
            <option value="clinic">{{ t('account.settings.organization.clinic') }}</option>
            <option value="hospital">{{ t('account.settings.organization.hospital') }}</option>
            <option value="private_practice">{{ t('account.settings.organization.privatePractice') }}</option>
            <option value="laboratory">{{ t('account.settings.organization.laboratory') }}</option>
            <option value="pharmacy">{{ t('account.settings.organization.pharmacy') }}</option>
            <option value="research_center">{{ t('account.settings.organization.researchCenter') }}</option>
            <option value="other">{{ t('account.settings.organization.other') }}</option>
          </select>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.phone') }}</label>
            <input
              v-model="form.telephone"
              type="tel"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.fax') }}</label>
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
          {{ t('account.settings.organization.address') }}
        </h2>

        <div class="grid md:grid-cols-3 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.streetAddress') }}</label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.postalCode') }}</label>
            <input
              v-model="form.postalCode"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.city') }}</label>
            <input
              v-model="form.city"
              type="text"
              class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('account.settings.organization.country') }}</label>
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
        <div v-if="error" class="bg-red-50 border border-red-600 rounded-xl p-4 flex items-start gap-2">
          <i class="fa-solid fa-exclamation-circle text-red-600 mt-0.5"></i>
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>

        <!-- Success Message -->
        <div v-else-if="success" class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-2">
          <i class="fa-solid fa-circle-check text-green-500 mt-0.5"></i>
          <p class="text-sm text-green-700">{{ t('account.settings.organization.updateSuccess') }}</p>
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
          {{ saving ? t('account.settings.organization.saving') : t('common.save') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})

const { t } = useI18n()
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
