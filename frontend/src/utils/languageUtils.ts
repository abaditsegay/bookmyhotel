/**
 * Language persistence utilities
 * Ensures language selection survives page refreshes
 */

const LANGUAGE_STORAGE_KEY = 'i18nextLng';

/**
 * Get saved language from localStorage
 */
export const getSavedLanguage = (): string | null => {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    // console.warn('Failed to read language from localStorage:', error);
    return null;
  }
};

/**
 * Save language to localStorage
 */
export const saveLanguage = (languageCode: string): void => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, languageCode);
  } catch (error) {
    // console.warn('Failed to save language to localStorage:', error);
  }
};

/**
 * Get default language (fallback)
 */
export const getDefaultLanguage = (): string => {
  return 'en';
};

/**
 * Get current language with fallback
 */
export const getCurrentLanguage = (): string => {
  return getSavedLanguage() || getDefaultLanguage();
};

/**
 * Check if language is supported
 */
export const isSupportedLanguage = (languageCode: string): boolean => {
  const supportedLanguages = ['en', 'am', 'om'];
  return supportedLanguages.includes(languageCode);
};