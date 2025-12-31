<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-white py-20 lg:py-28">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-4">
            {{ t('home.hero.tagline') }}
          </p>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-[1.1]">
            {{ t('home.hero.title1') }}<br />
            {{ t('home.hero.title2') }}<br />
            <span class="text-primary-600">{{ t('home.hero.title3') }}</span>
          </h1>
          <p class="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl">
            {{ t('home.hero.subtitle') }}
          </p>
          <div class="mt-10 flex flex-wrap gap-4">
            <NuxtLink 
              to="/retroact"
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
            >
              {{ t('home.hero.seeProducts') }}
              <i class="fa-solid fa-arrow-right ml-2"></i>
            </NuxtLink>
            <NuxtLink 
              to="/about"
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              {{ t('home.hero.learnAbout') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Anti-Bloat Manifesto -->
    <section class="py-20 bg-gray-900 text-white">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-display font-bold">
            {{ t('home.manifesto.title') }}
          </h2>
          <p class="mt-4 text-xl text-gray-400">
            {{ t('home.manifesto.subtitle') }}
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mt-12">
          <div class="text-center">
            <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <i class="fa-duotone fa-hands-bound text-2xl text-amber-400"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">{{ t('home.manifesto.noLockIn.title') }}</h3>
            <p class="text-gray-400 text-sm">
              {{ t('home.manifesto.noLockIn.description') }}
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-red-50 border border-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <i class="fa-duotone fa-bullseye-arrow text-2xl text-red-600"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">{{ t('home.manifesto.noFluff.title') }}</h3>
            <p class="text-gray-400 text-sm">
              {{ t('home.manifesto.noFluff.description') }}
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <i class="fa-duotone fa-sack-dollar text-2xl text-emerald-400"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">{{ t('home.manifesto.affordable.title') }}</h3>
            <p class="text-gray-400 text-sm">
              {{ t('home.manifesto.affordable.description') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Product - Retroact -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <!-- Content -->
          <div>
            <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-2">
              <i class="fa-kit-duotone fa-logo text-primary-600 text-4xl md:text-5xl"></i>
            </h2>
            <p class="text-lg text-primary-600 font-medium mb-4">
              {{ t('home.featured.subtitle') }}
            </p>
            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
              {{ t('home.featured.description') }}
            </p>
            
            <div class="flex flex-wrap gap-3 mb-8">
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-users-medical text-primary-500 mr-2"></i>
                {{ t('home.featured.patientManagement') }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-prescription-bottle-pill text-primary-500 mr-2"></i>
                {{ t('home.featured.doseManagement') }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-file-pdf text-primary-500 mr-2"></i>
                {{ t('home.featured.pdfPrescriptions') }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-calendar-day text-primary-500 mr-2"></i>
                {{ t('home.featured.scheduling') }}
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-sparkles text-primary-500 mr-2"></i>
                {{ t('home.featured.aiInsights') }}
              </span>
            </div>

            <div class="flex flex-wrap gap-4">
              <NuxtLink 
                to="/pricing"
                class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
              >
                {{ t('home.featured.tryItFree') }}
                <i class="fa-solid fa-arrow-right ml-2"></i>
              </NuxtLink>
              <NuxtLink 
                to="/retroact" 
                class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                {{ t('home.featured.seeAllFeatures') }}
                <i class="fa-solid fa-arrow-right ml-2"></i>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- The Praxio Difference -->
    <section class="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
            {{ t('home.difference.title') }}
          </h2>
          <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            {{ t('home.difference.subtitle') }}
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          <!-- Card 1 -->
          <div class="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start gap-5">
              <div class="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i class="fa-duotone fa-user-doctor text-3xl text-sky-600"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('home.difference.cards.teams.title') }}</h3>
                <p class="text-gray-600">
                  {{ t('home.difference.cards.teams.description') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Card 2 -->
          <div class="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start gap-5">
              <div class="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i class="fa-duotone fa-dollar-sign text-3xl text-amber-600"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('home.difference.cards.affordable.title') }}</h3>
                <p class="text-gray-600">
                  {{ t('home.difference.cards.affordable.description') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Card 3 -->
          <div class="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start gap-5">
              <div class="w-14 h-14 bg-violet-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i class="fa-duotone fa-door-open text-3xl text-violet-600"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('home.difference.cards.freedom.title') }}</h3>
                <p class="text-gray-600">
                  {{ t('home.difference.cards.freedom.description') }}
                </p>
              </div>
            </div>
          </div>

          <!-- Card 4 -->
          <div class="group bg-white rounded-2xl p-8 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all duration-300">
            <div class="flex items-start gap-5">
              <div class="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <i class="fa-duotone fa-phone-volume text-3xl text-emerald-600"></i>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ t('home.difference.cards.noSales.title') }}</h3>
                <p class="text-gray-600">
                  {{ t('home.difference.cards.noSales.description') }} <NuxtLink to="/pricing" class="text-primary-600 hover:text-primary-700 underline">{{ t('home.difference.cards.noSales.freeTrial') }}</NuxtLink>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-white border-t border-gray-100">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
          <i class="fa-duotone fa-lightbulb text-3xl text-primary-600"></i>
        </div>
        <h2 class="text-3xl md:text-4xl font-display font-bold text-gray-900">
          {{ t('home.finalCta.title') }}
        </h2>
        <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          {{ t('home.finalCta.subtitle') }}
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <NuxtLink 
            to="/pricing"
            class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
          >
            {{ t('home.finalCta.tryFree') }}
            <i class="fa-solid fa-arrow-right ml-2"></i>
          </NuxtLink>
          <NuxtLink 
            to="/contact"
            class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            {{ t('home.finalCta.getInTouch') }}
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup>
const { t } = useI18n()
</script>