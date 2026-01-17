const fs = require('fs');
const path = require('path');

// Function to escape @ symbols and fix placeholders for vue-i18n
function fixForVueI18n(obj) {
    if (typeof obj === 'string') {
        // Escape @ symbols
        let fixed = obj.replace(/@/g, "{'@'}");
        // Convert {{placeholder}} to {placeholder}
        fixed = fixed.replace(/\{\{([^}]+)\}\}/g, '{$1}');
        return fixed;
    }
    if (Array.isArray(obj)) {
        return obj.map(fixForVueI18n);
    }
    if (obj && typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            result[key] = fixForVueI18n(obj[key]);
        }
        return result;
    }
    return obj;
}

// Merge all domain files into single language files for @nuxtjs/i18n
['en', 'fr'].forEach(lang => {
    const sourceDir = path.join(__dirname, 'app/locales', lang);
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'));

    const merged = {};
    files.forEach(file => {
        const content = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
        Object.assign(merged, content);
    });

    // Fix for vue-i18n compatibility (escape @ and convert {{ to {)
    const fixed = fixForVueI18n(merged);

    // Write to i18n/locales (production) - what Nuxt uses
    const targetPath = path.join(__dirname, 'i18n/locales', `${lang}.json`);
    fs.writeFileSync(targetPath, JSON.stringify(fixed, null, 2), 'utf8');
    console.log(`Created i18n/locales/${lang}.json (${Object.keys(merged).length} top-level keys)`);
});

console.log('\n✅ Merged translation files for @nuxtjs/i18n');
