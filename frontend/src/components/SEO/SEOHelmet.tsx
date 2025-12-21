import React from 'react';
import { Helmet } from 'react-helmet-async';

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

export const SEOHelmet: React.FC<{ data: SEOData }> = ({ data }) => {
  // Generate structured data
  const structuredData: StructuredData | null = data.type === 'article' && data.title ? {
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
        url: 'https://naramakna.id/LogoNaramakna.png'
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
  } : null;

  // Remove undefined properties
  if (structuredData) {
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key as keyof StructuredData] === undefined) {
        delete structuredData[key as keyof StructuredData];
      }
    });
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{data.title || 'Naramakna - Cerdas Memaknai'}</title>
      {data.description && <meta name="description" content={data.description} />}
      {data.keywords && data.keywords.length > 0 && (
        <meta name="keywords" content={data.keywords.join(', ')} />
      )}
      {data.author && <meta name="author" content={data.author} />}

      {/* Canonical URL */}
      {data.url && <link rel="canonical" href={data.url} />}

      {/* Open Graph Meta Tags */}
      {data.title && <meta property="og:title" content={data.title} />}
      {data.description && <meta property="og:description" content={data.description} />}
      {data.image && (
        <>
          <meta property="og:image" content={data.image} />
          <meta property="og:image:alt" content={data.title || 'Article image'} />
          <meta property="og:image:secure_url" content={data.image} />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </>
      )}
      {data.url && <meta property="og:url" content={data.url} />}
      <meta property="og:type" content={data.type || 'article'} />
      <meta property="og:site_name" content="Naramakna" />
      <meta property="og:locale" content={data.locale || 'id_ID'} />

      {/* Article-specific Open Graph tags */}
      {data.type === 'article' && (
        <>
          {data.author && <meta property="article:author" content={data.author} />}
          {data.publishedTime && <meta property="article:published_time" content={data.publishedTime} />}
          {data.modifiedTime && <meta property="article:modified_time" content={data.modifiedTime} />}
          {data.section && <meta property="article:section" content={data.section} />}
          {data.tags && data.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@naramakna" />
      {data.title && <meta name="twitter:title" content={data.title} />}
      {data.description && <meta name="twitter:description" content={data.description} />}
      {data.image && <meta name="twitter:image" content={data.image} />}

      {/* Additional SEO Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData, null, 2)}
        </script>
      )}
    </Helmet>
  );
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