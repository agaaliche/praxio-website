const fs = require('fs');
const path = require('path');

console.log('🔍 Validating translation files...\n');

// Function to get all keys from an object recursively
function getKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

// Load translation files
const localesDir = path.join(__dirname, '../i18n/locales');
const enPath = path.join(localesDir, 'en.json');
const frPath = path.join(localesDir, 'fr.json');

if (!fs.existsSync(enPath)) {
  console.error('❌ English translation file not found:', enPath);
  process.exit(1);
}

if (!fs.existsSync(frPath)) {
  console.error('❌ French translation file not found:', frPath);
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

console.log('✅ Loaded translation files\n');

// Get all keys
const enKeys = getKeys(en).sort();
const frKeys = getKeys(fr).sort();

console.log(`📊 English keys: ${enKeys.length}`);
console.log(`📊 French keys: ${frKeys.length}\n`);

// Find missing keys
const missingInFr = enKeys.filter(k => !frKeys.includes(k));
const missingInEn = frKeys.filter(k => !enKeys.includes(k));

// Find empty values
const emptyInEn = enKeys.filter(key => {
  const value = key.split('.').reduce((obj, k) => obj?.[k], en);
  return value === '' || value === null || value === undefined;
});

const emptyInFr = frKeys.filter(key => {
  const value = key.split('.').reduce((obj, k) => obj?.[k], fr);
  return value === '' || value === null || value === undefined;
});

// Report results
let hasErrors = false;

if (missingInFr.length > 0) {
  hasErrors = true;
  console.log('❌ Missing in French (' + missingInFr.length + ' keys):');
  missingInFr.forEach(key => console.log('   -', key));
  console.log('');
}

if (missingInEn.length > 0) {
  hasErrors = true;
  console.log('❌ Missing in English (' + missingInEn.length + ' keys):');
  missingInEn.forEach(key => console.log('   -', key));
  console.log('');
}

if (emptyInEn.length > 0) {
  hasErrors = true;
  console.log('⚠️  Empty values in English (' + emptyInEn.length + ' keys):');
  emptyInEn.forEach(key => console.log('   -', key));
  console.log('');
}

if (emptyInFr.length > 0) {
  hasErrors = true;
  console.log('⚠️  Empty values in French (' + emptyInFr.length + ' keys):');
  emptyInFr.forEach(key => console.log('   -', key));
  console.log('');
}

// Check for placeholder mismatches
const placeholderMismatches = [];
enKeys.forEach(key => {
  if (!frKeys.includes(key)) return;
  
  const enValue = key.split('.').reduce((obj, k) => obj?.[k], en);
  const frValue = key.split('.').reduce((obj, k) => obj?.[k], fr);
  
  if (typeof enValue !== 'string' || typeof frValue !== 'string') return;
  
  // Get unique placeholder names (not count)
  const enPlaceholders = [...new Set((enValue.match(/\{[^}]+\}/g) || []))].sort();
  const frPlaceholders = [...new Set((frValue.match(/\{[^}]+\}/g) || []))].sort();
  
  if (JSON.stringify(enPlaceholders) !== JSON.stringify(frPlaceholders)) {
    placeholderMismatches.push({
      key,
      en: enPlaceholders,
      fr: frPlaceholders
    });
  }
});

if (placeholderMismatches.length > 0) {
  hasErrors = true;
  console.log('⚠️  Placeholder mismatches (' + placeholderMismatches.length + ' keys):');
  placeholderMismatches.forEach(({ key, en, fr }) => {
    console.log(`   - ${key}`);
    console.log(`     EN: ${en.join(', ') || '(none)'}`);
    console.log(`     FR: ${fr.join(', ') || '(none)'}`);
  });
  console.log('');
}

// Summary
if (!hasErrors) {
  console.log('✅ All translations are valid!');
  console.log(`   ${enKeys.length} keys in both languages`);
  console.log('   All placeholders match');
  process.exit(0);
} else {
  console.log('❌ Translation validation failed');
  console.log('   Please fix the issues above before committing');
  process.exit(1);
}
