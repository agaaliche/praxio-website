<template>
  <header :class="['bg-white sticky top-0 z-50 transition-shadow duration-200', showShadow ? 'shadow-lg' : '']">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <NuxtLink to="/" class="flex items-center">
            <svg width="105" height="27" viewBox="0 0 105 27" fill="none" xmlns="http://www.w3.org/2000/svg" class="h-6 w-auto">
              <path d="M2.03999 26.6C0.919994 26.6 -5.99027e-06 25.68 -5.99027e-06 24.56V9.56C-5.99027e-06 4.28 4.27999 -2.14577e-06 9.55999 -2.14577e-06C14.8 -2.14577e-06 19.08 4.28 19.08 9.56C19.08 14.84 14.8 19.12 9.55999 19.12C7.51999 19.12 5.63999 18.48 4.07999 17.4V24.56C4.07999 25.68 3.19999 26.6 2.03999 26.6ZM9.55999 15C12.56 15 15 12.56 15 9.56C15 6.56 12.56 4.12 9.55999 4.12C6.51999 4.12 4.07999 6.56 4.07999 9.56C4.07999 12.56 6.51999 15 9.55999 15ZM24.3056 19.12C23.1856 19.12 22.2656 18.2 22.2656 17.04V2.04C22.2656 0.919998 23.1856 -2.14577e-06 24.3056 -2.14577e-06C25.3456 -2.14577e-06 26.1856 0.759998 26.3456 1.72C27.9056 0.639998 29.7856 -2.14577e-06 31.8256 -2.14577e-06C32.9456 -2.14577e-06 33.8656 0.919998 33.8656 2.04C33.8656 3.2 32.9456 4.12 31.8256 4.12C28.8256 4.12 26.3856 6.56 26.3856 9.56V17.04C26.3856 18.2 25.4656 19.12 24.3056 19.12ZM51.7275 19.12C50.7275 19.12 49.8875 18.36 49.7275 17.36C48.1675 18.48 46.2875 19.12 44.2475 19.12C38.9675 19.12 34.6875 14.84 34.6875 9.56C34.6875 4.28 38.9675 -2.14577e-06 44.2475 -2.14577e-06C49.5275 -2.14577e-06 53.7675 4.28 53.7675 9.56V17.04C53.7675 18.2 52.8875 19.12 51.7275 19.12ZM44.2475 15C47.5675 15 49.6475 12.28 49.6875 9.56C49.6875 6.6 47.3275 4.12 44.2475 4.12C41.2475 4.12 38.8075 6.56 38.8075 9.56C38.8075 12.56 41.2475 15 44.2475 15ZM72.9531 19.12C72.3931 19.12 71.8731 18.88 71.4331 18.44L65.9931 12.56L60.5131 18.44C60.1131 18.88 59.5531 19.12 58.9931 19.12C57.8731 19.12 56.9531 18.12 56.9531 17.04C56.9531 16.52 57.1531 16.04 57.5131 15.64L63.1931 9.56L57.5131 3.44C57.1531 3.04 56.9531 2.56 56.9531 2.08C56.9531 0.959997 57.9131 -2.14577e-06 58.9931 -2.14577e-06C59.5531 -2.14577e-06 60.1131 0.239998 60.5131 0.679997L65.9931 6.56L71.4331 0.679997C71.8731 0.239998 72.3931 -2.14577e-06 72.9531 -2.14577e-06C74.0331 -2.14577e-06 74.9931 0.959997 74.9931 2.08C74.9931 2.56 74.8331 3.04 74.4331 3.44L68.7531 9.56L74.4331 15.64C74.8331 16.04 74.9931 16.52 74.9931 17.04C74.9931 18.16 74.0731 19.12 72.9531 19.12ZM80.2431 19.12C79.1231 19.12 78.2031 18.2 78.2031 17.04V2.04C78.2031 0.919998 79.1231 -2.14577e-06 80.2431 -2.14577e-06C81.3631 -2.14577e-06 82.2831 0.919998 82.2831 2.04V17.04C82.2831 18.2 81.3631 19.12 80.2431 19.12ZM94.9887 19.12C89.7087 19.12 85.4687 14.84 85.4687 9.56C85.4687 4.28 89.7087 -2.14577e-06 94.9887 -2.14577e-06C100.269 -2.14577e-06 104.549 4.28 104.549 9.56C104.549 14.84 100.269 19.12 94.9887 19.12ZM94.9887 15C97.9887 15 100.429 12.56 100.429 9.56C100.429 6.56 97.9887 4.12 94.9887 4.12C91.9887 4.12 89.5487 6.56 89.5487 9.56C89.5487 12.56 91.9887 15 94.9887 15Z" class="fill-primary-600"/>
            </svg>
          </NuxtLink>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <NuxtLink to="/retroact" class="text-gray-600 hover:text-primary-600 transition px-3 py-1.5 rounded-lg" active-class="!text-primary-600 font-medium border border-primary-600">
            Products
          </NuxtLink>
          <NuxtLink to="/pricing" class="text-gray-600 hover:text-primary-600 transition px-3 py-1.5 rounded-lg" active-class="!text-primary-600 font-medium border border-primary-600">
            Pricing
          </NuxtLink>
          <NuxtLink to="/contact" class="text-gray-600 hover:text-primary-600 transition px-3 py-1.5 rounded-lg" active-class="!text-primary-600 font-medium border border-primary-600">
            Contact
          </NuxtLink>
          <ClientOnly>
            <NuxtLink v-if="isAuthenticated" to="/account" class="text-gray-600 hover:text-primary-600 transition px-3 py-1.5 rounded-lg" active-class="!text-primary-600 font-medium border border-primary-600">
              Account
            </NuxtLink>
          </ClientOnly>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <ClientOnly>
            <!-- Show Avatar dropdown if authenticated -->
            <template v-if="isAuthenticated">
              <div class="relative" ref="dropdownRef">
                <button 
                  @click="dropdownOpen = !dropdownOpen" 
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-semibold hover:bg-primary-200 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :title="user?.email || 'Account'"
                >
                  {{ userInitial }}
                </button>
                <!-- Dropdown menu -->
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div class="px-4 py-3 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-900">{{ user?.displayName || 'User' }}</p>
                      <p class="text-sm text-gray-500 truncate">{{ user?.email }}</p>
                    </div>
                    <button 
                      @click="handleSignOut" 
                      class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                    >
                      <i class="fa-solid fa-arrow-right-from-bracket text-gray-400"></i>
                      Sign Out
                    </button>
                  </div>
                </Transition>
              </div>
            </template>
            <!-- Show Sign In / Get Started if not authenticated -->
            <template v-else>
              <NuxtLink to="/signin" class="text-gray-600 hover:text-primary-600 transition">
                Sign In
              </NuxtLink>
              <NuxtLink to="/signup" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                Get Started
              </NuxtLink>
            </template>
          </ClientOnly>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="text-gray-600 hover:text-gray-900">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div v-if="mobileMenuOpen" class="md:hidden py-4 border-t">
        <div class="flex flex-col space-y-4">
          <ClientOnly>
            <!-- Show user info at top of mobile menu when authenticated -->
            <template v-if="isAuthenticated">
              <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-semibold">
                  {{ userInitial }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ user?.displayName || 'User' }}</p>
                  <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                </div>
              </div>
            </template>
          </ClientOnly>
          <NuxtLink to="/retroact" class="text-gray-600 hover:text-primary-600" @click="mobileMenuOpen = false">Products</NuxtLink>
          <NuxtLink to="/pricing" class="text-gray-600 hover:text-primary-600" @click="mobileMenuOpen = false">Pricing</NuxtLink>
          <NuxtLink to="/contact" class="text-gray-600 hover:text-primary-600" @click="mobileMenuOpen = false">Contact</NuxtLink>
          <hr class="my-2" />
          <ClientOnly>
            <template v-if="isAuthenticated">
              <NuxtLink to="/account" class="flex items-center gap-2 text-gray-600" @click="mobileMenuOpen = false">
                <i class="fa-solid fa-user-gear text-gray-400"></i>
                Account
              </NuxtLink>
              <button @click="handleSignOut" class="flex items-center gap-2 text-gray-600 text-left">
                <i class="fa-solid fa-arrow-right-from-bracket text-gray-400"></i>
                Sign Out
              </button>
            </template>
            <template v-else>
              <NuxtLink to="/signin" class="text-gray-600" @click="mobileMenuOpen = false">Sign In</NuxtLink>
              <NuxtLink to="/signup" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-center" @click="mobileMenuOpen = false">Get Started</NuxtLink>
            </template>
          </ClientOnly>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup>
const mobileMenuOpen = ref(false)
const isScrolled = ref(false)
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const { isAuthenticated, user, signOutUser } = useAuth()
const router = useRouter()
const route = useRoute()
const { subHeaderVisible } = useSubHeaderState()

// Pages that have a Level 2 sub-header bar
const hasSubHeader = computed(() => {
  return route.path.startsWith('/account') || route.path.startsWith('/retroact')
})

// Show shadow when:
// - Scrolled AND no sub-header on this page, OR
// - Scrolled AND sub-header is hidden (hide-on-scroll-down)
const showShadow = computed(() => {
  if (!isScrolled.value) return false
  if (!hasSubHeader.value) return true
  // Has sub-header: show shadow when sub-header is hidden
  return !subHeaderVisible.value
})

// Compute user initials for avatar
const userInitial = computed(() => {
  if (user.value?.displayName) {
    const parts = user.value.displayName.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
    }
    return parts[0].charAt(0).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase()
  }
  return 'U'
})

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 0
  }
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleClickOutside)
  handleScroll() // Check initial state
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('click', handleClickOutside)
  })
})

const handleSignOut = async () => {
  await signOutUser()
  mobileMenuOpen.value = false
  await navigateTo('/')
}
</script>
