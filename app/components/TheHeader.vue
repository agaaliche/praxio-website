<template>
  <!-- Impersonation Banner -->
  <ClientOnly>
    <div v-if="isImpersonating" class="bg-red-500 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-user-secret text-lg"></i>
            <span class="font-medium">
              Impersonating: {{ impersonatingAs }}
            </span>
          </div>
          <button
            @click="exitImpersonation"
            class="px-4 py-1.5 bg-white text-red-600 font-medium rounded-lg hover:bg-red-50 transition flex items-center gap-2"
          >
            <i class="fa-solid fa-right-from-bracket"></i>
            Exit Impersonation
          </button>
        </div>
      </div>
    </div>
  </ClientOnly>

  <header :class="[
    'bg-white sticky top-0 z-50 transition-shadow duration-200 shadow-mobile',
    showShadow && 'shadow-lg'
  ]">
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
            {{ t('header.products') }}
          </NuxtLink>
          <NuxtLink v-if="!userRole" to="/pricing" class="text-gray-600 hover:text-primary-600 transition px-3 py-1.5 rounded-lg" active-class="!text-primary-600 font-medium border border-primary-600">
            {{ t('header.plans') }}
          </NuxtLink>
          <NuxtLink to="/contact" class="text-gray-600 hover:text-primary-600 transition px-3 py-1.5 rounded-lg" active-class="!text-primary-600 font-medium border border-primary-600">
            {{ t('header.contact') }}
          </NuxtLink>
          <ClientOnly>
            <NuxtLink v-if="isAuthenticated" to="/account" class="text-gray-600 hover:text-primary-600 transition px-3 py-1.5 rounded-lg flex items-center gap-2" active-class="!text-primary-600 font-medium border border-primary-600">
              {{ t('header.account') }}
              <i v-if="isTrialExpired" class="fa-solid fa-triangle-exclamation"></i>
            </NuxtLink>
            <NuxtLink v-if="isSiteAdmin" to="/admin" class="text-red-600 hover:text-red-700 transition px-3 py-1.5 rounded-lg font-medium flex items-center gap-2" active-class="!text-red-600 font-bold border border-red-600">
              <i class="fa-solid fa-shield"></i>
              Admin
            </NuxtLink>
          </ClientOnly>
        </div>

        <!-- CTA Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Language Selector -->
          <ClientOnly>
            <LanguageSelector />
          </ClientOnly>
          
          <ClientOnly>
            <!-- Show Avatar dropdown if authenticated -->
            <template v-if="isAuthenticated">
              <div class="relative" ref="dropdownRef">
                <button 
                  @click="dropdownOpen = !dropdownOpen" 
                  class="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-600 font-semibold hover:bg-primary-200 transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  :title="user?.email || 'Account'"
                >
                  {{ userInitial }}
                  <!-- Notification Dot Indicator -->
                  <span
                    v-if="unreadCount > 0"
                    class="absolute bottom-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"
                  ></span>
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
                      <p class="text-sm font-medium text-gray-900">{{ displayName }}</p>
                      <p class="text-sm text-gray-500 truncate">{{ user?.email }}</p>
                      <span v-if="userRole" :class="roleChipClass" class="inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full">
                        {{ userRole === 'editor' ? t('roles.editor') : t('roles.viewer') }}
                      </span>
                    </div>
                    
                    <!-- Tickets Button -->
                    <button 
                      @click="openTickets" 
                      class="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <div class="flex items-center gap-3">
                        <i class="fa-solid fa-ticket text-gray-400"></i>
                        <span>{{ t('tickets.title') }}</span>
                      </div>
                    </button>
                    
                    <!-- Notifications Button -->
                    <button 
                      @click="openNotifications" 
                      class="flex items-center justify-between w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                    >
                      <div class="flex items-center gap-3">
                        <i class="fa-solid fa-bell text-gray-400"></i>
                        <span>Notifications</span>
                      </div>
                      <span
                        v-if="unreadCount > 0"
                        class="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full"
                      >
                        {{ unreadCount > 9 ? '9+' : unreadCount }}
                      </span>
                    </button>

                    <div class="border-t border-gray-100 my-1"></div>

                    <div class="px-4 py-3">
                      <button 
                        @click="navigateToRetroact" 
                        class="w-full px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 transition text-sm"
                      >
                        {{ t('header.openRetroact') }}
                      </button>
                    </div>
                    <button 
                      @click="handleSignOut" 
                      class="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition text-left"
                    >
                      <i class="fa-solid fa-arrow-right-from-bracket text-gray-400"></i>
                      {{ t('header.signOut') }}
                    </button>
                  </div>
                </Transition>
              </div>
            </template>
            <!-- Show Sign In / Get Started if not authenticated -->
            <template v-else>
              <NuxtLink to="/signin" class="text-gray-600 hover:text-primary-600 transition">
                {{ t('header.signIn') }}
              </NuxtLink>
              <NuxtLink to="/signup" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                {{ t('header.getStarted') }}
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
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-100 absolute left-0 right-0 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div class="py-4 px-4 pb-24 space-y-1 bg-white">
            <ClientOnly>
              <!-- Show user info at top of mobile menu when authenticated -->
              <template v-if="isAuthenticated">
                <div class="flex items-center gap-3 p-3 mb-3 bg-gradient-to-r from-primary-50 to-white rounded-xl border border-primary-100">
                  <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white font-semibold text-lg">
                    {{ userInitial }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ user?.displayName || 'User' }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ user?.email }}</p>
                    <span v-if="userRole" :class="roleChipClass" class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full">
                      {{ userRole === 'editor' ? t('roles.editor') : t('roles.viewer') }}
                    </span>
                  </div>
                </div>
              </template>
            </ClientOnly>
            
            <NuxtLink to="/retroact" class="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium transition" @click="mobileMenuOpen = false">
              <i class="fa-solid fa-box-open w-5 text-center text-primary-600"></i>
              {{ t('header.products') }}
            </NuxtLink>
            <NuxtLink to="/retroact#feature-overview" class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm transition" @click="mobileMenuOpen = false">
              <i class="fa-solid fa-grid-2 w-4 text-center"></i>
              {{ t('header.featureOverview') }}
            </NuxtLink>
            <NuxtLink to="/retroact#in-action" class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm transition" @click="mobileMenuOpen = false">
              <i class="fa-solid fa-play w-4 text-center"></i>
              {{ t('header.inAction') }}
            </NuxtLink>
            
            <NuxtLink v-if="!userRole" to="/pricing" class="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium transition" @click="mobileMenuOpen = false">
              <i class="fa-solid fa-tags w-5 text-center text-primary-600"></i>
              {{ t('header.plans') }}
            </NuxtLink>
            <NuxtLink to="/contact" class="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium transition" @click="mobileMenuOpen = false">
              <i class="fa-solid fa-envelope w-5 text-center text-primary-600"></i>
              {{ t('header.contact') }}
            </NuxtLink>
            
            <ClientOnly>
              <NuxtLink 
                v-if="isSiteAdmin"
                to="/admin" 
                @click="mobileMenuOpen = false"
                class="flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg font-medium transition"
                active-class="!bg-red-100 !text-red-600 !font-bold border border-red-600"
              >
                <i class="fa-solid fa-shield w-5 text-center"></i>
                Admin
              </NuxtLink>
            </ClientOnly>
            
            <div class="my-3 border-t border-gray-200"></div>
            
            <ClientOnly>
              <template v-if="isAuthenticated">
                <NuxtLink to="/account" class="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium transition" @click="mobileMenuOpen = false">
                  <i class="fa-solid fa-user-gear w-5 text-center text-primary-600"></i>
                  {{ t('header.account') }}
                  <i v-if="isTrialExpired" class="fa-solid fa-triangle-exclamation ml-auto text-orange-500"></i>
                </NuxtLink>
                
                <!-- Account sub-navigation -->
                <NuxtLink 
                  v-if="hasAccess"
                  to="/account" 
                  class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm transition"
                  @click="mobileMenuOpen = false"
                >
                  <i class="fa-solid fa-house w-4 text-center"></i>
                  {{ t('header.dashboard') }}
                </NuxtLink>
                <span 
                  v-else
                  class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-300 rounded-lg text-sm cursor-not-allowed"
                >
                  <i class="fa-solid fa-house w-4 text-center"></i>
                  {{ t('header.dashboard') }}
                </span>
                <NuxtLink 
                  v-if="hasAccess"
                  to="/account/patients" 
                  class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm transition"
                  @click="mobileMenuOpen = false"
                >
                  <i class="fa-solid fa-users-medical w-4 text-center"></i>
                  {{ t('header.patients') }}
                </NuxtLink>
                <span 
                  v-else
                  class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-300 rounded-lg text-sm cursor-not-allowed"
                >
                  <i class="fa-solid fa-users-medical w-4 text-center"></i>
                  {{ t('header.patients') }}
                </span>
                <NuxtLink 
                  v-if="isAccountOwner && hasAccess"
                  to="/account/team" 
                  class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm transition"
                  @click="mobileMenuOpen = false"
                >
                  <i class="fa-solid fa-users w-4 text-center"></i>
                  {{ t('header.team') }}
                </NuxtLink>
                <span 
                  v-else-if="isAccountOwner && !hasAccess"
                  class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-300 rounded-lg text-sm cursor-not-allowed"
                >
                  <i class="fa-solid fa-users w-4 text-center"></i>
                  {{ t('header.team') }}
                </span>
                <NuxtLink 
                  to="/account/settings" 
                  class="flex items-center gap-3 px-3 py-2.5 pl-11 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg text-sm transition"
                  @click="mobileMenuOpen = false"
                >
                  <i class="fa-solid fa-gear w-4 text-center"></i>
                  {{ t('header.settings') }}
                </NuxtLink>
                
                <!-- Language Selector (Mobile) -->
                <button 
                  @click="mobileLanguageOpen = !mobileLanguageOpen"
                  class="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium transition text-left"
                >
                  <i class="fa-solid fa-globe w-5 text-center text-primary-600"></i>
                  <span class="flex-1">Language ({{ locale.toUpperCase() }})</span>
                  <i class="fa-solid fa-chevron-down text-xs transition-transform" :class="{ 'rotate-180': mobileLanguageOpen }"></i>
                </button>
                <template v-if="mobileLanguageOpen">
                  <button
                    v-for="lang in locales"
                    :key="lang"
                    @click="handleLanguageChange(lang)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 pl-11 rounded-lg text-sm transition text-left"
                    :class="locale === lang ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                  >
                    <span class="uppercase">{{ lang }}</span>
                    <span class="flex-1">{{ getLanguageName(lang) }}</span>
                    <i v-if="locale === lang" class="fa-solid fa-check text-primary-600"></i>
                  </button>
                </template>
                
                <button @click="handleSignOut" class="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg font-medium transition text-left">
                  <i class="fa-solid fa-arrow-right-from-bracket w-5 text-center text-red-600"></i>
                  {{ t('header.signOut') }}
                </button>
              </template>
              <template v-else>
                <!-- Language Selector (Mobile - Not Authenticated) -->
                <button 
                  @click="mobileLanguageOpen = !mobileLanguageOpen"
                  class="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium transition text-left"
                >
                  <i class="fa-solid fa-globe w-5 text-center text-primary-600"></i>
                  <span class="flex-1">Language ({{ locale.toUpperCase() }})</span>
                  <i class="fa-solid fa-chevron-down text-xs transition-transform" :class="{ 'rotate-180': mobileLanguageOpen }"></i>
                </button>
                <template v-if="mobileLanguageOpen">
                  <button
                    v-for="lang in locales"
                    :key="lang"
                    @click="handleLanguageChange(lang)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 pl-11 rounded-lg text-sm transition text-left"
                    :class="locale === lang ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
                  >
                    <span class="uppercase">{{ lang }}</span>
                    <span class="flex-1">{{ getLanguageName(lang) }}</span>
                    <i v-if="locale === lang" class="fa-solid fa-check text-primary-600"></i>
                  </button>
                </template>
                
                <NuxtLink to="/signin" class="flex items-center gap-3 px-3 py-2.5 text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-lg font-medium transition" @click="mobileMenuOpen = false">
                  <i class="fa-solid fa-arrow-right-to-bracket w-5 text-center text-primary-600"></i>
                  {{ t('header.signIn') }}
                </NuxtLink>
                <NuxtLink to="/signup" class="flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition mt-2" @click="mobileMenuOpen = false">
                  <i class="fa-solid fa-sparkles"></i>
                  {{ t('header.getStarted') }}
                </NuxtLink>
              </template>
            </ClientOnly>
          </div>
          <!-- Blue spacer from menu bottom to window bottom -->
          <div class="bg-primary-600 min-h-[calc(100vh-100%)]"></div>
        </div>
      </Transition>
    </nav>

    <!-- Notification Panel -->
    <ClientOnly>
      <NotificationPanel
        :isOpen="notificationPanelOpen"
        @close="notificationPanelOpen = false"
        @refresh="fetchUnreadCount"
      />
      
      <TicketsDialog
        :isOpen="ticketsDialogOpen"
        @close="ticketsDialogOpen = false"
      />
    </ClientOnly>
  </header>
