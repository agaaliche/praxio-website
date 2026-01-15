<template>
  <div class="relative" ref="dropdownRef">
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      :class="buttonClass"
      :title="'Language'"
    >
      <i class="fa-solid fa-globe text-gray-600"></i>
      <span class="font-medium text-sm uppercase">{{ locale }}</span>
    </button>
    
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="isOpen" class="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
        <button
          v-for="lang in locales"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          class="w-full px-4 py-2 text-sm hover:bg-gray-50 transition text-left"
          :class="{ 'text-primary-600 font-semibold': locale === lang.code }"
        >
          {{ lang.name }} ({{ lang.code.toUpperCase() }})
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const props = defineProps({
  buttonClass: {
    type: String,
    default: ''
  }
})

const { locale, locales, setLocale } = useI18n()
const { isAuthenticated, getIdToken } = useAuth()
const isOpen = ref(false)
const dropdownRef = ref(null)

const changeLanguage = async (lang) => {
  console.log('🌍 Praxio LanguageSelector: Changing language to:', lang, 'Authenticated:', isAuthenticated.value)
  console.log('🔍 Praxio: Current localStorage praxio_language:', localStorage.getItem('praxio_language'))
  
  setLocale(lang)
  isOpen.value = false
  
  console.log('💾 Praxio: Language saved via setLocale()')
  console.log('🔍 Praxio: After setLocale, localStorage praxio_language:', localStorage.getItem('praxio_language'))
  
  // Save language preference to database if authenticated
  if (isAuthenticated.value) {
    try {
      console.log('🔄 Praxio: Saving language preference to database...')
      const token = await getIdToken()
      const response = await $fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { language: lang }
      })
      console.log('✅ Praxio: Language preference saved to database:', response)
    } catch (err) {
      console.error('❌ Praxio: Failed to save language preference:', err)
    }
  } else {
    console.log('⚠️ Praxio: Not authenticated, language saved to localStorage only')
  }
}

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
