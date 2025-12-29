<template>
  <div 
    :class="[
      'bg-white border-b border-gray-200 sticky z-40 transition-all duration-300',
      visible ? 'top-16 opacity-100' : '-top-12 opacity-0 pointer-events-none',
      isScrolled ? 'shadow-lg' : ''
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav class="flex items-center gap-4 sm:gap-8 h-12 overflow-x-auto scrollbar-hide">
        <slot />
      </nav>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  hideOnScrollDown: {
    type: Boolean,
    default: false
  }
})

const { setVisible } = useSubHeaderState()
const visible = ref(true)
const isScrolled = ref(false)
const lastScrollY = ref(0)

// Sync visible state to shared composable
watch(visible, (newVal) => {
  setVisible(newVal)
})

onMounted(() => {
  // Set initial visibility state
  setVisible(true)
  
  const handleScroll = () => {
    const currentScrollY = window.scrollY
    
    // Track if page is scrolled for shadow
    isScrolled.value = currentScrollY > 0
    
    // Show bar when scrolling up, hide when scrolling down (if enabled)
    if (props.hideOnScrollDown) {
      if (currentScrollY < lastScrollY.value) {
        visible.value = true
      } else if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
        visible.value = false
      }
    }
    
    lastScrollY.value = currentScrollY
  }
  
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll() // Check initial state
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    setVisible(true) // Reset on unmount
  })
})
</script>
