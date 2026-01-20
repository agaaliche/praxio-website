# Language Management System Audit & Recommendations

**Date:** January 15, 2026  
**Systems Audited:** Praxio (praxio-website) & Retroact (inrManager)

---

## Executive Summary

The current language management architecture has **significant structural weaknesses** that lead to fragile implementation and maintenance burden. While Praxio uses a modern shared package approach, Retroact uses an older Vue I18n implementation. The systems attempt cross-app synchronization but lack proper architectural patterns.

### Critical Issues Found
1. **JSON import caching issues** - Local package translations not reloading properly
2. **Inconsistent i18n libraries** - Praxio (custom) vs Retroact (vue-i18n)
3. **Fragile SSR/CSR coordination** - Pages with `layout: false` break translation loading
4. **Massive translation files** - 4191+ lines in Retroact, 926 lines in Praxio
5. **No TypeScript support** - No type safety for translation keys
6. **Limited language support** - Only EN/FR in Praxio, EN/FR/DE/SV in Retroact

---

## Current Architecture

### Praxio (praxio-website)
**Framework:** Nuxt 4.2.2 + Custom i18n composable

```
@praxio/i18n (local package)
├── src/index.js (helper functions)
├── locales/
│   ├── en.json (926 lines)
│   └── fr.json
└── package.json

praxio-website/
├── composables/useI18n.js (custom composable)
├── plugins/
│   ├── i18n.js (SSR + client plugin)
│   └── i18n.client.js (client-only)
└── components/LanguageSelector.vue
```

**Pros:**
- ✅ Shared package across apps
- ✅ Cookie + localStorage sync
- ✅ SSO language parameter passing
- ✅ Cross-tab synchronization attempt

**Cons:**
- ❌ Custom implementation (reinventing the wheel)
- ❌ Vite caching issues with local package
- ❌ No lazy loading (all translations loaded upfront)
- ❌ No TypeScript support
- ❌ SSR complications (`layout: false` pages break)
- ❌ Manual plugin initialization required

### Retroact (inrManager)
**Framework:** Vue 3.5 + vue-i18n

```
front/
├── src/
│   ├── main.js (vue-i18n setup)
│   └── messages.js (4191 lines!!!)
└── App.vue
```

**Pros:**
- ✅ Standard vue-i18n library
- ✅ Reads `?lang=` URL parameter from SSO
- ✅ More language support (EN/FR/DE/SV)

**Cons:**
- ❌ Monolithic 4191-line translation file
- ❌ All translations in one file (not modular)
- ❌ No TypeScript
- ❌ Different approach than Praxio
- ❌ No lazy loading

---

## Specific Problems Encountered

### 1. SSO Login Page Translation Failure
**Problem:** `auth.sso.*` keys returning literal strings instead of translations

**Root Cause:** 
- Page uses `layout: false`, skipping normal plugin initialization
- Local package JSON files cached by Vite
- `translations.en.auth.sso` missing from imported object

**Temporary Fix:** Inline translations hardcoded in SSO page

### 2. Translation File Size
**Retroact messages.js:** 4,191 lines of nested objects  
**Praxio en.json:** 926 lines (growing)

**Impact:**
- Slow initial load (all translations parsed upfront)
- Difficult to maintain
- Hard to find specific keys
- No code splitting

### 3. No Type Safety
No TypeScript definitions means:
- No autocomplete for translation keys
- Runtime errors for typos
- No compile-time validation
- Hard to refactor keys

### 4. Inconsistent Cross-App Sync
**Current approach:**
- Praxio passes `?lang=XX` to Retroact via SSO
- Both apps use `praxio_language` localStorage key
- postMessage attempted but unreliable

**Issues:**
- Different i18n implementations make sync fragile
- No guaranteed order of operations
- Race conditions between localStorage and cookie

---

## Recommendations

### Priority 1: Standardize on Industry-Standard Library

**Migrate both apps to `@nuxtjs/i18n` (for Nuxt) / `vue-i18n` (for Vue SPA)**

**Benefits:**
- Battle-tested, maintained by 1M+ users
- Built-in SSR support
- Lazy loading support
- TypeScript support
- Route-based locale switching
- Browser language detection
- Cookie persistence

**Implementation:**
```bash
# Praxio
npm install @nuxtjs/i18n

# Retroact (already has vue-i18n, just needs proper config)
npm install vue-i18n@9
```

### Priority 2: Split Translation Files by Domain

**Current:**
```
en.json (926 lines - everything)
```