</template>

<script setup>
const mobileMenuOpen = ref(false)
const mobileLanguageOpen = ref(false)
const isScrolled = ref(false)
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const notificationPanelOpen = ref(false)
const ticketsDialogOpen = ref(false)
const unreadCount = ref(0)
const { isImpersonating, impersonatingAs, initializeFromStorage, clearImpersonation } = useImpersonation()
const { isAuthenticated, user, signOutUser, isAccountOwner, getIdToken, isSiteAdmin } = useAuth()
const { isTrialExpired, needsSubscription } = useSubscription()
const { t, locale, locales, setLocale } = useI18n()
const router = useRouter()
const route = useRoute()
const { subHeaderVisible } = useSubHeaderState()

// Exit impersonation
const exitImpersonation = async () => {
  try {
    // Get a token for the original admin
    const { getAuthHeaders } = useAuth()
    const headers = await getAuthHeaders()
    
    const response = await $fetch('/api/admin/exit-impersonation', {
      method: 'POST',
      headers
    })
    
    if (!response.token) {
      throw new Error('No token returned')
    }
    
    // Sign in as the original admin
    const { signInWithCustomToken } = await import('firebase/auth')
    const { $auth } = useNuxtApp()
    
    if (!$auth) {
      throw new Error('Firebase not initialized')
    }
    
    await signInWithCustomToken($auth, response.token)
    
    // Wait for auth state to update
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Clear impersonation state
    clearImpersonation()
    
    console.log('✅ Exited impersonation, logged back in as admin')
    
    // Navigate to impersonation page
    await navigateTo('/admin/impersonate')
  } catch (error) {
    console.error('❌ Failed to exit impersonation:', error)
    // Fallback: just clear state and sign out
    clearImpersonation()
    await signOutUser()
    await navigateTo('/admin/impersonate')
  }
}

