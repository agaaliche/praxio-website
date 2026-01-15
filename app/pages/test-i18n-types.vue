<script setup lang="ts">
/**
 * Example component demonstrating TypeScript autocomplete for translations
 * 
 * When you type $t(' in VSCode, you should see autocomplete with all 646 translation keys!
 */

const { $t } = useNuxtApp()

// ✅ These all have full autocomplete:
const examples = {
  header: $t('common.header.products'),
  auth: $t('auth.signIn.title'),
  pricing: $t('pricing.freeTrial.badge'),
  account: $t('account.dashboard.welcomeBack'),
  
  // With parameters
  daysLeft: $t('pricing.freeTrial.daysLeft', { 
    s: 's', 
    date: '2026-01-29' 
  })
}

// ❌ This will show TypeScript error:
// const invalid = $t('this.key.does.not.exist')
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-4">🎉 TypeScript Autocomplete Demo</h1>
    
    <div class="space-y-2">
      <p><strong>Header:</strong> {{ examples.header }}</p>
      <p><strong>Auth:</strong> {{ examples.auth }}</p>
      <p><strong>Pricing:</strong> {{ examples.pricing }}</p>
      <p><strong>Account:</strong> {{ examples.account }}</p>
      <p><strong>Days Left:</strong> {{ examples.daysLeft }}</p>
    </div>
    
    <div class="mt-8 p-4 bg-blue-50 rounded">
      <h2 class="font-semibold mb-2">✨ Try it yourself:</h2>
      <ol class="list-decimal list-inside space-y-1 text-sm">
        <li>Open this file in VSCode</li>
        <li>Type <code>$t('</code> and wait for autocomplete</li>
        <li>You'll see all 646 translation keys!</li>
        <li>Type an invalid key and see TypeScript error</li>
      </ol>
    </div>
  </div>
</template>
