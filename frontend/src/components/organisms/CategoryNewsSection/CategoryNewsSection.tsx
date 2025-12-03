import React, { useState, useEffect } from 'react';
import { useContent } from '../../../hooks/useContent';
import type { Article } from '../../../services/api/articles';
import { getCategorySlug, decodeHtmlEntities } from '../../../utils/categorySlugMapping';
import { buildApiUrl } from '../../../config/api';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  isAd?: boolean; // Added for NewsItemComponent
  views?: number; // Added for view count
}

interface CategoryNewsSectionProps {
  category: string; // This will be category slug
  categoryDisplayName?: string; // Optional display name override
  newsItems?: NewsItem[];
  className?: string;
}

export const CategoryNewsSection: React.FC<CategoryNewsSectionProps> = ({
  category,
  categoryDisplayName,
  newsItems = [],
  className = ''
}) => {
  // Views count disabled by default
  const viewsCountEnabled = false;

  const [mataElangGalleries, setMataElangGalleries] = useState<any[]>([]);
  const [mataElangLoading, setMataElangLoading] = useState(false);
  const [mataElangError, setMataElangError] = useState<string | null>(null);

  // Fetch Mata Elang galleries if category is mata-elang
  useEffect(() => {
    if (category === 'mata-elang') {
      const fetchMataElang = async () => {
        setMataElangLoading(true);
        try {
          const response = await fetch(buildApiUrl('mata-elang?limit=6'));
          const result = await response.json();

          if (result.success) {
            setMataElangGalleries(result.data.galleries);
          } else {
            setMataElangError(result.message);
          }
        } catch (error) {
          console.error('Error fetching Mata Elang galleries:', error);
          setMataElangError('Failed to fetch galleries');
        } finally {
          setMataElangLoading(false);
        }
      };

      fetchMataElang();
    }
  }, [category]);

  // Fetch real data from API (skip if mata-elang) - reduced limit for faster load
  const { data: apiArticles, loading, error } = useContent({
    limit: 6,
    category: category === 'mata-elang' ? 'skip' : category,
    type: 'post'
  });

  // Convert API articles to NewsItem format
  const convertToNewsItem = (article: Article): NewsItem => {
    const timeAgo = new Date(article.date).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });

    return {
      id: article.id,
      title: article.title,
      source: article.author?.display_name || 'naramaknaNEWS',
      timeAgo,
      imageSrc: article.metadata?.thumbnail_url || article.metadata?._thumbnail_url || article.featured_media || article.image_url || article.thumbnail,
      href: `/artikel/${article.slug}`,
      views: article.view_count || 0,
      isAd: false
    };
  };

  // Convert Mata Elang gallery to NewsItem format
  const convertGalleryToNewsItem = (gallery: any): NewsItem => {
    const timeAgo = new Date(gallery.published_at).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });

    return {
      id: gallery.id.toString(),
      title: gallery.title,
      source: gallery.photographer || gallery.uploader_name || 'Mata Elang',
      timeAgo,
      imageSrc: gallery.cover_image,
      href: `/mata-elang/${gallery.slug}`,
      views: gallery.view_count || 0,
      isAd: false
    };
  };

  // Dummy data untuk fallback
  const defaultNewsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Berita Terkini dari Kategori ' + (categoryDisplayName || category),
      source: 'naramaknaNEWS',
      timeAgo: '2 jam'
    },
    {
      id: '2',
      title: 'Update Terbaru ' + (categoryDisplayName || category),
      source: 'naramaknaNEWS',
      timeAgo: '4 jam'
    },
    {
      id: '3',
      title: 'Perkembangan ' + (categoryDisplayName || category) + ' Terkini',
      source: 'naramaknaNEWS',
      timeAgo: '6 jam'
    },
    {
      id: '4',
      title: 'Berita Terbaru ' + (categoryDisplayName || category) + ' Hari Ini',
      source: 'naramaknaNEWS',
      timeAgo: '1 jam'
    },
    {
      id: '5',
      title: 'Update Terkini ' + (categoryDisplayName || category) + ' Terbaru',
      source: 'naramaknaNEWS',
      timeAgo: '3 jam'
    },
    {
      id: '6',
      title: 'Berita ' + (categoryDisplayName || category) + ' Terpopuler Minggu Ini',
      source: 'naramaknaNEWS',
      timeAgo: '5 jam'
    },
    {
      id: '7',
      title: 'Analisis Mendalam ' + (categoryDisplayName || category) + ' Terkini',
      source: 'naramaknaNEWS',
      timeAgo: '7 jam'
    },
    {
      id: '8',
      title: 'Fakta Menarik ' + (categoryDisplayName || category) + ' yang Perlu Diketahui',
      source: 'naramaknaNEWS',
      timeAgo: '9 jam'
    },
    {
      id: '9',
      title: 'Update Terbaru ' + (categoryDisplayName || category) + ' Hari Ini',
      source: 'naramaknaNEWS',
      timeAgo: '11 jam'
    },
    {
      id: '10',
      title: 'Berita ' + (categoryDisplayName || category) + ' yang Viral di Media Sosial',
      source: 'naramaknaNEWS',
      timeAgo: '13 jam'
    }
  ];

  // Prioritas: props newsItems > Mata Elang data > API data > fallback data
  let displayNewsItems: NewsItem[] = [];
  const isLoadingData = category === 'mata-elang' ? mataElangLoading : loading;
  const hasError = category === 'mata-elang' ? mataElangError : error;

  if (newsItems && newsItems.length > 0) {
    displayNewsItems = newsItems;
  } else if (category === 'mata-elang' && !mataElangLoading && !mataElangError && mataElangGalleries && mataElangGalleries.length > 0) {
    displayNewsItems = mataElangGalleries.map(convertGalleryToNewsItem);
  } else if (!loading && !error && apiArticles && apiArticles.length > 0) {
    displayNewsItems = apiArticles.map(convertToNewsItem);
  } else {
    // Always show fallback data when API data is empty or loading
    displayNewsItems = defaultNewsItems;
  }

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`CategoryNewsSection [${category}]:`, {
      loading: isLoadingData,
      error: hasError,
      mataElangGalleries: category === 'mata-elang' ? mataElangGalleries.length : 0,
      apiArticles: apiArticles.length,
      displayNewsItems: displayNewsItems.length,
      fallback: displayNewsItems === defaultNewsItems
    });
  }

  // Determine display name for category and decode HTML entities
  const rawDisplayName = categoryDisplayName ||
    (category === 'mata-elang' ? 'Mata Elang' : (apiArticles[0]?.categories?.[0]?.name)) ||
    category.charAt(0).toUpperCase() + category.slice(1);
  const displayCategoryName = decodeHtmlEntities(rawDisplayName);

  const NewsItemComponent = ({ item }: { item: NewsItem }) => {
    const handleClick = () => {
      if (item.href) {
        window.location.href = item.href;
      }
    };

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200" onClick={handleClick}>
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
        {item.imageSrc ? (
          <img 
            src={item.imageSrc} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-xs">Image</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 text-left">
          {item.title}
        </h3>
        <div className="flex items-center space-x-2 text-left">
          <span className="text-xs text-gray-600">{item.source}</span>
          {item.isAd && (
            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Ad</span>
          )}
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {viewsCountEnabled && (
            <>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="text-xs text-gray-500">{(item.views || 0).toLocaleString()}</span>
            </>
          )}
          <span className="text-xs text-gray-500">{item.timeAgo}</span>
        </div>
      </div>
    </div>
    );
  };

  const primarySlug = getCategorySlug(category, categoryDisplayName);

  return (
    <div className={`bg-gray-50 py-8 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">{displayCategoryName}</h2>
          </div>
          <a 
            href={`/kategori/${primarySlug}`} 
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors duration-200"
          >
            <span>Lihat lainnya</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main News Column (Left) - Single Large Article */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200" 
               onClick={() => {
                 if (displayNewsItems[0]?.href) {
                   window.location.href = displayNewsItems[0].href;
                 }
               }}>
            <div className="relative h-64 lg:h-full">
              {/* Full Image Background - Extends to bottom */}
              {displayNewsItems[0]?.imageSrc ? (
                <img 
                  src={displayNewsItems[0].imageSrc} 
                  alt={displayNewsItems[0].title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                          <div class="text-center">
                            <span class="text-white text-6xl font-bold">${displayCategoryName.charAt(0)}</span>
                            <div class="text-white text-sm mt-2">${displayCategoryName}</div>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-white text-6xl font-bold">{displayCategoryName.charAt(0)}</span>
                    <div className="text-white text-sm mt-2">{displayCategoryName}</div>
                  </div>
                </div>
              )}
              
              {/* Text Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-6">
                <h3 className="text-lg font-semibold text-white mb-3 leading-tight text-left">
                  {displayNewsItems[0]?.title || `Berita Terkini dari Kategori ${category}`}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-200">
                  <span>{displayNewsItems[0]?.source || 'naramaknaNEWS'}</span>
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {viewsCountEnabled && (
                    <>
                      <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{(displayNewsItems[0]?.views || 0).toLocaleString()}</span>
                    </>
                  )}
                  <span>{displayNewsItems[0]?.timeAgo || '2 jam'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column - Trending */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Populer di {displayCategoryName}</h2>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto scrollbar-hide">
              {displayNewsItems.length <= 3 
                ? displayNewsItems.map((item) => (
                    <NewsItemComponent key={`popular-${item.id}`} item={item} />
                  ))
                : displayNewsItems.slice(1, 4).map((item) => (
                    <NewsItemComponent key={item.id} item={item} />
                  ))
              }
              {displayNewsItems.length <= 3 && displayNewsItems.length > 0 && (
                <div className="text-sm text-gray-500 text-center py-2 italic">
                  Menampilkan semua artikel tersedia
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Latest */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Terbaru di {displayCategoryName}</h2>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto scrollbar-hide">
              {displayNewsItems.length <= 3 
                ? displayNewsItems.map((item) => (
                    <NewsItemComponent key={`latest-${item.id}`} item={item} />
                  ))
                : displayNewsItems.slice(4, 6).map((item) => (
                    <NewsItemComponent key={item.id} item={item} />
                  ))
              }
              {displayNewsItems.length <= 3 && displayNewsItems.length > 0 && (
                <div className="text-sm text-gray-500 text-center py-2 italic">
                  Menampilkan semua artikel tersedia
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};