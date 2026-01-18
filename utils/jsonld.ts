/**
 * JSON-LD 结构化数据
 * 帮助搜索引擎理解网站内容，提升SEO
 */

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "Pockimate",
  "url": "https://yourdomain.com",
  "description": "Exquisite Mini Electronics - Compact and Powerful Tech Life",
  "logo": "https://yourdomain.com/logo.png",
  "image": "https://yourdomain.com/og-image.jpg",
  "telephone": "+86-xxx-xxxx-xxxx",
  "email": "contact@pockimate.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CN",
    "addressLocality": "Beijing"
  },
  "sameAs": [
    "https://www.facebook.com/pockimate",
    "https://www.instagram.com/pockimate",
    "https://www.twitter.com/pockimate",
    "https://www.linkedin.com/company/pockimate"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+86-xxx-xxxx-xxxx",
    "contactType": "customer support"
  }
};

export const productSchema = (product: any) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.name,
  "description": product.description,
  "image": product.image,
  "brand": {
    "@type": "Brand",
    "name": "Pockimate"
  },
  "offers": {
    "@type": "Offer",
    "url": `https://yourdomain.com/#product/${product.id}`,
    "priceCurrency": "USD",
    "price": product.price?.toString(),
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const faqSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const blogPostSchema = (post: any) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.title,
  "description": post.excerpt,
  "image": post.image,
  "datePublished": post.date,
  "dateModified": post.date,
  "author": {
    "@type": "Organization",
    "name": "Pockimate"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Pockimate",
    "logo": {
      "@type": "ImageObject",
      "url": "https://yourdomain.com/logo.png"
    }
  }
});
