  import React from 'react';
import { Carousel } from '../../molecules/Carousel';
import { TrendingSection } from '../TrendingSection';
import { useContent } from '../../../hooks/useContent';
import type { Article } from '../../../services/api/articles';

interface CarouselArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  isFeatured?: boolean;
  views?: number;
}

interface MainContentSectionProps {
  articles?: CarouselArticle[];
  className?: string;
}

export const MainContentSection: React.FC<MainContentSectionProps> = ({
  articles = [],
  className = ''
}) => {
  // Fetch data dari API
  const { data: apiArticles, loading, error } = useContent({
    limit: 6,
    type: 'post', // Hanya ambil artikel, bukan video
    mainCategoriesOnly: true // Filter untuk main categories
  });

  // Helper function untuk convert API data ke format CarouselArticle
  const convertToCarouselArticle = (article: Article, index: number): CarouselArticle => {
    const timeAgo = new Date(article.date).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });

    // Generate slug if not available
    const articleSlug = article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = {
      id: article.id,
      title: article.title,
      source: article.author?.display_name || 'naramaknaNEWS',
      timeAgo,
      imageSrc: article.metadata?.thumbnail_url || article.metadata?._thumbnail_url,
      views: article.view_count || 0,
      href: `/artikel/${articleSlug}`,
      isFeatured: index === 0 // First article is featured
    };
    
    // Debug the href to ensure it's properly set
    console.log('🔗 Carousel article href:', result.href, 'for article:', article.title);
    
    return result;
  };

  // Dummy data untuk fallback ketika loading atau error
  const defaultArticles: CarouselArticle[] = [
    {
      id: '1',
      title: 'Perjalanan eFishery: Dari Startup Sederhana, Jadi Unicorn lalu Kolaps',
      source: 'naramaknaNEWS',
      timeAgo: '31 menit',
      href: '/artikel/perjalanan-efishery-dari-startup-sederhana-jadi-unicorn-lalu-kolaps',
      isFeatured: true
    },
    {
      id: '2',
      title: '2 ASN Terduga Teroris Ditangkap Densus 88 di Aceh',
      source: 'naramaknaNEWS',
      timeAgo: '2 jam',
      href: '/artikel/2-asn-terduga-teroris-ditangkap-densus-88-di-aceh'
    },
    {
      id: '3',
      title: 'Polisi Tangkap Penjual Miras Oplosan yang Tewaskan Penonton Sound Horeg',
      source: 'naramaknaNEWS',
      timeAgo: '2 jam',
      href: '/artikel/polisi-tangkap-penjual-miras-oplosan-yang-tewaskan-penonton-sound-horeg'
    },
    {
      id: '4',
      title: 'Pemerintah Akan Terbitkan Aturan Baru untuk E-commerce',
      source: 'naramaknaNEWS',
      timeAgo: '4 jam',
      href: '/artikel/pemerintah-akan-terbitkan-aturan-baru-untuk-e-commerce'
    },
    {
      id: '5',
      title: 'KRL Gangguan Lagi, Kali Ini Terjadi di Stasiun Manggarai',
      source: 'naramaknaNEWS',
      timeAgo: '6 jam',
      href: '/artikel/krl-gangguan-lagi-kali-ini-terjadi-di-stasiun-manggarai'
    }
  ];

  // Prioritas: props articles > API data > fallback data
  let displayArticles: CarouselArticle[] = [];
  
  // Debug removed - production ready
  
  if (articles.length > 0) {
    displayArticles = articles;
  } else if (!loading && !error && apiArticles.length > 0) {
    displayArticles = apiArticles.map(convertToCarouselArticle);
  } else {
    displayArticles = defaultArticles;
  }

  // Loading state
  if (loading && articles.length === 0) {
    return (
      <div className={`h-full flex flex-col ${className}`}>
        <div className="flex-1 mb-6">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
          </div>
        </div>
        <div className="hidden md:grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state (tetap tampilkan fallback data)
  if (error && articles.length === 0) {
    console.warn('MainContentSection API Error:', error);
    // Tetap lanjutkan dengan fallback data, jangan tampilkan error ke user
  }

  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Main Content Area */}
        <div className="md:col-span-3">
          {/* Featured Carousel */}
          <div className="mb-6">
            <Carousel articles={displayArticles.slice(0, 4)} />
          </div>

          {/* Secondary Content Grid - Hidden on mobile, shown as slider */}
          <div className="hidden md:grid md:grid-cols-2 gap-6">
            {displayArticles.filter(article => !article.isFeatured).slice(0, 2).map((article) => (
              <div 
                key={article.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => {
                  if (article.href) {
                    window.location.href = article.href;
                  }
                }}
              >
                <div className="relative h-80 bg-gray-200">
                  {article.imageSrc ? (
                    <img 
                      src={article.imageSrc} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <div className="text-gray-500 text-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-sm">Image</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 text-left">
                    {article.title}
                  </h3>
                  <div className="flex items-center space-x-2 text-left">
                    <span className="text-sm text-gray-600">{article.source}</span>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {true && (
                      <>
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm text-gray-500">{(article.views || 0).toLocaleString()}</span>
                      </>
                    )}
                    <span className="text-sm text-gray-500">{article.timeAgo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Slider for Secondary Content */}
          <div className="md:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {displayArticles.filter(article => !article.isFeatured).slice(0, 3).map((article) => (
                <div 
                  key={article.id} 
                  className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => {
                    if (article.href) {
                      window.location.href = article.href;
                    }
                  }}
                >
                  <div className="relative h-80 bg-gray-200">
                    {article.imageSrc ? (
                      <img 
                        src={article.imageSrc} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                        <div className="text-gray-500 text-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                            <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="text-sm">Image</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 text-left">
                      {article.title}
                    </h3>
                    <div className="flex items-center space-x-2 text-left">
                      <span className="text-sm text-gray-600">{article.source}</span>
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {true && (
                        <>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span className="text-sm text-gray-500">{(article.views || 0).toLocaleString()}</span>
                        </>
                      )}
                      <span className="text-sm text-gray-500">{article.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trending Sidebar */}
        <div className="md:col-span-2">
          <TrendingSection limit={10} includeTikTok={false} mixedContent={false} />
        </div>
      </div>
    </div>
  );
}; 