import React from 'react';
import { TrendingList } from '../../molecules/TrendingList';
import { useTrending } from '../../../hooks/useTrending.ts';
import { useTikTok } from '../../../hooks/useTikTok';
import type { Article } from '../../../services/api/articles';

interface TrendingArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
}

interface TrendingSectionProps {
  articles?: TrendingArticle[];
  className?: string;
  limit?: number;
  category?: string;
  includeTikTok?: boolean;
  mixedContent?: boolean;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  articles = [],
  className = '',
  limit = 5,
  category,
  includeTikTok = true,
  mixedContent = true
}) => {
  // Fetch trending content dari API berdasarkan views
  const { data: apiResponse, loading, error } = useTrending({ 
    limit, 
    category,
    type: 'post' 
  });
  
  // Memoize apiArticles to prevent unnecessary re-renders
  const apiArticles = React.useMemo(() => apiResponse?.posts || [], [apiResponse?.posts]);
  const criteria = apiResponse?.criteria || 'most_viewed';

  // TikTok content integration
  const { content: rawTiktokContent } = useTikTok();
  
  // Memoize tiktokContent to prevent unnecessary re-renders
  const tiktokContent = React.useMemo(() => rawTiktokContent || [], [rawTiktokContent]);

  // Helper function untuk convert API data ke format TrendingArticle
  const convertToTrendingArticle = React.useCallback((article: Article): TrendingArticle => {
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
      imageSrc: article.metadata?.thumbnail_url || article.metadata?._thumbnail_url,
      href: `/artikel/${article.slug}`
    };
  }, []);

  // Helper function untuk convert TikTok content ke format TrendingArticle
  const convertTikTokToTrendingArticle = React.useCallback((tiktokItem: any): TrendingArticle => {
    const timeAgo = new Date(tiktokItem.post_date).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });

    return {
      id: `tiktok_${tiktokItem.metadata?.external_id || tiktokItem.ID}`,
      title: tiktokItem.post_title || 'Video TikTok',
      source: `📱 ${tiktokItem.metadata?.tiktok_author_display_name || 'TikTok'}`,
      timeAgo,
      imageSrc: tiktokItem.metadata?.tiktok_cover_url,
      href: tiktokItem.metadata?.source_url || tiktokItem.guid
    };
  }, []);

  // Mix TikTok and regular content using useMemo instead of useEffect
  const combinedMemoContent = React.useMemo(() => {
    if (!mixedContent || !includeTikTok) {
      return [];
    }

    // Ensure tiktokContent is an array
    const safeTiktokContent = Array.isArray(tiktokContent) ? tiktokContent : [];
    
    const regularArticles = apiArticles.map(convertToTrendingArticle);
    const tiktokArticles = safeTiktokContent
      .slice(0, Math.ceil(limit / 3)) // Limit TikTok content to 1/3 of total
      .map(convertTikTokToTrendingArticle);

    // Interleave content: every 3rd item is TikTok if available
    const mixed: TrendingArticle[] = [];
    let regularIndex = 0;
    let tiktokIndex = 0;

    for (let i = 0; i < limit; i++) {
      if (i % 3 === 2 && tiktokIndex < tiktokArticles.length) {
        // Every 3rd position, add TikTok content
        mixed.push(tiktokArticles[tiktokIndex]);
        tiktokIndex++;
      } else if (regularIndex < regularArticles.length) {
        // Add regular content
        mixed.push(regularArticles[regularIndex]);
        regularIndex++;
      } else if (tiktokIndex < tiktokArticles.length) {
        // Fill remaining with TikTok if no regular content
        mixed.push(tiktokArticles[tiktokIndex]);
        tiktokIndex++;
      }
    }

    return mixed;
  }, [apiArticles, tiktokContent, limit, includeTikTok, mixedContent, convertToTrendingArticle, convertTikTokToTrendingArticle]);

  // Use the memoized combined content directly

  // Dummy data untuk fallback
  const defaultArticles: TrendingArticle[] = [
    {
      id: '1',
      title: 'Komjen Fadil Imran Jabat Astama Ops Kapolri, Gantikan Komjen Akhmad Wiyagus',
      source: 'naramaknaNEWS',
      timeAgo: '4 jam',
      imageSrc: undefined
    },
    {
      id: '2',
      title: 'Dahlia Poland Gugat Cerai Fandy Christian',
      source: 'naramaknaHITS',
      timeAgo: '10 jam',
      imageSrc: undefined
    },
    {
      id: '3',
      title: 'Profil Irjen Asep Edi Suheri, Wakabareskrim Polri yang Kini Jabat Kapolda Metro',
      source: 'naramaknaNEWS',
      timeAgo: '4 jam',
      imageSrc: undefined
    },
    {
      id: '4',
      title: 'KRL Gangguan Lagi, Kali Ini Terjadi di Stasiun Manggarai',
      source: 'naramaknaNEWS',
      timeAgo: '6 jam',
      imageSrc: undefined
    },
    {
      id: '5',
      title: 'Pemerintah Akan Terbitkan Aturan Baru untuk E-commerce',
      source: 'naramaknaNEWS',
      timeAgo: '8 jam',
      imageSrc: undefined
    }
  ];

  // Prioritas: props articles > mixed content > API data > fallback data
  let displayArticles: TrendingArticle[] = [];
  
  if (articles.length > 0) {
    displayArticles = articles.slice(0, 5);
  } else if (mixedContent && includeTikTok && combinedMemoContent.length > 0) {
    displayArticles = combinedMemoContent.slice(0, 5);
  } else if (!loading && !error && apiArticles.length > 0) {
    displayArticles = apiArticles.map(convertToTrendingArticle).slice(0, 5);
  } else {
    displayArticles = defaultArticles;
  }

  // Loading state untuk trending section
  if (loading && articles.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Trending</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error handling (silent fallback)
  if (error && articles.length === 0) {
    console.warn('TrendingSection API Error:', error);
    // Tetap lanjutkan dengan fallback data
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">
            {criteria === 'most_recent' ? 'Terbaru' : 'Trending'}
          </h2>
        </div>
        <a 
          href={category ? `/kategori/${category}` : "#"} 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors duration-200"
        >
          <span>Lihat lainnya</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="max-h-96 overflow-y-auto scrollbar-hide">
          <TrendingList articles={displayArticles} />
        </div>
      </div>
    </div>
  );
}; 