import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import es from './locales/es.json';

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Store detected language
      lookupLocalStorage: 'preferredLanguage',
      checkWhitelist: true,
      cleanCode: true, // Normalize lang codes (e.g., 'es-ES' -> 'es')
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
