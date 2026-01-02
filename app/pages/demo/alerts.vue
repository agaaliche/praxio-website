<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center">Alert Pages Preview</h1>
      
      <!-- Loading Alert -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-10">
          ALERT-01
        </div>
        <h2 class="text-2xl font-semibold mb-4">Loading State</h2>
        <div class="border-4 border-blue-500 rounded-lg overflow-hidden">
          <AlertPage 
            type="loading"
            title="Connecting to your account"
            message="Please wait while we authenticate your session..."
          />
        </div>
      </div>

      <!-- Success Alert -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-10">
          ALERT-02
        </div>
        <h2 class="text-2xl font-semibold mb-4">Success State</h2>
        <div class="border-4 border-green-500 rounded-lg overflow-hidden">
          <AlertPage 
            type="success"
            title="Successfully signed out"
            message="You have been logged out of all applications. Redirecting to sign in page..."
          />
        </div>
      </div>

      <!-- Error Alert -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-10">
          ALERT-03
        </div>
        <h2 class="text-2xl font-semibold mb-4">Error State</h2>
        <div class="border-4 border-red-500 rounded-lg overflow-hidden">
          <AlertPage 
            type="error"
            title="Authentication Required"
            message="You must be signed in to access this application. Please sign in to continue."
          >
            <template #action>
              <button class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
                Sign In
              </button>
            </template>
          </AlertPage>
        </div>
      </div>

      <!-- Info Alert -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-10">
          ALERT-04
        </div>
        <h2 class="text-2xl font-semibold mb-4">Info State</h2>
        <div class="border-4 border-blue-500 rounded-lg overflow-hidden">
          <AlertPage 
            type="info"
            title="Account Verification"
            message="Please check your email to verify your account. A verification link has been sent to your email address."
          >
            <template #action>
              <button class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition">
                Resend Email
              </button>
            </template>
          </AlertPage>
        </div>
      </div>

      <!-- Warning Alert -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-10">
          ALERT-05
        </div>
        <h2 class="text-2xl font-semibold mb-4">Warning State</h2>
        <div class="border-4 border-yellow-500 rounded-lg overflow-hidden">
          <AlertPage 
            type="warning"
            title="Session Expiring Soon"
            message="Your session will expire in 5 minutes. Please save your work and refresh the page to continue."
          >
            <template #action>
              <button class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition">
                Refresh Session
              </button>
            </template>
          </AlertPage>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AlertPage from '~/../../packages/messaging/components/alerts/AlertPage.vue'
</script>
