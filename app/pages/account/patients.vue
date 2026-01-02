<template>
  <ClientOnly>
    <!-- Breadcrumbs (Mobile Only) -->
    <nav class="mb-4 md:hidden">
      <ol class="flex items-center gap-2 text-sm text-primary-600">
        <li>
          <NuxtLink to="/account" class="hover:text-primary-700 transition">{{ t('header.account') }}</NuxtLink>
        </li>
        <li class="text-primary-400">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </li>
        <li class="font-medium">
          {{ t('account.patients.title') }}
        </li>
      </ol>
    </nav>
    
    <div class="h-[calc(100vh-13rem)] flex">
      <!-- Mobile Patient Selector (visible only on mobile when patients exist) -->
      <div v-if="patients.length > 0 && !isCreatingPatient" class="lg:hidden bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 px-4 pt-0 pb-4 mt-0 absolute top-32 left-0 right-0 z-30">
        <div class="relative">
          <!-- Custom Dropdown Button -->
          <button @click="mobileDropdownOpen = !mobileDropdownOpen" class="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors">
            <span v-if="selectedPatient" class="flex items-center gap-3 min-w-0 flex-1">
              <span class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span class="text-primary-600 font-medium">
                  {{ (selectedPatient.firstName?.[0] || '') + (selectedPatient.name?.[0] || '') }}
                </span>
              </span>
              <div class="text-left min-w-0 flex-1">
                <div class="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  {{ selectedPatient.firstName }} {{ selectedPatient.name }}
                  <i 
                    :class="selectedPatient.gender === 'M' ? 'fa-regular fa-mars text-blue-600' : 'fa-regular fa-venus text-pink-500'"
                    class="text-sm"
                  ></i>
                </div>
                <div class="text-xs text-gray-500 mt-0.5 truncate">{{ selectedPatient.healthInsuranceNb }}</div>
              </div>
            </span>
            <svg class="w-5 h-5 text-primary-600 transition-transform ml-2 flex-shrink-0" :class="{ 'rotate-180': mobileDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <!-- Full-Screen Overlay Dropdown -->
          <Teleport to="body">
            <Transition enter-active-class="transition ease-out duration-200" enter-from-class="transform opacity-0" enter-to-class="transform opacity-100" leave-active-class="transition ease-in duration-150" leave-from-class="transform opacity-100" leave-to-class="transform opacity-0">
              <div v-if="mobileDropdownOpen" class="fixed inset-0 z-[100] flex items-start justify-center p-2.5 bg-primary-600/25" @click.self="mobileDropdownOpen = false">
                <div class="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden my-2">
                <!-- Header with Close Button and Search -->
                <div class="sticky top-0 bg-white border-b border-gray-200">
                  <div class="px-4 py-4 flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-gray-900">Select Patient</h3>
                    <button @click="mobileDropdownOpen = false" class="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition">
                      <i class="fa-solid fa-xmark text-xl"></i>
                    </button>
                  </div>
                  
                  <!-- Search in dropdown -->
                  <div class="px-4 pb-4">
                    <div class="relative">
                      <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                      <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="Search patients..."
                        class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <!-- Patient List -->
                <div class="overflow-y-auto" style="max-height: calc(100vh - 180px);">
                  <button 
                    v-for="patient in filteredPatients" 
                    :key="patient.id"
                    @click="selectPatientMobile(patient)" 
                    class="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    :class="{ 'bg-primary-50': selectedPatient?.id === patient.id }"
                  >
                    <span 
                      class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0"
                      :class="{ 'opacity-40': !patient.isActive }"
                    >
                      <span class="text-primary-600 font-medium">
                        {{ (patient.firstName?.[0] || '') + (patient.name?.[0] || '') }}
                      </span>
                    </span>
                    <div class="flex-1 min-w-0 text-left">
                      <div class="flex items-center gap-2" :class="{ 'opacity-40': !patient.isActive }">
                        <span class="text-sm font-medium text-gray-900 truncate">
                          {{ patient.firstName }} {{ patient.name }}
                        </span>
                        <i 
                          :class="patient.gender === 'M' ? 'fa-regular fa-mars text-blue-600' : 'fa-regular fa-venus text-pink-500'"
                          class="text-sm"
                        ></i>
                        <span class="text-sm text-gray-500">{{ calculateAge(patient.birthDate) }}</span>
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5" :class="{ 'opacity-40': !patient.isActive }">
                        {{ patient.healthInsuranceNb }}
                      </div>
                    </div>
                    <i v-if="selectedPatient?.id === patient.id" class="fa-solid fa-check text-primary-600"></i>
                  </button>
                  
                  <!-- Empty Search -->
                  <div v-if="filteredPatients.length === 0" class="p-8 text-center text-gray-500">
                    <i class="fa-solid fa-search text-2xl mb-2"></i>
                    <p>No patients match your search</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
          </Teleport>
        </div>
      </div>
      
      <!-- No Patients Landing -->
      <div v-if="!loading && patients.length === 0 && !isCreatingPatient" class="flex-1 flex items-center justify-center">
        <div class="max-w-2xl mx-auto text-center px-6">
          <div class="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <i class="fa-duotone fa-hospital-user text-primary-600 text-5xl"></i>
          </div>
          <h1 class="text-3xl font-display font-bold text-gray-900 mb-4">
            {{ t('account.patients.addFirst') }}
          </h1>
          <p class="text-lg text-gray-600 mb-8">
            {{ t('account.patients.addFirstDesc') }}
          </p>
          <button
            @click="startCreatePatient"
            class="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium text-lg rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-600/25"
          >
            <i class="fa-solid fa-user-plus mr-3"></i>
            {{ t('account.patients.addYourFirst') }}
          </button>
        
          <!-- Features Card -->
          <div class="mt-10 bg-primary-50 rounded-2xl p-6 text-left">
            <h3 class="font-bold text-primary-900 mb-4">{{ t('account.patients.whatYouCanDo') }}</h3>
            <ul class="space-y-3">
              <li class="flex items-center gap-3 text-gray-700">
                <i class="fa-duotone fa-vial text-primary-600 w-5"></i>
                <span>{{ t('account.patients.trackInr') }}</span>
              </li>
              <li class="flex items-center gap-3 text-gray-700">
                <i class="fa-duotone fa-pills text-primary-600 w-5"></i>
                <span>{{ t('account.patients.manageDosing') }}</span>
              </li>
              <li class="flex items-center gap-3 text-gray-700">
                <i class="fa-duotone fa-file-prescription text-primary-600 w-5"></i>
                <span>{{ t('account.patients.generatePrescriptions') }}</span>
              </li>
              <li class="flex items-center gap-3 text-gray-700">
                <i class="fa-duotone fa-chart-line-up text-primary-600 w-5"></i>
                <span>{{ t('account.patients.monitorProgress') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Main Content: Patient List + Form -->
      <template v-else>
        <!-- Left Panel: Patient List (hidden on mobile) -->
        <div 
          v-if="patients.length > 0 || isCreatingPatient"
          :style="{ width: `${leftPanelWidth}px`, minWidth: '300px', maxWidth: '500px' }"
          class="h-full flex-col border-r border-gray-200 bg-white flex-shrink-0 hidden lg:flex"
        >
        <!-- List Header -->
        <div class="p-4 border-b border-gray-100">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-gray-500">
                <i class="fa-solid fa-user mr-1"></i>
                {{ filteredPatients.length }} patients
              </span>
            </div>
            <button
              v-if="canEdit"
              @click="startCreatePatient"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 transition"
              :class="{ 'rotate-45': isCreatingPatient }"
              style="transition: transform 0.2s ease"
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
          
          <!-- Search -->
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search patients..."
              class="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <!-- Filters -->
          <div class="flex items-center gap-2 mt-3">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                v-model="showInactive"
                type="checkbox"
                class="rounded text-primary-600 focus:ring-primary-500"
              />
              Show inactive
            </label>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>

        <!-- Patient List -->
        <div v-else class="flex-1 relative">
          <div ref="patientListScrollContainer" class="absolute inset-0 overflow-y-auto custom-scrollbar">
            <div
              v-for="patient in filteredPatients"
              :key="patient.id"
            @click="selectPatient(patient)"
            class="px-4 py-3 cursor-pointer border-b border-gray-100 transition-colors"
            :class="{
              'bg-primary-50 border-l-4 border-l-primary-600': selectedPatient?.id === patient.id,
              'hover:bg-gray-50': selectedPatient?.id !== patient.id
            }"
          >
            <!-- Patient Row -->
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0"
                :class="{ 'opacity-40': !patient.isActive }"
              >
                <span class="text-primary-600 font-medium">
                  {{ (patient.firstName?.[0] || '') + (patient.name?.[0] || '') }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2" :class="{ 'opacity-40': !patient.isActive }">
                  <span class="font-medium text-gray-900 truncate">
                    {{ patient.firstName }} {{ patient.name }}
                  </span>
                  <i 
                    :class="patient.gender === 'M' ? 'fa-regular fa-mars text-blue-600' : 'fa-regular fa-venus text-pink-500'"
                    class="text-sm"
                  ></i>
                  <span class="text-sm text-gray-500">{{ calculateAge(patient.birthDate) }}</span>
                </div>
                <div class="text-sm text-gray-500 truncate" :class="{ 'opacity-40': !patient.isActive }">
                  {{ patient.healthInsuranceNb }}
                </div>
              </div>
            </div>
          </div>

          <!-- Empty Search -->
          <div v-if="filteredPatients.length === 0 && patients.length > 0" class="p-6 text-center text-gray-500">
            <i class="fa-solid fa-search text-2xl mb-2"></i>
            <p>No patients match your search</p>
          </div>

          <!-- No Patients (in left pane when creating first patient) -->
          <CommonNoDataPlaceholder 
            v-if="patients.length === 0" 
            :show="true" 
            context="patients"
          />
          </div>
          
          <!-- Overlay Scrollbar (outside scroll container) -->
          <div
            v-if="isScrollable"
            class="overlay-scrollbar-track"
            :class="{ visible: scrollbarVisible || isDragging }"
            @click="handleTrackClick"
          >
            <div
              class="overlay-scrollbar-thumb"
              :style="{ height: thumbHeight + 'px', top: thumbTop + 'px' }"
              @mousedown="handleThumbMouseDown"
            ></div>
          </div>
        </div>
      </div>

      <!-- Resize Handle (hidden on mobile) -->
      <div
        v-if="patients.length > 0"
        class="w-1 bg-gray-200 hover:bg-primary-300 cursor-col-resize transition-colors flex-shrink-0 hidden lg:block"
        @mousedown="startResize"
      ></div>

      <!-- Right Panel: Patient Form -->
      <div class="flex-1 h-full flex flex-col bg-gray-50" :class="{ 'pt-[75px] lg:pt-0': patients.length > 0 && !isCreatingPatient }">
        <div class="max-w-4xl p-6 lg:p-6 px-0 md:px-6 flex-1 overflow-y-auto custom-scrollbar">
          <!-- Form Header (hidden on mobile) -->
          <div class="mb-6 hidden lg:block">
            <h2 class="text-xl font-bold text-gray-900">
              {{ isCreatingPatient ? 'New Patient' : (selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.name}` : 'Select a patient') }}
            </h2>
            <p v-if="selectedPatient && !isCreatingPatient" class="text-sm text-gray-500 mt-1">
              Patient since {{ formatDate(selectedPatient.createdAt) }}
            </p>
          </div>

          <!-- No Selection State -->
          <div v-if="!selectedPatient && !isCreatingPatient" class="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <i class="fa-solid fa-arrow-left text-gray-300 text-4xl mb-4"></i>
            <p class="text-gray-500">Select a patient from the list to view details</p>
          </div>

          <!-- Patient Form -->
          <form v-else @submit.prevent="savePatient" class="space-y-6">
            <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <!-- Name Row -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    v-model="form.firstName"
                    type="text"
                    required
                    :readonly="!canEdit"
                    class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    :readonly="!canEdit"
                    class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Gender & Birth Date Row -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                  <select
                    v-model="form.gender"
                    required
                    :disabled="!canEdit"
                    class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date *</label>
                  <input
                    v-model="form.birthDate"
                    type="date"
                    required
                    :readonly="!canEdit"
                    class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <!-- Health Insurance -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Health Insurance Number *</label>
                <input
                  v-model="form.healthInsuranceNb"
                  type="text"
                  required
                  :readonly="!canEdit"
                  class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Indication -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Indication</label>
                <input
                  v-model="form.indication"
                  type="text"
                  placeholder="e.g., AF, DVT, PE"
                  :readonly="!canEdit"
                  class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <!-- Patient Status (only for existing patients) -->
              <div v-if="selectedPatient && !isCreatingPatient">
                <label class="block text-sm font-medium text-gray-700 mb-2">Patient Status</label>
                <div class="flex items-center gap-6">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="form.isActive"
                      type="radio"
                      :value="true"
                      :disabled="!canEdit"
                      class="text-primary-600 focus:ring-primary-500"
                    />
                    <span class="text-sm text-gray-700">Active</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input
                      v-model="form.isActive"
                      type="radio"
                      :value="false"
                      :disabled="!canEdit"
                      class="text-gray-600 focus:ring-gray-500"
                    />
                    <span class="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
                
                <!-- Inactive Warning -->
                <div v-if="form.isActive === false" class="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <i class="fa-solid fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                  <p class="text-sm text-amber-700">
                    Inactive patients are hidden from the list but their data is preserved.
                  </p>
                </div>
              </div>
            </div>

            <!-- Form Error -->
            <div v-if="formError" class="bg-red-50 border border-red-600 rounded-xl p-4 flex items-start gap-2">
              <i class="fa-solid fa-exclamation-circle text-red-600 mt-0.5"></i>
              <p class="text-sm text-red-600">{{ formError }}</p>
            </div>

            <!-- Form Actions -->
            <div v-if="canEdit" class="flex items-center justify-between">
              <button
                v-if="selectedPatient && !isCreatingPatient"
                type="button"
                @click="confirmDelete"
                :disabled="deleting"
                class="px-4 py-2 text-red-600 hover:bg-red-50 font-medium rounded-xl transition"
              >
                <SpinnerIcon v-if="deleting" class="mr-2" />
                <i v-else class="fa-solid fa-trash mr-2"></i>
                Delete
              </button>
              <div v-else></div>
              
              <div class="flex items-center gap-3">
                <button
                  v-if="isCreatingPatient && patients.length > 0"
                  type="button"
                  @click="cancelCreate"
                  class="px-4 py-2 text-gray-700 hover:bg-gray-100 font-medium rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="saving"
                  class="px-6 py-2 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition disabled:opacity-50"
                >
                  <SpinnerIcon v-if="saving" class="mr-2" />
                  {{ isCreatingPatient ? 'Create Patient' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      </template>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" @click="showDeleteModal = false"></div>
          
          <div class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div class="text-center">
              <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fa-solid fa-exclamation-triangle text-red-600 text-2xl"></i>
              </div>
              <h2 class="text-xl font-bold text-gray-900 mb-2">Delete Patient?</h2>
              <p class="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{{ selectedPatient?.firstName }} {{ selectedPatient?.name }}</strong>? 
                This action cannot be undone.
              </p>
              <div class="flex justify-center gap-3">
                <button
                  @click="showDeleteModal = false"
                  class="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  @click="deletePatient"
                  :disabled="deleting"
                  class="px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-600 transition disabled:opacity-50"
                >
                  <SpinnerIcon v-if="deleting" class="mr-2" />
                  Delete
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
import { useOverlayScrollbar } from '~/composables/useOverlayScrollbar'

definePageMeta({
  middleware: ['auth', 'subscription']
})

interface Patient {
  id: number
  name: string
  firstName: string
  gender: 'M' | 'F'
  birthDate: string
  healthInsuranceNb: string
  indication: string | null
  isActive: boolean
  targetMin: number | null
  targetMax: number | null
  lastResult?: number | null
  createdAt?: string
}

const { user } = useAuth()
const { needsSubscription, hasAccess } = useSubscription()
const router = useRouter()
const { t } = useI18n()

// Redirect to subscription page if user needs a subscription
watch(needsSubscription, (needs) => {
  if (needs) {
    router.push('/account/settings/subscription')
  }
}, { immediate: true })

// Check permissions
const canEdit = computed(() => {
  return !user.value?.role || user.value?.role === 'editor'
})

// State
const patients = ref<Patient[]>([])
const selectedPatient = ref<Patient | null>(null)
const isCreatingPatient = ref(false)
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const patientListScrollContainer = ref<HTMLElement | null>(null)

// Initialize overlay scrollbar for patient list (will be set up after mount)
const { 
  scrollbarVisible, 
  isDragging, 
  thumbHeight, 
  thumbTop, 
  isScrollable, 
  handleThumbMouseDown, 
  handleTrackClick 
} = useOverlayScrollbar(patientListScrollContainer)
const formError = ref('')
const showDeleteModal = ref(false)

// Search & Filter
const searchQuery = ref('')
const showInactive = ref(false)

// Mobile dropdown
const mobileDropdownOpen = ref(false)

// Panel resize
const leftPanelWidth = ref(350)
const isResizing = ref(false)

// Form
const form = ref({
  name: '',
  firstName: '',
  gender: '' as '' | 'M' | 'F',
  birthDate: '',
  healthInsuranceNb: '',
  indication: '',
  isActive: true
})

// Computed
const filteredPatients = computed(() => {
  let result = patients.value
  
  // When showInactive is false, only show active patients
  if (!showInactive.value) {
    result = result.filter(p => Boolean(p.isActive))
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.firstName.toLowerCase().includes(query) ||
      p.healthInsuranceNb.toLowerCase().includes(query) ||
      (p.indication && p.indication.toLowerCase().includes(query))
    )
  }
  
  return result
})

// Helpers
const calculateAge = (birthDate: string) => {
  if (!birthDate) return ''
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString()
}

// API helpers
const getAuthHeaders = async () => {
  const { $auth } = useNuxtApp()
  const token = await $auth.currentUser?.getIdToken()
  return { Authorization: `Bearer ${token}` }
}

// Fetch patients
const fetchPatients = async (showLoading = true) => {
  if (showLoading) loading.value = true
  try {
    const headers = await getAuthHeaders()
    const data = await $fetch<Patient[]>('/api/patients?includeInactive=true', { headers })
    patients.value = data
  } catch (e: any) {
    console.error('Failed to load patients:', e)
  } finally {
    if (showLoading) loading.value = false
  }
}

// Select patient
const selectPatient = (patient: Patient) => {
  if (isCreatingPatient.value) {
    isCreatingPatient.value = false
  }
  selectedPatient.value = patient
  populateForm(patient)
}

// Select patient on mobile and close dropdown
const selectPatientMobile = (patient: Patient) => {
  selectPatient(patient)
  mobileDropdownOpen.value = false
}

// Populate form
const populateForm = (patient: Patient) => {
  form.value = {
    name: patient.name,
    firstName: patient.firstName,
    gender: patient.gender,
    birthDate: patient.birthDate,
    healthInsuranceNb: patient.healthInsuranceNb,
    indication: patient.indication || '',
    isActive: patient.isActive
  }
  formError.value = ''
}

// Start create
const startCreatePatient = () => {
  if (isCreatingPatient.value) {
    cancelCreate()
    return
  }
  selectedPatient.value = null
  isCreatingPatient.value = true
  form.value = {
    name: '',
    firstName: '',
    gender: '',
    birthDate: '',
    healthInsuranceNb: '',
    indication: '',
    isActive: true
  }
  formError.value = ''
}

// Cancel create
const cancelCreate = () => {
  isCreatingPatient.value = false
  if (patients.value.length > 0) {
    selectPatient(patients.value[0])
  }
}

// Save patient
const savePatient = async () => {
  saving.value = true
  formError.value = ''
  
  try {
    const headers = await getAuthHeaders()
    
    if (isCreatingPatient.value) {
      const newPatient = await $fetch<Patient>('/api/patients', {
        method: 'POST',
        headers,
        body: form.value
      })
      await fetchPatients(false)
      isCreatingPatient.value = false
      // Select the new patient
      const created = patients.value.find(p => p.id === newPatient.id)
      if (created) {
        selectedPatient.value = created
        populateForm(created)
      }
    } else if (selectedPatient.value) {
      const patientId = selectedPatient.value.id
      await $fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers,
        body: form.value
      })
      await fetchPatients(false)
      // Re-select to refresh
      const updated = patients.value.find(p => p.id === patientId)
      if (updated) {
        selectedPatient.value = updated
        populateForm(updated)
      }
    }
  } catch (e: any) {
    console.error('Save patient error:', e)
    formError.value = e.data?.message || e.message || 'Failed to save patient'
  }
  
  saving.value = false
}

// Confirm delete
const confirmDelete = () => {
  showDeleteModal.value = true
}

// Delete patient
const deletePatient = async () => {
  if (!selectedPatient.value) return
  
  deleting.value = true
  
  try {
    const headers = await getAuthHeaders()
    const patientId = selectedPatient.value.id
    
    await $fetch(`/api/patients/${patientId}`, {
      method: 'DELETE',
      headers
    })
    
    showDeleteModal.value = false
    selectedPatient.value = null
    isCreatingPatient.value = false
    await fetchPatients()
    
    // Select first patient if available
    if (filteredPatients.value.length > 0) {
      selectPatient(filteredPatients.value[0])
    }
  } catch (e: any) {
    console.error('Delete error:', e)
    formError.value = e.data?.message || e.message || 'Failed to delete patient'
    showDeleteModal.value = false
  } finally {
    deleting.value = false
  }
}

// Resize handling
const startResize = (e: MouseEvent) => {
  isResizing.value = true
  const startX = e.clientX
  const startWidth = leftPanelWidth.value
  
  const onMouseMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startX
    const newWidth = Math.min(Math.max(startWidth + delta, 300), 500)
    leftPanelWidth.value = newWidth
  }
  
  const onMouseUp = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }
  
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

// Load on mount
onMounted(async () => {
  await fetchPatients()
  // Auto-select first active patient (filteredPatients respects showInactive=false)
  if (filteredPatients.value.length > 0) {
    selectPatient(filteredPatients.value[0])
  }
})

// Prevent background scrolling when dropdown is open
watch(mobileDropdownOpen, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
})

// Ensure a patient is always selected when list changes
watch(filteredPatients, (newList) => {
  if (isCreatingPatient.value) return
  
  // If no patient selected but we have patients, select the first
  if (!selectedPatient.value && newList.length > 0) {
    selectPatient(newList[0])
    return
  }
  
  // If selected patient is not in filtered list, select first available
  if (selectedPatient.value && !newList.find(p => p.id === selectedPatient.value?.id)) {
    if (newList.length > 0) {
      selectPatient(newList[0])
    } else {
      selectedPatient.value = null
    }
  }
})
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 100px;
}

/* Hide native scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  display: none;
}

.custom-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Overlay scrollbar track */
.overlay-scrollbar-track {
  position: absolute;
  top: 8px;
  right: 4px;
  bottom: 8px;
  width: 10px;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
  z-index: 100;
  border-radius: 5px;
}

.overlay-scrollbar-track.visible {
  opacity: 1;
  pointer-events: auto;
}

/* Overlay scrollbar thumb */
.overlay-scrollbar-thumb {
  position: absolute !important;
  right: 0;
  width: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  pointer-events: auto;
}

.overlay-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.overlay-scrollbar-thumb:active {
  background-color: rgba(0, 0, 0, 0.7);
}
</style>