// User data from API (includes correct role without stale claims)
const userData = ref(null)

// Fetch user data from API to get correct role
const fetchUserData = async () => {
  if (!isAuthenticated.value) {
    userData.value = null
    return
  }
  
  try {
    console.log('🔄 Praxio TheHeader: Fetching user data...')
    const token = await getIdToken()
    const response = await $fetch('/api/users/current', {
      headers: { Authorization: `Bearer ${token}` }
    })
    userData.value = response
    console.log('✅ Praxio: User data fetched:', { email: response.email, role: response.role, preferences: response.preferences })
    
    // Apply language preference from database if available (but not during impersonation)
    if (!isImpersonating.value && response.preferences?.language && response.preferences.language !== locale.value) {
      console.log(`🌍 Praxio: Loading language preference from database: ${response.preferences.language}`)
      setLocale(response.preferences.language)
    } else {
      console.log(`ℹ️ Praxio: Current language already matches preference: ${locale.value}`)
    }
  } catch (err) {
    console.error('❌ Praxio: Failed to fetch user data:', err)
    userData.value = null
  }
}

// Watch for auth changes
watch(isAuthenticated, (newVal) => {
  if (newVal) {
    fetchUserData()
  } else {
    userData.value = null
  }
}, { immediate: true })

// Watch for impersonation changes - refetch user data when impersonation state changes
watch(isImpersonating, () => {
  console.log('👥 Impersonation state changed, refetching user data')
  if (isAuthenticated.value) {
    fetchUserData()
  }
})

