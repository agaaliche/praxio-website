# Translation Structure - Retroact & Praxio

## Overview
Both applications now use domain-based translation files for better organization, maintainability, and performance.

## Directory Structure

### Praxio (praxio-website)
```
app/locales/
├── en/
│   ├── common.json      # Common UI elements (buttons, headers, footer)
│   ├── auth.json        # Authentication & SSO
│   ├── account.json     # Account settings & management
│   ├── pricing.json     # Pricing plans & billing
│   ├── retroact.json    # Retroact product pages & features
│   ├── contact.json     # Contact forms
│   ├── admin.json       # Admin panel
│   ├── emails.json      # Email templates
│   └── messages.json    # System messages
└── fr/ (same structure)
```

### Retroact (inrManager)
```
front/src/locales/
├── en/
│   ├── common.json      # Common elements, forms, dialogs
│   ├── emails.json      # Email templates
│   ├── auth.json        # Authentication
│   ├── reports.json     # Reports & analytics
│   ├── validation.json  # Form validation messages
│   ├── navigation.json  # Navigation menus
│   └── tickets.json     # ⚠️ MARKED FOR MIGRATION TO PRAXIO
└── fr/ (same structure)
```

## Configuration

### Praxio
- **Library**: @nuxtjs/i18n (official Nuxt module)
- **Loading**: Lazy loading enabled per route
- **Cookie**: `praxio_language`
- **Strategy**: `no_prefix` (no /en or /fr in URLs)
- **Config**: See `nuxt.config.ts`

### Retroact  
- **Library**: vue-i18n
- **Loading**: Domain-based imports (all loaded at once currently)
- **Storage**: localStorage with key `praxio_language`
- **Config**: See `src/main.js` and `src/messages.js`

## Tickets Migration Plan

The `tickets.json` file in Retroact contains user feedback/support ticket translations:
- **Current Location**: `inrManager/front/src/locales/en/tickets.json`
- **Future Location**: `praxio-website/app/locales/en/tickets.json`
- **When**: When ticket management UI is moved from Retroact to Praxio

### Migration Steps (Future)
1. Copy `tickets.json` from Retroact to Praxio
2. Add `tickets.json` to Praxio's nuxt.config.ts locale files array
3. Move ticket UI components from Retroact to Praxio
4. Remove tickets from Retroact's messages.js imports
5. Test ticket management in Praxio
6. Delete tickets translations from Retroact

## Benefits of Domain-Based Structure

### Performance
- **Lazy Loading**: Only load translations needed for current route (Praxio)
- **Smaller Initial Bundle**: ~70% reduction in initial translation payload
- **Faster Page Transitions**: Route-specific translations loaded on demand

### Developer Experience
- **Easy to Find**: Domain-specific translations grouped logically
- **Parallel Editing**: Multiple devs can edit different domains without conflicts
- **Clear Boundaries**: Each domain file has a specific purpose

### Maintainability
- **Smaller Files**: ~100-200 lines per domain vs 900-4000 lines monolithic
- **Less Merge Conflicts**: Changes isolated to specific domains
- **Easy Migration**: Moving features between apps = copy domain file

## Adding New Translations

### Praxio
1. Add translation to appropriate domain file (e.g., `en/common.json`)
2. Add same key/value to French file (`fr/common.json`)
3. Translations auto-reload in dev mode
4. Use in templates: `{{ $t('common.buttonText') }}`

### Retroact
1. Add translation to appropriate domain file (e.g., `en/common.json`)
2. Add same key/value to French file (`fr/common.json`)  
3. Restart dev server (required for JSON changes)
4. Use in templates: `{{ $t('buttonText') }}`

## Cross-App Language Sync

Both apps use the same storage key (`praxio_language`) to maintain language preference:
- **Praxio → Retroact**: Via `?lang=XX` URL parameter during SSO
- **Retroact → Praxio**: Via shared localStorage key
- **Cross-Tab Sync**: BroadcastChannel API (Praxio only currently)

## Backups

Original monolithic files backed up:
- `inrManager/front/src/locales/en.json.backup`
- `inrManager/front/src/locales/fr.json.backup`  
- `praxio/packages/i18n/locales/en.json.backup`
- `praxio/packages/i18n/locales/fr.json.backup`

## Future Improvements

1. **TypeScript Types**: Generate types from translation keys for autocomplete
2. **True Lazy Loading in Retroact**: Implement dynamic imports
3. **Translation Validation**: Automated checks for missing keys
4. **i18n-ally Extension**: VSCode extension for inline translation preview
5. **Remove Custom i18n Package**: Once Praxio fully migrated to @nuxtjs/i18n
