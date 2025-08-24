/**
 * Category Slug Mapping Utility
 * Maps category slugs to their primary slug (with highest post count)
 * Based on database analysis to ensure "Lihat lainnya" links work correctly
 */

export const getCategorySlug = (category: string, categoryDisplayName?: string): string => {
  const categorySlugMap: { [key: string]: string } = {
    // Use intuitive slugs that match category names
    'lifestyle': 'laga-gaya',          // Laga & Gaya - use intuitive slug
    'laga-gaya': 'laga-gaya',          // Keep as main slug
    'opini': 'horison',                // Horison - use intuitive slug
    'horison': 'horison',              // Keep as main slug
    'kuliner': 'cerita-rasa',          // Cerita Rasa - use intuitive slug
    'cerita-rasa': 'cerita-rasa',      // Keep as main slug
    'reputasi-dan-komunikasi': 'narapandang', // Narapandang - use intuitive slug
    'narapandang': 'narapandang',      // Keep as main slug
    'dari-indonesia-ke-dunia': 'jagat-kita',  // Jagat Kita - use intuitive slug
    'jagat-kita': 'jagat-kita',        // Keep as main slug
    'otomotif': 'wahana',              // Wahana - use intuitive slug (not otomotif)
    'wahana': 'wahana',                // Keep as main slug
    'sport': 'olah-bola',              // Olah Bola - use intuitive slug
    'olah-bola': 'olah-bola',          // Keep as main slug
    'pendidikan-budaya-iptek': 'akal-budi', // Akal Budi - use intuitive slug
    'akal-budi': 'akal-budi',          // Keep as main slug
    // Categories with consistent slugs
    'budaya': 'budaya',
    'pendidikan': 'pendidikan',
    'teknologi': 'teknologi',
    'news': 'news'
  };

  // First try exact slug match
  if (categorySlugMap[category]) {
    return categorySlugMap[category];
  }

  // Then try category name to slug mapping
  if (categoryDisplayName) {
    const nameToSlugMap: { [key: string]: string } = {
      'Laga & Gaya': 'laga-gaya',
      'Laga &amp; Gaya': 'laga-gaya',
      'Horison': 'horison',
      'Cerita Rasa': 'cerita-rasa',
      'Narapandang': 'narapandang',
      'Jagat Kita': 'jagat-kita',
      'Wahana': 'wahana',
      'Olah Bola': 'olah-bola',
      'Akal Budi': 'akal-budi',
      'Budaya': 'budaya',
      'Pendidikan': 'pendidikan',
      'Teknologi': 'teknologi'
    };
    
    if (nameToSlugMap[categoryDisplayName]) {
      return nameToSlugMap[categoryDisplayName];
    }
  }

  // Fallback to original category
  return category;
};

/**
 * Get category display name from slug
 */
export const getCategoryDisplayName = (slug: string): string => {
  const slugToNameMap: { [key: string]: string } = {
    'laga-gaya': 'Laga & Gaya',
    'horison': 'Horison',
    'cerita-rasa': 'Cerita Rasa',
    'narapandang': 'Narapandang',
    'jagat-kita': 'Jagat Kita',
    'wahana': 'Wahana',
    'olah-bola': 'Olah Bola',
    'akal-budi': 'Akal Budi',
    'budaya': 'Budaya',
    'pendidikan': 'Pendidikan',
    'teknologi': 'Teknologi',
    'news': 'News'
  };

  return slugToNameMap[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
};

/**
 * Helper function to decode HTML entities in category names
 */
export const decodeHtmlEntities = (str: string): string => {
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' '
  };
  
  return str.replace(/&[#\w]+;/g, (entity) => htmlEntities[entity] || entity);
};