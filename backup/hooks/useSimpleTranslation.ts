import { useState, useEffect } from 'react';
import { translateText, type Language } from '../services/translate';

// 简化版翻译Hook - 同步返回fallback，异步更新翻译
export function useSimpleTranslation(fallback: string, key: string) {
  const [translated, setTranslated] = useState(fallback);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const doTranslate = async () => {
      if (!mounted) return;
      setIsTranslating(true);
      try {
        const result = await translateText(fallback, 'en' as Language);
        if (mounted) {
          setTranslated(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        if (mounted) {
          setIsTranslating(false);
        }
      }
    };

    // 延迟翻译，避免阻塞初始渲染
    const timer = setTimeout(doTranslate, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [fallback]);

  return { translated, isTranslating };
}

// 批量翻译Hook
export function useTranslations(keys: string[], fallbacks: string[]) {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let mounted = true;

    const translateAll = async () => {
      setIsTranslating(true);
      const results: Record<string, string> = {};
      
      for (let i = 0; i < keys.length; i++) {
        if (!mounted) return;
        try {
          const result = await translateText(fallbacks[i], 'en' as Language);
          results[keys[i]] = result;
        } catch (error) {
          results[keys[i]] = fallbacks[i];
        }
      }
      
      if (mounted) {
        setTranslations(results);
        setIsTranslating(false);
      }
    };

    translateAll();
  }, [keys.join(','), fallbacks.join(',')]);

  return { translations, isTranslating };
}