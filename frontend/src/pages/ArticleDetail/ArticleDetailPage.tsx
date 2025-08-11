import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { ArticleHeader } from '../../components/molecules/ArticleHeader';
import { ArticleContent } from '../../components/organisms/ArticleContent';
import { ArticleTags } from '../../components/molecules/ArticleTags';
import { CommentsSection } from '../../components/organisms/CommentsSection';
import { RelatedArticles } from '../../components/organisms/RelatedArticles';
import { AdSection } from '../../components/organisms/AdSection';
import 'quill/dist/quill.snow.css'; // Import Quill CSS for alignment classes

interface ArticleDetailPageProps {
  articleId?: string;
  articleSlug?: string;
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
    name: string;
    isVerified: boolean;
    avatar?: string;
  };
  publishedDate: string;
  readTime: string;
  likes: number;
  comments: number;
  category: string;
  tags: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ articleId, articleSlug }) => {
  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract article identifier from URL or props
  const currentArticleId = articleId || (articleSlug ? null : window.location.pathname.split('/').pop());
  const currentArticleSlug = articleSlug || (articleId ? null : window.location.pathname.split('/').pop());

  useEffect(() => {
    if (currentArticleId) {
      fetchArticleById(currentArticleId);
      fetchRelatedArticles(currentArticleId);
      fetchComments(currentArticleId);
    } else if (currentArticleSlug) {
      fetchArticleBySlug(currentArticleSlug);
      fetchRelatedArticlesBySlug(currentArticleSlug);
      fetchCommentsBySlug(currentArticleSlug);
    }
  }, [currentArticleId, currentArticleSlug]);

  const fetchArticleById = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/content/posts/${id}`, {
        credentials: 'include'
      });
      
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
              name: result.data.author?.display_name || result.data.author?.user_login || 'Anonymous',
              isVerified: result.data.author?.user_role === 'admin' || result.data.author?.user_role === 'writer',
              avatar: result.data.author?.profile_image || undefined
            },
            publishedDate: formatDate(result.data.post_date || result.data.published_date),
            readTime: calculateReadTime(result.data.post_content || result.data.content || ''),
            likes: result.data.likes || 0,
            comments: result.data.comment_count || 0,
            category: result.data.category || 'News',
            tags: result.data.tags || []
          };
          
          setArticle(transformedArticle);
          
          // Track view analytics
          trackView(id);
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
      const response = await fetch(`http://localhost:3001/api/content/posts/slug/${slug}`, {
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
              url: result.data.featured_image.url,
              caption: result.data.featured_image.caption || result.data.featured_image.title || '',
              alt: result.data.post_title || 'Article image'
            } : undefined,
            author: {
              name: result.data.author?.display_name || result.data.author?.user_login || 'Anonymous',
              isVerified: result.data.author?.user_role === 'admin' || result.data.author?.user_role === 'writer',
              avatar: result.data.author?.profile_image || undefined
            },
            publishedDate: formatDate(result.data.post_date || result.data.published_date),
            readTime: calculateReadTime(result.data.post_content || result.data.content || ''),
            likes: result.data.likes || 0,
            comments: result.data.comment_count || 0,
            category: result.data.category || 'News',
            tags: result.data.tags || []
          };
          
          setArticle(transformedArticle);
          
          // Track view analytics using the actual ID
          if (result.data.ID) {
            trackView(result.data.ID.toString());
          }
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
      const response = await fetch(`http://localhost:3001/api/content/posts?limit=6&exclude=${excludeId}`, {
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
      const response = await fetch(`http://localhost:3001/api/content/posts?limit=6&excludeSlug=${excludeSlug}`, {
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

  const fetchComments = async (postId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/content/posts/${postId}/comments`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setComments(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchCommentsBySlug = async (slug: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/content/posts/slug/${slug}/comments`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setComments(result.data);
        }
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const trackView = async (postId: string) => {
    try {
      await fetch('http://localhost:3001/api/analytics/track', {
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

  const handleAddComment = async (content: string) => {
    if (!article) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/content/posts/${article.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ content })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Refresh comments
          fetchComments(article.id);
        }
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      throw err;
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
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
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The article you are looking for does not exist.'}</p>
            <a 
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Top Article Ad */}
      <AdSection 
        placement="article-top" 
        size="header" 
        rotationInterval={8000}
      />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Article Header */}
            <ArticleHeader
              title={article.title}
              author={article.author}
              publishedDate={article.publishedDate}
              readTime={article.readTime}
              likes={article.likes}
              comments={article.comments}
              categoryName={article.category}
            />

            {/* Article Content */}
            <ArticleContent
              content={article.content}
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

            {/* Comments Section */}
            <CommentsSection
              postId={article.id}
            />
          </div>
        </div>

        {/* Before Related Articles Ad */}
        <div className="my-8">
          <AdSection 
            placement="article-bottom" 
            size="header" 
            rotationInterval={12000}
          />
        </div>

        {/* Related Articles */}
        <RelatedArticles articles={relatedArticles} />
        
        {/* Final Article Ad */}
        <div className="mt-8">
          <AdSection 
            placement="article-final" 
            size="regular" 
            rotationInterval={15000}
          />
        </div>
      </main>
    </div>
  );
};

export default ArticleDetailPage;