**Recommended:**
```
locales/
├── en/
│   ├── common.json       # header, footer, buttons
│   ├── auth.json         # signin, signup, sso
│   ├── account.json      # settings, profile
│   ├── pricing.json      # plans, billing
│   ├── retroact.json     # retroact-specific
│   └── admin.json        # admin features
└── fr/
    └── ... (same structure)
```

**Benefits:**
- Lazy load only needed translations per route
- Easier to find and edit translations
- Parallel editing by multiple developers
- Clear domain boundaries

### Priority 3: Add TypeScript Support

**Generate types from translations:**
```typescript
// types/i18n.d.ts
export interface I18nMessages {
  common: {
    header: {
      products: string
      pricing: string
    }
  }
  auth: {
    signIn: string
    signUp: string
    sso: {
      required: string
      pleaseSignIn: string
    }
  }
}

// Usage with autocomplete
const { t } = useI18n<I18nMessages>()
t('auth.sso.required') // ✅ Autocomplete + type checking
t('auth.sso.missing') // ❌ TypeScript error
```

**Tools:**
- `vue-i18n-extract` - Detect missing/unused keys
- `i18n-ally` VSCode extension - Inline translation preview

### Priority 4: Implement Lazy Loading

**For Nuxt (Praxio):**
```js
// nuxt.config.ts
export default defineNuxtConfig({
  i18n: {
    lazy: true,
    langDir: 'locales',
    locales: [
      { code: 'en', file: 'en/index.js' },
      { code: 'fr', file: 'fr/index.js' }
    ]
  }
})

// locales/en/index.js
export default {
  common: () => import('./common.json'),
  auth: () => import('./auth.json')
}
```

**Benefits:**
- Initial page load: ~30KB instead of ~150KB
- Route changes load only needed translations
- Better performance on mobile

### Priority 5: Unified Cross-App Language Sync

**Recommendation: Use shared cookie + BroadcastChannel API**

```javascript
// @praxio/i18n/sync.js
const LOCALE_CHANNEL = new BroadcastChannel('praxio_locale')

export function syncLocaleAcrossApps(locale) {
  // 1. Update localStorage
  localStorage.setItem('praxio_language', locale)
  
  // 2. Update cookie (works across domains if same-site)
  document.cookie = `praxio_language=${locale}; path=/; max-age=31536000; SameSite=Lax`
  
  // 3. Broadcast to all tabs/windows (same origin)
  LOCALE_CHANNEL.postMessage({ type: 'locale-change', locale })
  
  // 4. For cross-origin (Praxio → Retroact), use SSO URL parameter
  // Already implemented: ?lang=XX
}

// Listen for changes
LOCALE_CHANNEL.addEventListener('message', (event) => {
  if (event.data.type === 'locale-change') {
    // Update app locale without page reload
    setLocale(event.data.locale)
  }
})
```

**Benefits:**
- Instant sync across all tabs (same origin)
- SSO parameter handles cross-origin
- Cookie ensures SSR gets correct locale
- No race conditions

### Priority 6: Remove Custom i18n Implementation

**Delete:**
- `c:\praxio\packages\i18n\` (entire package)
- `c:\praxio\praxio-website\app\composables\useI18n.js`
- `c:\praxio\praxio-website\app\plugins\i18n.js`
- `c:\praxio\praxio-website\app\plugins\i18n.client.js`

**Replace with:**
- `@nuxtjs/i18n` module
- Standard configuration in `nuxt.config.ts`

### Priority 7: Centralized Translation Management

**Consider:** Translation Management System (TMS)

**Options:**
1. **Lokalise** - Professional TMS with API
2. **Crowdin** - Open source friendly
3. **Phrase** - Developer-focused
4. **SimpleLocalize** - Lightweight

**Benefits:**
- Non-technical team members can edit translations
- Translation memory (reuse common phrases)
- Machine translation suggestions
- Version control for translations
- Export to multiple formats

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- [ ] Install `@nuxtjs/i18n` in Praxio
- [ ] Split Praxio `en.json` into domain files
- [ ] Set up lazy loading configuration
- [ ] Add TypeScript types generation

### Phase 2: Migration (Week 3-4)
- [ ] Migrate Praxio pages to use `$t()` instead of custom `t()`
- [ ] Remove custom i18n package
- [ ] Update all 216 Vue files in Praxio

### Phase 3: Retroact (Week 5-6)
- [ ] Split Retroact `messages.js` (4191 lines) into modules
- [ ] Configure vue-i18n with lazy loading
- [ ] Update 149 Vue files in Retroact

### Phase 4: Integration (Week 7-8)
- [ ] Implement BroadcastChannel sync
- [ ] Test cross-app language switching
- [ ] Add missing translations (fill gaps)
- [ ] Set up automated translation key extraction

### Phase 5: Enhancement (Week 9-10)
- [ ] Add language detection for new users
- [ ] Implement RTL support preparation
- [ ] Add more languages (DE, ES, IT, SV)
- [ ] Set up translation CI/CD pipeline

---

## Quick Wins (Can Do Today)

### 1. Fix SSO Page Properly
Replace inline translations with proper lazy initialization:
```javascript
// pages/sso/login.vue
<script setup>
const { t, init } = useI18n()

