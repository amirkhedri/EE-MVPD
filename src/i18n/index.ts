import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import fa from './fa.json';

i18n
  .use(LanguageDetector) // Detects user language preference via localStorage/browser settings
  .use(initReactI18next)
  .init({
    resources: {
      en: en,
      fa: fa
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already protects from XSS
    }
  });

// Handle RTL/LTR document direction dynamically
i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = lng === 'fa' ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

// Set initial direction
document.documentElement.dir = i18n.language === 'fa' ? 'rtl' : 'ltr';
document.documentElement.lang = i18n.language;

export default i18n;