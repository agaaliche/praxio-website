<template>
  <div>
    <!-- Hero Section -->
    <section class="relative overflow-hidden bg-white py-20 lg:py-28">
      <div class="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-transparent to-secondary-50/30"></div>
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-3xl">
          <p class="text-primary-600 font-semibold tracking-wide uppercase text-sm mb-4">
            Healthcare Software, Reimagined
          </p>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-[1.1]">
            One problem.<br />
            One app.<br />
            <span class="text-primary-600">Done right.</span>
          </h1>
          <p class="mt-8 text-xl text-gray-600 leading-relaxed max-w-2xl">
            We build small, focused tools for healthcare professionals. No bloat, no complexity — just software that works the way you do.
          </p>
          <div class="mt-10 flex flex-wrap gap-4">
            <NuxtLink 
              to="/retroact"
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
            >
              See Our Products
              <i class="fa-solid fa-arrow-right ml-2"></i>
            </NuxtLink>
            <NuxtLink 
              to="/about"
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
            >
              Learn About Us
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
            We're not building the next EHR
          </h2>
          <p class="mt-4 text-xl text-gray-400">
            And that's exactly the point.
          </p>
        </div>
        
        <div class="grid md:grid-cols-3 gap-8 mt-12">
          <div class="text-center">
            <div class="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <i class="fa-duotone fa-hands-bound text-2xl text-amber-400"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">No vendor lock-in</h3>
            <p class="text-gray-400 text-sm">
              Month-to-month billing. Backup all your data to .csv anytime. You're always in control.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-red-50 border border-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <i class="fa-duotone fa-bullseye-arrow text-2xl text-red-600"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">No fluff</h3>
            <p class="text-gray-400 text-sm">
              Clinician-built, clinician-approved. Every feature follows your natural workflow — no learning curve.
            </p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <i class="fa-duotone fa-sack-dollar text-2xl text-emerald-400"></i>
            </div>
            <h3 class="font-bold text-lg mb-2">Affordable</h3>
            <p class="text-gray-400 text-sm">
              No sticker shock here. We build lean, we price fair, and we pass the savings to you.
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
              INR Management for Pharmacies, Labs & Clinics
            </p>
            <p class="text-lg text-gray-600 mb-6 leading-relaxed">
              Everything you need to manage anticoagulant therapy — patient tracking, dose adjustments, PDF prescriptions, and smart scheduling — in one clean interface.
            </p>
            
            <div class="flex flex-wrap gap-3 mb-8">
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-users-medical text-primary-500 mr-2"></i>
                Patient Management
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-prescription-bottle-pill text-primary-500 mr-2"></i>
                Dose Management
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-file-pdf text-primary-500 mr-2"></i>
                PDF Prescriptions
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-calendar-day text-primary-500 mr-2"></i>
                Scheduling
              </span>
              <span class="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                <i class="fa-duotone fa-sparkles text-primary-500 mr-2"></i>
                AI Insights
              </span>
            </div>

            <div class="flex flex-wrap gap-4">
              <a 
                href="https://retroact.app" 
                target="_blank"
                class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
              >
                Try It Free
                <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i>
              </a>
              <NuxtLink 
                to="/retroact" 
                class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                See All Features
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
            Built different, on purpose
          </h2>
          <p class="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We questioned everything about how healthcare software is made.
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
                <h3 class="text-xl font-bold text-gray-900 mb-2">Built for teams</h3>
                <p class="text-gray-600">
                  Add team members with view or edit access in seconds.
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
                <h3 class="text-xl font-bold text-gray-900 mb-2">Affordable</h3>
                <p class="text-gray-600">
                  One price, everything included. No per-user fees.
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
                <h3 class="text-xl font-bold text-gray-900 mb-2">Leave anytime</h3>
                <p class="text-gray-600">
                  No mandatory commitment, no lock-in. Export your data and cancel whenever you want with a monthly subscription.
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
                <h3 class="text-xl font-bold text-gray-900 mb-2">Who needs sales reps?</h3>
                <p class="text-gray-600">
                  We skip the demo theater. Sign up, explore, decide for yourself with a <NuxtLink to="/pricing" class="text-primary-600 hover:text-primary-700 underline">free trial</NuxtLink>.
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
          Ready to try something different?
        </h2>
        <p class="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
          Join healthcare professionals who chose focused tools over feature overload.
        </p>
        <div class="mt-10 flex flex-wrap justify-center gap-4">
          <a 
            href="https://retroact.app" 
            target="_blank"
            class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition shadow-lg shadow-primary-600/20"
          >
            Try Retroact Free
            <i class="fa-solid fa-arrow-up-right-from-square ml-2"></i>
          </a>
          <NuxtLink 
            to="/contact"
            class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Get in Touch
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
