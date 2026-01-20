# i18n Workflow Guide

## Quick Reference

### NPM Scripts (Recommended)

```bash
# Merge translations and generate types (all-in-one)
npm run i18n:merge

# Validate translations only
npm run i18n:validate

# Generate TypeScript types only
npm run i18n:types
```

### Manual Commands

### Making Translation Changes

1. **Edit source files** in `app/locales/[lang]/[domain].json`
   - `app/locales/en/common.json` - Common UI elements
   - `app/locales/en/auth.json` - Authentication
   - `app/locales/en/account.json` - Account settings
   - `app/locales/fr/...` - French equivalents

2. **Run merge script** to combine domains:
   ```bash
   cd praxio-website
   node merge-locales.cjs
   ```
   This automatically:
   - Merges all domain files into single `locales/en.json` and `locales/fr.json`
   - Escapes `@` symbols as `{'@'}` for vue-i18n
   - Converts `{{placeholder}}` to `{placeholder}`

3. **Copy merged files** to production location:
   ```bash
   Copy-Item locales\*.json i18n\locales\ -Force
   ```

4. **Validate translations** before committing:
   ```bash
   node scripts/validate-translations.cjs
   ```

5. **Generate TypeScript types** for autocomplete:
   ```bash
   node scripts/generate-i18n-types.cjs
   ```

6. **Restart dev server** to see changes

## Important Rules

### @ Symbol in Translations
❌ **Wrong:** `email@example.com`  
✅ **Correct:** `email{'@'}example.com`

The merge script handles this automatically.

### Placeholders
❌ **Wrong:** `Hello {{name}}`  
✅ **Correct:** `Hello {name}`

The merge script converts these automatically.

### HTML in Translations
✅ **Allowed:** `<strong>text</strong>`, `<em>text</em>`, etc.

Configured with `escapeHtml: false` in nuxt.config.ts.

## File Structure

```
praxio-website/
├── app/locales/          # ✏️ EDIT THESE (source files)
│   ├── en/
│   │   ├── common.json
│   │   ├── auth.json
│   │   ├── account.json
│   │   ├── pricing.json
│   │   └── ...
│   └── fr/
│       └── ... (same structure)
│
├── i18n/locales/         # 🚀 PRODUCTION (auto-generated)
│   ├── en.json           # Don't edit directly!
│   └── fr.json           # Don't edit directly!
│
├── locales/              # 📦 INTERMEDIATE (auto-generated)
│   ├── en.json
│   └── fr.json
│
├── merge-locales.cjs     # 🔧 Merge script
└── scripts/
    └── validate-translations.cjs  # ✅ Validation
```

## Common Workflows

### Adding a New Translation Key

1. Add to appropriate domain file:
   ```json
   // app/locales/en/common.json
   {
     "common": {
       "myNewKey": "My New Text"
     }
   }
   ```

2. Add French equivalent:
   ```json
   // app/locales/fr/common.json
   {
     "common": {
       "myNewKey": "Mon Nouveau Texte"
     }
   }
   ```

3. Run merge and copy:
   ```bash
   node merge-locales.cjs
   Copy-Item locales\*.json i18n\locales\ -Force
   ```

4. Use in component:
   ```vue
   <template>
     {{ $t('common.myNewKey') }}
   </template>
   ```

### Using Placeholders

In translation file:
```json
{
  "welcome": "Welcome {name}!"
}
```

In component:
```vue
{{ $t('welcome', { name: userName }) }}
```

### Using HTML

In translation file:
```json
{
  "message": "Your <strong>annual plan</strong> starts on <strong>{date}</strong>"
}
```

Component will render HTML automatically (escapeHtml is disabled).

## Validation

The validation script checks for:
- ✅ Missing keys (keys in EN but not FR, or vice versa)
- ✅ Empty values
- ✅ Placeholder mismatches (e.g., `{name}` in EN but `{nom}` in FR)

Run before every commit:
```bash
node scripts/validate-translations.cjs
```

### Pre-commit Hook (Optional)

Add to `.git/hooks/pre-commit`:
```bash
#!/bin/sh
node scripts/validate-translations.cjs
if [ $? -ne 0 ]; then
  echo "Translation validation failed. Please fix before committing."
  exit 1
fi
```

## Troubleshooting

### "Invalid linked format" error with @ symbol
**Problem:** Email addresses breaking vue-i18n parser  
**Solution:** Run `node merge-locales.cjs` - it auto-escapes @ symbols

### "Not allowed nest placeholder" error
**Problem:** Using `{{placeholder}}` instead of `{placeholder}`  
**Solution:** Run `node merge-locales.cjs` - it auto-converts

### Dev server not showing updated translations
**Problem:** Old files in `i18n/locales/`  
**Solution:** 
```bash
node merge-locales.cjs
Copy-Item locales\*.json i18n\locales\ -Force
# Restart dev server
```

### Missing translation keys
**Problem:** Key exists in one language but not the other  
**Solution:** Run `node scripts/validate-translations.cjs` to find missing keys

## Advanced: Adding a New Language

1. Create domain files:
   ```bash
   mkdir app/locales/es
   cp app/locales/en/*.json app/locales/es/
   ```

2. Translate all files in `app/locales/es/`

3. Update `merge-locales.cjs`:
   ```javascript
   ['en', 'fr', 'es'].forEach(lang => {
   ```

4. Update `nuxt.config.ts`:
   ```typescript
   locales: [
     { code: 'en', name: 'English', file: 'en.json' },
     { code: 'fr', name: 'Français', file: 'fr.json' },
     { code: 'es', name: 'Español', file: 'es.json' }
   ]
   ```

5. Run merge and copy:
   ```bash
   node merge-locales.cjs
   Copy-Item locales\*.json i18n\locales\ -Force
   ```

## CI/CD Integration

Add to your deployment pipeline:

```yaml
# .github/workflows/deploy.yml
- name: Validate translations
  run: |
    cd praxio-website
    node scripts/validate-translations.cjs
    
- name: Generate TypeScript types
  run: |
    cd praxio-website
    node scripts/generate-i18n-types.cjs
    
- name: Build translations
  run: |
    cd praxio-website
    node merge-locales.cjs
    Copy-Item locales\*.json i18n\locales\ -Force
```

## TypeScript Autocomplete

### Setup

The project includes automatic TypeScript type generation for all translation keys:

```bash
# Generate types from translations
node scripts/generate-i18n-types.cjs
```

This creates `types/i18n.d.ts` with:
- Full interface of all translation keys
- Literal union type for autocomplete
- Type-safe `$t()` function

### Usage

```typescript
// In any component or composable
const { $t } = useNuxtApp()

// ✅ Autocomplete works!
$t('common.header.products')
$t('auth.signIn.title')
$t('pricing.freeTrial.daysLeft', { days: 14 })

// ❌ TypeScript error for invalid keys
$t('invalid.key.path')
```

### VSCode Extension

Install **i18n Ally** extension for inline translation preview:

1. Open Extensions (Ctrl+Shift+X)
2. Search for "i18n Ally"
3. Install (already configured in `.vscode/settings.json`)

Benefits:
- Inline translation preview in code
- Quick navigation to translation files
- Missing translation detection
- Translation editing from code

## Reference

- **@nuxtjs/i18n docs:** https://i18n.nuxtjs.org/
- **vue-i18n syntax:** https://vue-i18n.intlify.dev/
- **Translation structure:** See `TRANSLATIONS_STRUCTURE.md`
- **Original audit:** See `I18N_AUDIT_AND_RECOMMENDATIONS.md`