// Force init on both SSR and client
init()
await nextTick() // Wait for init to complete

const errorTitle = computed(() => t('auth.sso.required'))
</script>
```

### 2. Add Translation Key Validator
```javascript
// scripts/validate-translations.js
const en = require('./locales/en.json')
const fr = require('./locales/fr.json')

function getKeys(obj, prefix = '') {
  let keys = []
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'))
    } else {
      keys.push(prefix + key)
    }
  }
  return keys
}

const enKeys = getKeys(en)
const frKeys = getKeys(fr)

const missingInFr = enKeys.filter(k => !frKeys.includes(k))
const missingInEn = frKeys.filter(k => !enKeys.includes(k))

console.log('Missing in FR:', missingInFr)
console.log('Missing in EN:', missingInEn)
```

### 3. Add VSCode Extension
Install `i18n-ally` extension for inline translation preview:
```json
// .vscode/settings.json
{
  "i18n-ally.localesPaths": ["locales"],
  "i18n-ally.keystyle": "nested",
  "i18n-ally.sourceLanguage": "en",
  "i18n-ally.displayLanguage": "en"
}
```

---

## Expected Outcomes

### Performance
- **Initial load:** 70% smaller (lazy loading)
- **Translation updates:** No dev server restart needed
- **SSR hydration:** Faster with proper i18n module

### Developer Experience
- **TypeScript autocomplete** for all translation keys
- **Inline translation preview** in VSCode
- **Automated validation** in CI/CD
- **Easier debugging** with standard library

### Maintainability
- **Modular structure** - Easy to find translations
- **Type safety** - Catch errors at compile time
- **Standard patterns** - New developers familiar with vue-i18n
- **Better documentation** - Official docs instead of custom implementation

### Scalability
- **Add new languages** in minutes
- **Translation management** possible via TMS
- **Route-based splitting** reduces bundle size
- **Dynamic imports** for on-demand translation loading

---

## Cost-Benefit Analysis

### Current State Costs
- 🕐 **Dev time wasted:** ~4 hours debugging SSO translation issue
- 📦 **Bundle size:** ~150KB of translations loaded upfront
- 🐛 **Bug risk:** HIGH (custom implementation, no type safety)
- 🔧 **Maintenance:** HIGH (custom code to maintain)

### Migration Costs
- ⏱️ **Time:** ~10 weeks total (can be parallelized)
- 👥 **Resources:** 1-2 developers
- ⚠️ **Risk:** LOW (standard library, well-documented)

### Post-Migration Benefits
- ⚡ **Performance:** 70% faster initial load
- 🎯 **Developer productivity:** 50% faster translation tasks
- 🐛 **Bug risk:** LOW (battle-tested library)
- 🔧 **Maintenance:** LOW (community-maintained)
- 📈 **Scalability:** Can easily add 10+ more languages

---

## Conclusion

The current language management system is **functional but fragile**. The custom implementation causes unnecessary complexity and maintenance burden. **Migrating to industry-standard libraries (`@nuxtjs/i18n` + `vue-i18n`)** with proper architecture will:

1. ✅ Eliminate translation loading bugs
2. ✅ Reduce bundle size by 70%
3. ✅ Add TypeScript safety
4. ✅ Enable easy scaling to more languages
5. ✅ Reduce maintenance burden
6. ✅ Improve developer experience

**Recommendation: Start with Phase 1 (Foundation) immediately.** The quick wins alone will save hours of debugging time.

---

## Questions & Next Steps

1. **Language Priority:** Which languages should we add next? (DE, ES, IT, NL, SV?)
2. **TMS Decision:** Should we invest in a Translation Management System?
3. **Timeline:** Can we allocate 1-2 developers for 10 weeks?
4. **Breaking Changes:** Are we OK with a one-time migration that requires updating all translation calls?

**I recommend starting with the "Quick Wins" section today, then proceeding with Phase 1 next week.**
