/**
 * SEO优化组件
 * 动态设置meta标签、JSON-LD等
 */

import { useEffect } from 'react';
import { organizationSchema } from '../utils/jsonld';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: Record<string, any>;
}

export default function SEO({
  title = 'TinyTech | 精致迷你电子产品 - 小巧强大的科技生活',
  description = 'TinyTech专注于打造精致、实用、时尚的迷你电子产品。包括超小手机、智能手表、迷你平板等，为追求品质生活的你提供完美的数字伴侣。',
  image = 'https://yourdomain.com/og-image.jpg',
  url = 'https://yourdomain.com/',
  type = 'website',
  jsonLd
}: SEOProps) {
  useEffect(() => {
    // 设置页面标题
    document.title = title;

    // 更新或创建meta标签
    const updateMeta = (name: string, content: string, property?: boolean) => {
      let meta = document.querySelector(`meta[${property ? 'property' : 'name'}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(property ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // 基础meta
    updateMeta('description', description);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:image', image, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', type, true);
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    updateMeta('twitter:card', 'summary_large_image');

    // 设置JSON-LD
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"][data-seo="true"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute('data-seo', 'true');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }

    // 添加组织schema（总是显示）
    let orgScript = document.querySelector('script[type="application/ld+json"][data-org="true"]') as HTMLScriptElement;
    if (!orgScript) {
      orgScript = document.createElement('script');
      orgScript.type = 'application/ld+json';
      orgScript.setAttribute('data-org', 'true');
      orgScript.textContent = JSON.stringify(organizationSchema);
      document.head.appendChild(orgScript);
    }

  }, [title, description, image, url, type, jsonLd]);

  return null; // 这是一个无UI的组件
}
