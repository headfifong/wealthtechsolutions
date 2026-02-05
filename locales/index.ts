// Locales Index - Central export for all translations
// Each language is in its own file for easier maintenance

import zhHK from './zh-HK';
import zhCN from './zh-CN';
import enUS from './en-US';
import jaJP from './ja-JP';
import koKR from './ko-KR';
import esES from './es-ES';
import frFR from './fr-FR';
import deDE from './de-DE';

// Language type definition
export type Language = 'zh-HK' | 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'es-ES' | 'fr-FR' | 'de-DE';

// Translation dictionary type (based on zh-HK as the primary/complete language)
export type TranslationDictionary = typeof zhHK;
export type TranslationKey = keyof TranslationDictionary;

// All translations combined
export const translations: Record<Language, TranslationDictionary> = {
  'zh-HK': zhHK,
  'zh-CN': zhCN as TranslationDictionary,
  'en-US': enUS as TranslationDictionary,
  'ja-JP': jaJP as TranslationDictionary,
  'ko-KR': koKR as TranslationDictionary,
  'es-ES': esES as TranslationDictionary,
  'fr-FR': frFR as TranslationDictionary,
  'de-DE': deDE as TranslationDictionary,
};

// Default/fallback language
export const defaultLanguage: Language = 'zh-HK';

// Available languages for UI display
export const availableLanguages: { code: Language; name: string }[] = [
  { code: 'zh-HK', name: '繁體中文' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'en-US', name: 'English' },
  { code: 'ja-JP', name: '日本語' },
  { code: 'ko-KR', name: '한국어' },
  { code: 'es-ES', name: 'Español' },
  { code: 'fr-FR', name: 'Français' },
  { code: 'de-DE', name: 'Deutsch' },
];
