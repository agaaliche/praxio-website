<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-center">Email Templates Preview</h1>
      
      <!-- Invitation Email -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-20">
          EMAIL-01
        </div>
        <h2 class="text-2xl font-semibold mb-4">Invitation Email</h2>
        <div class="border-4 border-purple-500 rounded-lg overflow-hidden bg-white">
          <div v-html="invitationHtml" class="p-8"></div>
        </div>
      </div>

      <!-- Credentials Email -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-20">
          EMAIL-02
        </div>
        <h2 class="text-2xl font-semibold mb-4">Credentials Email</h2>
        <div class="border-4 border-blue-500 rounded-lg overflow-hidden bg-white">
          <div v-html="credentialsHtml" class="p-8"></div>
        </div>
      </div>

      <!-- Verification Email -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-20">
          EMAIL-03
        </div>
        <h2 class="text-2xl font-semibold mb-4">Email Verification</h2>
        <div class="border-4 border-green-500 rounded-lg overflow-hidden bg-white">
          <div v-html="verificationHtml" class="p-8"></div>
        </div>
      </div>

      <!-- Password Reset Email -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-20">
          EMAIL-04
        </div>
        <h2 class="text-2xl font-semibold mb-4">Password Reset Email</h2>
        <div class="border-4 border-orange-500 rounded-lg overflow-hidden bg-white">
          <div v-html="passwordResetHtml" class="p-8"></div>
        </div>
      </div>

      <!-- Email Change Email -->
      <div class="mb-12 relative">
        <div class="absolute top-4 left-4 bg-black text-white px-3 py-1 rounded text-sm font-mono z-20">
          EMAIL-05
        </div>
        <h2 class="text-2xl font-semibold mb-4">Email Change Confirmation</h2>
        <div class="border-4 border-red-500 rounded-lg overflow-hidden bg-white">
          <div v-html="emailChangeHtml" class="p-8"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const invitationHtml = ref('')
const credentialsHtml = ref('')
const verificationHtml = ref('')
const passwordResetHtml = ref('')
const emailChangeHtml = ref('')

onMounted(async () => {
  // Fetch email previews from API
  const templates = [
    { ref: invitationHtml, type: 'invitation', data: {
      userName: 'Dr. John Smith',
      inviteLink: 'https://retroact.app/invite/abc123',
      inviterName: 'Dr. Sarah Johnson',
      organizationName: 'City Medical Center'
    }},
    { ref: credentialsHtml, type: 'credentials', data: {
      userName: 'Dr. John Smith',
      email: 'john.smith@example.com',
      temporaryPassword: 'TempPass123!',
      loginUrl: 'https://retroact.app/signin'
    }},
    { ref: verificationHtml, type: 'verification', data: {
      userName: 'Dr. John Smith',
      verificationLink: 'https://retroact.app/verify/xyz789'
    }},
    { ref: passwordResetHtml, type: 'passwordReset', data: {
      userName: 'Dr. John Smith',
      resetLink: 'https://retroact.app/reset-password/def456'
    }},
    { ref: emailChangeHtml, type: 'emailChange', data: {
      userName: 'Dr. John Smith',
      verificationLink: 'https://retroact.app/verify-email/ghi789',
      newEmail: 'john.smith.new@example.com'
    }}
  ]

  for (const template of templates) {
    try {
      const response = await $fetch('/api/email/preview', {
        method: 'POST',
        body: {
          type: template.type,
          data: template.data,
          locale: 'en'
        }
      })
      template.ref.value = response.html
    } catch (error) {
      console.error(`Error loading ${template.type}:`, error)
      // Fallback to sample HTML
      template.ref.value = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h1 style="color: #111827; font-size: 24px; margin-bottom: 16px;">${template.type.charAt(0).toUpperCase() + template.type.slice(1)} Email</h1>
            <p style="color: #4b5563; margin-bottom: 24px;">This is a preview of the ${template.type} email template.</p>
            <p style="color: #6b7280; font-size: 14px;">Error: API endpoint not available. Server needs to be restarted to load the preview endpoint.</p>
          </div>
          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 24px;">
            <p>© 2026 Praxio. All rights reserved.</p>
          </div>
        </div>
      `
    }
  }
})
</script>
