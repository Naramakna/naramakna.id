import React from 'react';
import { LatestArticle } from '../../molecules/LatestArticle';
import { articlesAPI } from '../../../services/api/articles';
import type { Article } from '../../../services/api/articles';
import { getCategorySlug } from '../../../utils/categorySlugMapping';

interface LatestItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  views?: number;
}

interface LatestArticleSectionProps {
  articles?: LatestItem[];
  className?: string;
  limit?: number;
  category?: string;
}

export const LatestArticleSection: React.FC<LatestArticleSectionProps> = ({
  articles = [],
  className = '',
  limit = 6,
  category
}) => {
  const [latest, setLatest] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await articlesAPI.getLatestArticles({ limit });
        if (res.success) {
          const posts = Array.isArray((res.data as any)?.posts) ? (res.data as any).posts : [];
          if (mounted) setLatest(posts);
        } else {
          if (mounted) setError(res.message || 'Gagal mengambil artikel terbaru');
        }
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Terjadi kesalahan');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [limit]);

  const convertToLatestItem = React.useCallback((article: any): LatestItem => {
    const articleDate = article.post_date || article.date;
    const articleTitle = article.post_title || article.title;
    const articleSlug = article.post_name || article.slug;
    const articleId = article.ID || article.id;
    const authorName = article.author_name || article.author?.display_name;

    const timeAgo = new Date(articleDate).toLocaleString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });

    const imageSrc = 
      article.thumbnail_url ||
      article.metadata?.thumbnail_url ||
      article.metadata?._thumbnail_url ||
      article.metadata?.featured_image ||
      article.post_thumbnail ||
      article.featured_image_url ||
      article.thumbnail ||
      undefined;

    return {
      id: String(articleId),
      title: articleTitle,
      source: authorName || 'naramaknaNEWS',
      timeAgo,
      imageSrc,
      href: `/artikel/${articleSlug}`,
      views: article.view_count || 0
    };
  }, []);

  const defaultArticles: LatestItem[] = [
    { id: '1', title: 'Artikel terbaru contoh 1', source: 'naramaknaNEWS', timeAgo: '4 jam' },
    { id: '2', title: 'Artikel terbaru contoh 2', source: 'naramaknaHITS', timeAgo: '10 jam' },
    { id: '3', title: 'Artikel terbaru contoh 3', source: 'naramaknaNEWS', timeAgo: '12 jam' },
    { id: '4', title: 'Artikel terbaru contoh 4', source: 'naramaknaNEWS', timeAgo: '16 jam' },
    { id: '5', title: 'Artikel terbaru contoh 5', source: 'naramaknaNEWS', timeAgo: '20 jam' }
  ];

  let displayArticles: LatestItem[] = [];
  if (articles.length > 0) {
    displayArticles = articles.slice(0, 5);
  } else if (!loading && latest.length > 0) {
    displayArticles = latest.map(convertToLatestItem).slice(0, 5);
  } else {
    displayArticles = defaultArticles;
  }

  if (loading && articles.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900">Artikel Terbaru</h2>
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

  if (error && articles.length === 0) {
    console.warn('LatestArticleSection API Error:', error);
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
          <h2 className="text-lg font-semibold text-gray-900">Artikel Terbaru</h2>
        </div>
        <a 
          href={category ? `/kategori/${getCategorySlug(category)}` : "#"} 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors duration-200"
        >
          <span>Lihat lainnya</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>

      <div className="p-4">
        <div className="max-h-120 overflow-y-auto scrollbar-hide">
          <LatestArticle articles={displayArticles} />
        </div>
      </div>
    </div>
  );
};
