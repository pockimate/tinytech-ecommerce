import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';

interface TranslatedTextProps {
  fallback: string;
  className?: string;
  style?: React.CSSProperties;
  as?: string;
}

/**
 * 翻译文本组件 - 用于静态文本的翻译
 * 使用方法: <TranslatedText fallback="Hello World" />
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  fallback, 
  className, 
  style,
  as: Component = 'span'
}) => {
  const { language, translate } = useTranslation();
  const [translated, setTranslated] = useState(fallback);

  useEffect(() => {
    let mounted = true;
    
    const doTranslate = async () => {
      if (language === 'en') {
        setTranslated(fallback);
        return;
      }
      
      try {
        const result = await translate(fallback);
        if (mounted) {
          setTranslated(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (mounted) {
          setTranslated(fallback);
        }
      }
    };
    
    // 延迟翻译以避免阻塞初始渲染
    const timer = setTimeout(doTranslate, 50);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [fallback, language, translate]);

  return (
    <Component className={className} style={style}>
      {translated}
    </Component>
  );
};

/**
 * 批量翻译组件 - 用于翻译一组文本
 */
interface TranslatedListProps {
  items: string[];
  renderItem: (translated: string, index: number) => React.ReactNode;
}

export const TranslatedList: React.FC<TranslatedListProps> = ({ items, renderItem }) => {
  const { language, translate } = useTranslation();
  const [translatedItems, setTranslatedItems] = useState<string[]>(items);

  useEffect(() => {
    let mounted = true;
    
    const doTranslate = async () => {
      if (language === 'en') {
        setTranslatedItems(items);
        return;
      }
      
      const results = [...items];
      for (let i = 0; i < items.length; i++) {
        if (!mounted) return;
        try {
          const result = await translate(items[i]);
          results[i] = result;
        } catch (error) {
          results[i] = items[i];
        }
      }
      
      if (mounted) {
        setTranslatedItems(results);
      }
    };
    
    const timer = setTimeout(doTranslate, 50);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [items, language, translate]);

  return (
    <>
      {translatedItems.map((item, index) => renderItem(item, index))}
    </>
  );
};

export default TranslatedText;