import React, { useState, useEffect } from 'react';
import { Navbar } from '../Navbar';
import { Footer } from '../Footer';
import { ArticleHeader } from '../../molecules/ArticleHeader';
import { ArticleContent } from '../ArticleContent';
import { ArticleTags } from '../../molecules/ArticleTags';
import { RelatedArticles } from '../RelatedArticles';
import { AdSection } from '../AdSection';
import { useSEO, generateDescription, extractKeywords, formatStructuredDataDate } from '../../../hooks/useSEO';
import { useAnalytics } from '../../../hooks/useAnalytics';
import { buildApiUrl } from '../../../config/api';
import 'quill/dist/quill.snow.css';

interface PreviewDetailArticleProps {
  articleId?: string;
  articleSlug?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    caption?: string;
    alt?: string;
  };
  author: {
    id?: string | number;
    name: string;
    login?: string;
    user_nicename?: string;
    isVerified: boolean;
    avatar?: string;
  };
  publishedDate: string;
  readTime: string;
  likes: number;
  comments: number;
  views: number;
  category: string;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export const PreviewDetailArticle: React.FC<PreviewDetailArticleProps> = ({ 
  articleId, 
  articleSlug, 
  isOpen, 
  onClose 
}) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [viewTracked, setViewTracked] = useState(false);
  const { trackArticleRead } = useAnalytics();

  // Extract article identifier from URL or props
  const currentArticleId = articleId || (articleSlug ? null : window.location.pathname.split('/').pop());
  const currentArticleSlug = articleSlug || (articleId ? null : window.location.pathname.split('/').pop());

  useEffect(() => {
    if (!isOpen) return;
    
    if (currentArticleId) {
      fetchArticleById(currentArticleId);
      fetchRelatedArticles(currentArticleId);
    } else if (currentArticleSlug) {
      fetchArticleBySlug(currentArticleSlug);
      fetchRelatedArticlesBySlug(currentArticleSlug);
    }
  }, [currentArticleId, currentArticleSlug, isOpen]);
  
  // Separate useEffect for tracking views to ensure it only happens once per article
  useEffect(() => {
    if (article && !viewTracked && article.id && isOpen) {
      // Track internal view (existing system)
      trackView(article.id);
      
      // Track Google Analytics article read
      trackArticleRead({
        title: article.title,
        slug: currentArticleSlug || article.id,
        category: article.category || 'Article',
        author: article.author?.name || 'Unknown',
        readTime: article.readTime
      });
      
      setViewTracked(true);
    }
  }, [article, viewTracked, trackArticleRead, currentArticleSlug, isOpen]);

  const fetchArticleById = async (id: string) => {
    try {
      // First try the regular published posts endpoint
      let response = await fetch(buildApiUrl(`content/posts/${id}`), {
        credentials: 'include'
      });
      
      // If not found, try the approval/my-pending endpoint for pending posts
      if (!response.ok || response.status === 404) {
        response = await fetch(buildApiUrl(`approval/my-pending`), {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const pendingResult = await response.json();
          if (pendingResult.success && pendingResult.data?.my_pending_posts) {
            const pendingPost = pendingResult.data.my_pending_posts.find((post: any) => post.ID.toString() === id);
            if (pendingPost) {
              // Transform pending post data to match Article interface
              const transformedArticle: Article = {
                id: pendingPost.ID?.toString() || id,
                title: pendingPost.post_title || 'Untitled',
                content: pendingPost.post_content || '',
                excerpt: pendingPost.post_excerpt || '',
                featuredImage: pendingPost.featured_image ? {
                  url: pendingPost.featured_image,
                  caption: pendingPost.image_caption || '',
                  alt: pendingPost.post_title || 'Article image'
                } : undefined,
                author: {
                  id: pendingPost.author?.ID,
                  name: pendingPost.author?.display_name || pendingPost.author?.user_login || 'Anonymous',
                  login: pendingPost.author?.user_login,
                  user_nicename: pendingPost.author?.user_nicename,
                  isVerified: pendingPost.author?.user_role === 'admin' || pendingPost.author?.user_role === 'writer',
                  avatar: pendingPost.author?.profile_image || undefined
                },
                publishedDate: formatDate(pendingPost.post_date),
                readTime: calculateReadTime(pendingPost.post_content || ''),
                likes: 0, // Pending posts don't have likes yet
                comments: 0, // Pending posts don't have comments yet
                views: 0, // Pending posts don't have views yet
                category: pendingPost.category || 'Pending',
                tags: pendingPost.tags || []
              };
              
              setArticle(transformedArticle);
              setLoading(false);
              return;
            }
          }
        }
        
        // If still not found, set error
        setError('Article not found');
        setLoading(false);
        return;
      }
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform backend data to frontend format
          const transformedArticle: Article = {
            id: result.data.ID?.toString() || id,
            title: result.data.post_title || result.data.title || 'Untitled',
            content: result.data.post_content || result.data.content || '',
            excerpt: result.data.post_excerpt || result.data.excerpt || '',
            featuredImage: result.data.featured_image ? {
              url: result.data.featured_image,
              caption: result.data.image_caption || '',
              alt: result.data.post_title || 'Article image'
            } : undefined,
            author: {
              id: result.data.author?.ID,
              name: result.data.author?.display_name || result.data.author?.user_login || 'Anonymous',
              login: result.data.author?.user_login,
              user_nicename: result.data.author?.user_nicename,
              isVerified: result.data.author?.user_role === 'admin' || result.data.author?.user_role === 'writer',
              avatar: result.data.author?.profile_image || undefined
            },
            publishedDate: formatDate(result.data.post_date || result.data.published_date),
            readTime: calculateReadTime(result.data.post_content || result.data.content || ''),
            likes: result.data.likes || 0,
            comments: result.data.comment_count || 0,
            views: result.data.view_count || result.data.views || 0,
            category: result.data.category || 'News',
            tags: result.data.tags || []
          };
          
          setArticle(transformedArticle);
        } else {
          setError('Article not found');
        }
      } else {
        setError('Failed to load article');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleBySlug = async (slug: string) => {
    try {
      const response = await fetch(buildApiUrl(`content/posts/slug/${slug}`), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform backend data to frontend format
          const transformedArticle: Article = {
            id: result.data.ID?.toString() || slug,
            title: result.data.post_title || result.data.title || 'Untitled',
            content: result.data.post_content || result.data.content || '',
            excerpt: result.data.post_excerpt || result.data.excerpt || '',
            featuredImage: result.data.featured_image ? {
              url: result.data.featured_image.url || result.data.featured_image,
              caption: result.data.featured_image.caption || result.data.featured_image.title || '',
              alt: result.data.post_title || 'Article image'
            } : undefined,
            author: {
              id: result.data.author?.ID,
              name: result.data.author?.display_name || result.data.author?.user_login || 'Anonymous',
              login: result.data.author?.user_login,
              user_nicename: result.data.author?.user_nicename,
              isVerified: result.data.author?.user_role === 'admin' || result.data.author?.user_role === 'writer',
              avatar: result.data.author?.profile_image || undefined
            },
            publishedDate: formatDate(result.data.post_date || result.data.published_date),
            readTime: calculateReadTime(result.data.post_content || result.data.content || ''),
            likes: result.data.likes || 0,
            comments: result.data.comment_count || 0,
            views: result.data.view_count || result.data.views || 0,
            category: result.data.category || 'News',
            tags: result.data.tags || []
          };
          
          setArticle(transformedArticle);
        } else {
          setError('Article not found');
        }
      } else {
        setError('Failed to load article');
      }
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArticles = async (excludeId: string) => {
    try {
      const response = await fetch(buildApiUrl(`content/posts?limit=6&exclude=${excludeId}`), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRelatedArticles(result.data.slice(0, 3)); // Show only 3 related articles
        }
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  const fetchRelatedArticlesBySlug = async (excludeSlug: string) => {
    try {
      const response = await fetch(buildApiUrl(`content/posts?limit=6&excludeSlug=${excludeSlug}`), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.posts) {
          setRelatedArticles(result.data.posts.slice(0, 3)); // Show only 3 related articles
        }
      }
    } catch (err) {
      console.error('Error fetching related articles:', err);
    }
  };

  const trackView = async (postId: string) => {
    try {
      await fetch(buildApiUrl('analytics/track'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          content_id: parseInt(postId),
          content_type: 'post',
          event_type: 'view'
        })
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handleAnalyticsClick = () => {
    setShowAnalyticsModal(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateReadTime = (content: string): string => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} menit`;
  };

  // SEO optimization
  useSEO({
    title: article ? `Preview: ${article.title} | Naramakna` : 'Preview Article | Naramakna',
    description: article ? generateDescription(article.content) : 'Preview artikel dari Naramakna',
    keywords: article ? extractKeywords(article.title, article.content, article.tags.map(tag => typeof tag === 'string' ? tag : tag.name)) : ['preview', 'artikel', 'naramakna'],
    image: article?.featuredImage?.url,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    type: 'article',
    author: article?.author.name,
    publishedTime: article?.publishedDate ? formatStructuredDataDate(article.publishedDate) : undefined,
    section: article?.category,
    tags: article?.tags.map(tag => typeof tag === 'string' ? tag : tag.name),
    locale: 'id_ID'
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative min-h-screen bg-gray-50">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-60 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <Navbar />
        
        {/* Top Article Ad */}
        <AdSection 
          placement="article-top" 
          size="header" 
          rotationInterval={8000}
        />
        
        <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden p-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                <div className="h-64 bg-gray-200 rounded mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ) : error || !article ? (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
              <button 
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close Preview
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-6 lg:p-8">
                {/* Preview Badge */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Preview Mode
                  </span>
                  
                  {/* Status Badge for Pending Articles */}
                  {article.category === 'Pending' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending Review
                    </span>
                  )}
                  
                  {/* Draft Notice */}
                  {(article.category === 'Pending' || article.views === 0) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      Not Published
                    </span>
                  )}
                </div>

                {/* Article Header */}
                <ArticleHeader
                  title={article.title}
                  author={article.author}
                  publishedDate={article.publishedDate}
                  readTime={article.readTime}
                  likes={article.likes}
                  comments={article.comments}
                  categoryName={article.category}
                  articleId={article.id}
                  viewCount={article.views}
                  onAnalyticsClick={handleAnalyticsClick}
                />

                {/* Article Content */}
                <ArticleContent
                  content={article.content}
                  title={article.title}
                  featuredImage={article.featuredImage}
                />

                {/* Mid Article Ad */}
                <div className="my-8">
                  <AdSection 
                    placement="article-mid" 
                    size="regular" 
                    rotationInterval={10000}
                  />
                </div>

                {/* Article Tags */}
                <ArticleTags tags={article.tags} />
              </div>
            </div>
          )}

          {/* Related Articles */}
          {article && <RelatedArticles articles={relatedArticles} />}
          
          {/* Final Article Ad */}
          <div className="mt-8">
            <AdSection 
              placement="article-final" 
              size="regular" 
              rotationInterval={15000}
            />
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default PreviewDetailArticle;
