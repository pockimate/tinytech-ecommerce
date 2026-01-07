/**
 * 翻译服务 - 仅使用本地字典
 * 不依赖任何外部API，完全基于本地翻译字典
 * 
 * 注意：translateText 函数已简化，仅返回原文
 * 实际翻译逻辑在 TranslationContext 中处理
 */

// 目标语言类型
export type Language =
  | 'en' | 'es' | 'fr' | 'de' | 'pt' | 'it'
  | 'ja' | 'ko' | 'ru' | 'tr' | 'ar' | 'hi'
  | 'zh-CN' | 'zh-TW' | 'nl' | 'pl' | 'th';

// 语言名称映射
export const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ja: 'Japanese',
  ko: '한국어',
  ru: 'Русский',
  tr: 'Türkçe',
  ar: 'العربية',
  hi: 'हिन्दी',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  nl: 'Nederlands',
  pl: 'Polski',
  th: 'ไทย'
};

/**
 * 翻译文本 - 仅使用本地字典
 */
export async function translateText(
  text: string,
  targetLanguage: Language,
  sourceLanguage?: string
): Promise<string> {
  if (!text || !text.trim()) {
    return text;
  }
  
  // 如果目标语言是英语，直接返回原文
  if (targetLanguage === 'en') {
    return text;
  }

  console.log(`[Translate] Local dictionary lookup for "${text}" to ${targetLanguage}`);

  // 这里可以导入本地字典进行查找
  // 由于本地字典在TranslationContext中，这里直接返回原文
  // 实际翻译由TranslationContext处理
  return text;
}

/**
 * 检测文本语言 - 简单的语言检测
 */
export async function detectLanguage(text: string): Promise<string> {
  if (!text || text.trim().length < 2) {
    return 'en';
  }

  // 简单的语言检测逻辑
  const chineseRegex = /[\u4e00-\u9fff]/;
  const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
  const koreanRegex = /[\uac00-\ud7af]/;
  const arabicRegex = /[\u0600-\u06ff]/;
  const russianRegex = /[\u0400-\u04ff]/;

  if (chineseRegex.test(text)) return 'zh-CN';
  if (japaneseRegex.test(text)) return 'ja';
  if (koreanRegex.test(text)) return 'ko';
  if (arabicRegex.test(text)) return 'ar';
  if (russianRegex.test(text)) return 'ru';

  return 'en';
}

// 其他辅助函数保持不变
export async function translateObject<T extends Record<string, any>>(
  obj: T,
  targetLanguage: Language,
  fields: (keyof T)[]
): Promise<T> {
  if (targetLanguage === 'en') return obj;

  const translated = { ...obj } as T;
  
  for (const field of fields) {
    const value = obj[field];
    if (typeof value === 'string') {
      (translated as any)[field] = await translateText(value, targetLanguage);
    } else if (Array.isArray(value)) {
      (translated as any)[field] = await Promise.all(
        value.map(async (item) => {
          if (typeof item === 'string') {
            return translateText(item, targetLanguage);
          }
          return item;
        })
      );
    }
  }

  return translated;
}

export function getSupportedLanguages(): { code: Language; name: string }[] {
  return Object.entries(languageNames).map(([code, name]) => ({
    code: code as Language,
    name
  }));
}

// 翻译缓存
const translationCache: Record<string, Record<string, string>> = {};

export function getCachedTranslation(key: string, language: Language): string | null {
  if (!translationCache[key]) return null;
  return translationCache[key][language] || null;
}

export function cacheTranslation(key: string, language: Language, text: string): void {
  if (!translationCache[key]) {
    translationCache[key] = {};
  }
  translationCache[key][language] = text;
}

export async function translateWithCache(
  text: string,
  language: Language,
  cacheKey: string
): Promise<string> {
  const cached = getCachedTranslation(cacheKey, language);
  if (cached) return cached;

  if (language === 'en') {
    cacheTranslation(cacheKey, language, text);
    return text;
  }

  const translated = await translateText(text, language);
  cacheTranslation(cacheKey, language, translated);
  
  return translated;
}