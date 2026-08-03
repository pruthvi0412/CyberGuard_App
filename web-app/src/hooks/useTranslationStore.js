import { create } from 'zustand';
import { translations, SUPPORTED_LANGUAGES } from '../locales/translations';

const STORAGE_KEY = 'cyberguard_lang';

const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) {
      return saved;
    }
  } catch (e) {
    console.error('Error reading language from localStorage:', e);
  }
  return 'en';
};

const resolveNestedKey = (obj, path) => {
  if (!obj || !path) return null;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return null;
    }
  }
  return current;
};

export const useTranslationStore = create((set, get) => ({
  currentLanguage: getSavedLanguage(),
  languages: SUPPORTED_LANGUAGES,

  setLanguage: (langCode) => {
    if (translations[langCode]) {
      try {
        localStorage.setItem(STORAGE_KEY, langCode);
      } catch (e) {
        console.error('Error saving language to localStorage:', e);
      }
      set({ currentLanguage: langCode });
    }
  },

  t: (key, fallback = '') => {
    const { currentLanguage } = get();
    const currentDict = translations[currentLanguage] || translations.en;
    
    let value = resolveNestedKey(currentDict, key);
    if (value !== null && value !== undefined) {
      return value;
    }

    // Fallback to English
    const enValue = resolveNestedKey(translations.en, key);
    if (enValue !== null && enValue !== undefined) {
      return enValue;
    }

    return fallback || key;
  }
}));

export default useTranslationStore;