// Check if user has access to account features
const hasAccess = computed(() => !needsSubscription.value)

// User role from API data (not from Firebase token)
const userRole = computed(() => userData.value?.role || null)

// Language names
const languageNames = {
  en: 'English',
  fr: 'Français'
}

const getLanguageName = (lang) => languageNames[lang] || lang

const handleLanguageChange = async (lang) => {
  setLocale(lang)
  mobileLanguageOpen.value = false
  
  // Save language preference to database if authenticated
  if (isAuthenticated.value) {
    try {
      const token = await getIdToken()
      await $fetch('/api/users/preferences', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: { language: lang }
      })
      console.log('✅ Language preference saved to database')
    } catch (err) {
      console.error('Failed to save language preference:', err)
    }
  }
}

// Role chip styling
const roleChipClass = computed(() => {
  if (userRole.value === 'editor') {
    return 'bg-gray-100 text-blue-600 border border-blue-600'
  }
  if (userRole.value === 'viewer') {
    return 'bg-gray-100 text-blue-600 border border-blue-600'
  }
  return ''
})

// Pages that have a Level 2 sub-header bar
const hasSubHeader = computed(() => {
  return route.path.startsWith('/account') || route.path.startsWith('/admin') || route.path.startsWith('/retroact')
})

// Show shadow when:
// - Never in account or admin pages (level 2 nav always visible)
// - On mobile: Always show shadow (except account/admin pages)
// - On desktop: Scrolled AND (no sub-header OR sub-header is hidden)
const showShadow = computed(() => {
  const isAccount = route.path.startsWith('/account')
  const isAdmin = route.path.startsWith('/admin')
  const isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 768
  
  // Never show shadow in account or admin pages (level 2 nav always visible)
  if (isAccount || isAdmin) return false
  
  // On mobile, always show shadow
  if (isSmallScreen) return true
  
  // On desktop, use sub-header logic
  if (!isScrolled.value) return false
  if (!hasSubHeader.value) return true
  return !subHeaderVisible.value
})

