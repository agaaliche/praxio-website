<template>
  <div>
    <!-- Breadcrumbs (Mobile Only) -->
    <nav class="pt-4 mb-4 md:hidden px-4 sm:px-6 lg:px-8">
      <ol class="flex items-center gap-2 text-sm text-primary-600">
        <li>
          <NuxtLink to="/" class="hover:text-primary-700 transition">Home</NuxtLink>
        </li>
        <li class="text-primary-400">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </li>
        <li class="font-medium">
          Contact
        </li>
      </ol>
    </nav>
    
    <!-- Hero -->
    <section class="bg-gradient-to-br from-primary-50 to-white pt-8 pb-4">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Have questions? We'd love to hear from you.
        </p>
      </div>
    </section>

    <!-- Contact Form -->
    <section class="pb-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="form.firstName"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="form.lastName"
                  required
                  class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>

            <div>
              <label for="subject" class="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select 
                id="subject" 
                v-model="form.subject"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              >
                <option value="general">General Inquiry</option>
                <option value="sales">Sales</option>
                <option value="support">Support</option>
                <option value="partnership">Partnership</option>
              </select>
            </div>

            <div>
              <label for="message" class="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea 
                id="message" 
                v-model="form.message"
                rows="5"
                required
                class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition resize-none"
              ></textarea>
            </div>

            <button 
              type="submit"
              :disabled="submitting"
              class="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? 'Sending...' : 'Send Message' }}
            </button>

            <p v-if="submitted" class="text-center text-green-600 font-medium">
              Thank you! We'll get back to you soon.
            </p>
          </form>
        </div>

        <!-- Alternative Contact -->
        <div class="mt-12 text-center">
          <p class="text-gray-600 mb-4">Or reach us directly:</p>
          <a href="mailto:contact@praxio.net" class="text-primary-600 font-semibold hover:text-primary-700">
            contact@praxio.net
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Contact - Praxio',
  description: 'Get in touch with the Praxio team for questions, support, or partnership inquiries.'
})

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  subject: 'general',
  message: ''
})

const submitting = ref(false)
const submitted = ref(false)

const handleSubmit = async () => {
  submitting.value = true
  // TODO: Implement actual form submission
  await new Promise(resolve => setTimeout(resolve, 1000))
  submitted.value = true
  submitting.value = false
}
</script>
