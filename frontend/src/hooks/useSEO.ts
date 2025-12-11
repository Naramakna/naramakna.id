import { useEffect } from 'react';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'article' | 'website';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description?: string;
  image?: string[];
  author?: {
    '@type': string;
    name: string;
  };
  publisher?: {
    '@type': string;
    name: string;
    logo?: {
      '@type': string;
      url: string;
    };
  };
  datePublished?: string;
  dateModified?: string;
  mainEntityOfPage?: {
    '@type': string;
    '@id': string;
  };
  articleSection?: string;
  keywords?: string;
}

export const useSEO = (data: SEOData) => {
  useEffect(() => {
    // Clean up previous meta tags
    const existingMetas = document.querySelectorAll('meta[data-seo="true"]');
    existingMetas.forEach(meta => meta.remove());

    const existingStructuredData = document.querySelector('script[type="application/ld+json"][data-seo="true"]');
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    // Set page title
    if (data.title) {
      document.title = data.title;
    }

    // Create meta tags
    const metaTags: Array<{ name?: string; property?: string; content: string }> = [];

    // Basic meta tags
    if (data.description) {
      metaTags.push({ name: 'description', content: data.description });
    }

    if (data.keywords && data.keywords.length > 0) {
      metaTags.push({ name: 'keywords', content: data.keywords.join(', ') });
    }

    // Open Graph tags
    if (data.title) {
      metaTags.push({ property: 'og:title', content: data.title });
    }

    if (data.description) {
      metaTags.push({ property: 'og:description', content: data.description });
    }

    if (data.image) {
      metaTags.push({ property: 'og:image', content: data.image });
      metaTags.push({ property: 'og:image:alt', content: data.title || 'Article image' });
      metaTags.push({ property: 'og:image:secure_url', content: data.image });
      metaTags.push({ property: 'og:image:type', content: 'image/jpeg' });
      metaTags.push({ property: 'og:image:width', content: '1200' });
      metaTags.push({ property: 'og:image:height', content: '630' });
    }

    if (data.url) {
      metaTags.push({ property: 'og:url', content: data.url });
    }

    metaTags.push({ property: 'og:type', content: data.type || 'article' });
    metaTags.push({ property: 'og:site_name', content: 'Naramakna' });
    metaTags.push({ property: 'og:locale', content: data.locale || 'id_ID' });

    // Article-specific Open Graph tags
    if (data.type === 'article') {
      if (data.author) {
        metaTags.push({ property: 'article:author', content: data.author });
      }

      if (data.publishedTime) {
        metaTags.push({ property: 'article:published_time', content: data.publishedTime });
      }

      if (data.modifiedTime) {
        metaTags.push({ property: 'article:modified_time', content: data.modifiedTime });
      }

      if (data.section) {
        metaTags.push({ property: 'article:section', content: data.section });
      }

      if (data.tags && data.tags.length > 0) {
        data.tags.forEach(tag => {
          metaTags.push({ property: 'article:tag', content: tag });
        });
      }
    }

    // Twitter Card tags
    metaTags.push({ name: 'twitter:card', content: 'summary_large_image' });
    metaTags.push({ name: 'twitter:site', content: '@naramakna' });

    if (data.title) {
      metaTags.push({ name: 'twitter:title', content: data.title });
    }

    if (data.description) {
      metaTags.push({ name: 'twitter:description', content: data.description });
    }

    if (data.image) {
      metaTags.push({ name: 'twitter:image', content: data.image });
    }

    // Additional SEO meta tags
    metaTags.push({ name: 'robots', content: 'index, follow' });
    metaTags.push({ name: 'googlebot', content: 'index, follow' });
    metaTags.push({ name: 'viewport', content: 'width=device-width, initial-scale=1' });

    // Add canonical URL
    if (data.url) {
      const existingCanonical = document.querySelector('link[rel="canonical"]');
      if (existingCanonical) {
        existingCanonical.remove();
      }
      
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = data.url;
      canonical.setAttribute('data-seo', 'true');
      document.head.appendChild(canonical);
    }

    // Create and append meta tags
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      if (tag.name) meta.name = tag.name;
      if (tag.property) meta.setAttribute('property', tag.property);
      meta.content = tag.content;
      meta.setAttribute('data-seo', 'true');
      document.head.appendChild(meta);
    });

    // Create structured data (JSON-LD)
    if (data.type === 'article' && data.title) {
      const structuredData: StructuredData = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: data.title,
        description: data.description,
        image: data.image ? [data.image] : undefined,
        author: data.author ? {
          '@type': 'Person',
          name: data.author
        } : undefined,
        publisher: {
          '@type': 'Organization',
          name: 'Naramakna',
          logo: {
            '@type': 'ImageObject',
            url: `${window.location.origin}/LogoNaramakna.png`
          }
        },
        datePublished: data.publishedTime,
        dateModified: data.modifiedTime || data.publishedTime,
        mainEntityOfPage: data.url ? {
          '@type': 'WebPage',
          '@id': data.url
        } : undefined,
        articleSection: data.section,
        keywords: data.keywords?.join(', ')
      };

      // Remove undefined properties
      Object.keys(structuredData).forEach(key => {
        if (structuredData[key as keyof StructuredData] === undefined) {
          delete structuredData[key as keyof StructuredData];
        }
      });

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo', 'true');
      script.textContent = JSON.stringify(structuredData, null, 2);
      document.head.appendChild(script);
    }

    // Cleanup function
    return () => {
      const seoElements = document.querySelectorAll('[data-seo="true"]');
      seoElements.forEach(element => element.remove());
    };
  }, [data]);
};

// Helper function to generate SEO-friendly description from content
export const generateDescription = (content: string, maxLength: number = 160): string => {
  // Strip HTML tags
  const textContent = content.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const cleanText = textContent.replace(/\s+/g, ' ').trim();
  
  // Truncate to maxLength
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Find the last complete sentence within the limit
  const truncated = cleanText.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.5) {
    return cleanText.substring(0, lastSentence + 1);
  }
  
  // If no good sentence break, truncate at word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 
    ? cleanText.substring(0, lastSpace) + '...'
    : truncated + '...';
};

// Helper function to extract keywords from content
export const extractKeywords = (title: string, content: string, tags: string[] = []): string[] => {
  const text = `${title} ${content}`.toLowerCase();
  
  // Common Indonesian stop words
  const stopWords = new Set([
    'yang', 'dan', 'di', 'dari', 'untuk', 'dengan', 'pada', 'dalam', 'ke', 'oleh',
    'adalah', 'akan', 'atau', 'ini', 'itu', 'juga', 'tidak', 'telah', 'dapat', 'ada',
    'saya', 'kita', 'mereka', 'kami', 'anda', 'dia', 'ia', 'nya', 'mu', 'ku',
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
  ]);
  
  // Extract words (3+ characters, alphanumeric)
  const words = text.match(/\b[a-z0-9]{3,}\b/g) || [];
  
  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach(word => {
    if (!stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });
  
  // Get top keywords by frequency
  const topKeywords = Array.from(wordCount.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([word]) => word);
  
  // Combine with tags
  const allKeywords = [...new Set([...tags.map(tag => tag.toLowerCase()), ...topKeywords])];
  
  return allKeywords.slice(0, 10);
};

// Helper function to format date for structured data
export const formatStructuredDataDate = (dateString: string): string => {
  if (!dateString) return new Date().toISOString();
  
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date provided: ${dateString}, using current date`);
    return new Date().toISOString();
  }
  
  return date.toISOString();
};