// Compute user initials for avatar
const userInitial = computed(() => {
  // Use API data for name if available
  const firstName = userData.value?.firstName
  const lastName = userData.value?.lastName
  
  if (firstName && lastName) {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase()
  }
  
  // Fallback to Firebase user data
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

// Computed display name
const displayName = computed(() => {
  const firstName = userData.value?.firstName
  const lastName = userData.value?.lastName
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }
  if (firstName) {
    return firstName
  }
  return user.value?.displayName || user.value?.email || 'User'
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
  initializeFromStorage() // Initialize impersonation state from localStorage
  
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

const navigateToRetroact = async () => {
  try {
    const { generateSSOLink } = useRetroactSSO()
    const ssoUrl = await generateSSOLink()
    window.open(ssoUrl, '_blank')
    dropdownOpen.value = false
  } catch (error) {
    console.error('Failed to navigate to Retroact:', error)
    // Fallback: redirect to Retroact homepage
    const config = useRuntimeConfig()
    window.open(config.public.retroactUrl, '_blank')
    dropdownOpen.value = false
  }
}

// Open notifications panel
const openNotifications = () => {
  dropdownOpen.value = false
  notificationPanelOpen.value = true
}

// Open tickets dialog
const openTickets = () => {
  dropdownOpen.value = false
  ticketsDialogOpen.value = true
}

// Fetch unread notification count
const fetchUnreadCount = async () => {
  if (!isAuthenticated.value) return
  
  try {
    const { getAuthHeaders } = useAuth()
    const headers = await getAuthHeaders()
    
    const response = await fetch('/api/messages/inbox', { headers })
    const data = await response.json()
    
    if (data.success) {
      unreadCount.value = data.count || 0
    }
  } catch (error) {
    console.error('❌ Error fetching unread count:', error)
  }
}

// Fetch unread count on mount and when authenticated
watch(isAuthenticated, (authenticated) => {
  if (authenticated) {
    fetchUnreadCount()
    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000)
    onUnmounted(() => clearInterval(interval))
  }
}, { immediate: true })
</script>

<style scoped>
/* Always show shadow on mobile screens */
@media (max-width: 767px) {
  .shadow-mobile {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  }
}
</style>
