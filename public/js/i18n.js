let translations = {};
let currentLang = ''; // Start with empty

const LANG_KEY = 'jiyibi_lang';

async function loadTranslations(lang) {
    console.log(`i18n: Loading translations for [${lang}]...`);
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load ${lang}.json`);
        }
        translations = await response.json();
        console.log(`i18n: Translations for [${lang}] loaded successfully.`);
    } catch (error) {
        console.error('i18n: Translation loading error:', error);
        if (lang !== 'zh') {
            await loadTranslations('zh'); // Fallback to Chinese
        }
    }
}

export function t(key, replacements = {}) {
    let translation = translations[key] || key;
    for (const placeholder in replacements) {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return translation;
}

export function getCurrentLang() {
    return currentLang;
}

export async function setLang(lang) {
    console.log(`i18n: Attempting to set language to [${lang}]. Current is [${currentLang}]`);
    if (lang === currentLang && Object.keys(translations).length > 0) {
        console.log('i18n: Language already set and loaded. Skipping.');
        return;
    }
    await loadTranslations(lang);
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    console.log(`i18n: Language set to [${currentLang}]. Saved to localStorage.`);
}

export async function init() {
    const savedLang = localStorage.getItem(LANG_KEY);
    console.log(`i18n: Found saved language in localStorage: [${savedLang}]`);
    const lang = savedLang || 'zh'; // Default to Chinese
    await setLang(lang);
    return lang;
}