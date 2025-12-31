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
      <div v-if="isOpen" class="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
        <button
          v-for="lang in locales"
          :key="lang"
          @click="changeLanguage(lang)"
          class="flex items-center justify-between w-full px-4 py-2 text-sm hover:bg-gray-50 transition text-left"
          :class="{ 'bg-primary-50 text-primary-700 font-medium': locale === lang }"
        >
          <span class="uppercase">{{ lang }}</span>
          <span class="text-xs text-gray-500">{{ getLanguageName(lang) }}</span>
          <i v-if="locale === lang" class="fa-solid fa-check text-primary-600 ml-2"></i>
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
const isOpen = ref(false)
const dropdownRef = ref(null)

const languageNames = {
  en: 'English',
  fr: 'Français'
}

const getLanguageName = (lang) => languageNames[lang] || lang

const changeLanguage = (lang) => {
  setLocale(lang)
  isOpen.value = false
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
