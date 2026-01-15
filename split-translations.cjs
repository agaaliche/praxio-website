const fs = require('fs');
const path = require('path');

// Read the monolithic translation files
const enPath = path.join(__dirname, '../packages/i18n/locales/en.json');
const frPath = path.join(__dirname, '../packages/i18n/locales/fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Define domain splits for Praxio
const praxioDomains = {
  common: ['common', 'header', 'footer', 'cookieConsent'],
  auth: ['auth', 'roles'],
  account: ['account'],
  pricing: ['pricing'],
  retroact: ['retroact', 'home'],
  contact: ['contact'],
  admin: ['admin'],
  emails: ['emails'],
  messages: ['messages']
};

// Split and save for each language
['en', 'fr'].forEach(lang => {
  const source = lang === 'en' ? en : fr;
  const targetDir = path.join(__dirname, 'app/locales', lang);

  Object.entries(praxioDomains).forEach(([domain, keys]) => {
    const domainData = {};
    keys.forEach(key => {
      if (source[key]) {
        domainData[key] = source[key];
      }
    });

    if (Object.keys(domainData).length > 0) {
      const filePath = path.join(targetDir, `${domain}.json`);
      fs.writeFileSync(filePath, JSON.stringify(domainData, null, 2), 'utf8');
      console.log(`Created ${lang}/${domain}.json`);
    }
  });
});

console.log('\n✅ Praxio translations split successfully!');
