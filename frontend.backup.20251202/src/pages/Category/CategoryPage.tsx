import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { ArticleCard } from '../../components/molecules/ArticleCard/ArticleCard';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';

interface CategoryPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  author_name: string;
  author_id: number;
}

interface CategoryPageData {
  posts: CategoryPost[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  category: {
    slug: string;
    name: string;
  };
}

const CategoryPage: React.FC = () => {
  // Extract slug from URL manually (similar to SimpleRouter approach)
  const slug = window.location.pathname.match(/^\/kategori\/([a-zA-Z0-9\-]+)$/)?.[1];
  
  const [data, setData] = useState<CategoryPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCategoryPosts(slug, 0, true);
    }
  }, [slug]);

  const fetchCategoryPosts = async (categorySlug: string, offset: number = 0, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `http://dev.naramakna.id/api/category/${categorySlug}/posts?limit=10&offset=${offset}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch category posts');
      }

      const result = await response.json();
      if (result.success) {
        if (reset) {
          setData(result.data);
        } else {
          setData(prev => prev ? {
            ...result.data,
            posts: [...prev.posts, ...result.data.posts]
          } : result.data);
        }
      } else {
        throw new Error(result.message || 'Failed to load posts');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error fetching category posts:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (data && slug) {
      const nextOffset = data.posts.length;
      fetchCategoryPosts(slug, nextOffset, false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => slug && fetchCategoryPosts(slug, 0, true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Kategori: {data?.category.name || slug}
            </h1>
            <p className="text-gray-600 text-lg">
              Belum ada artikel dalam kategori ini.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {data.category.name}
          </h1>
          <p className="text-gray-600">
            {data.pagination.total} artikel ditemukan
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {data.posts.map((post) => (
            <ArticleCard
              key={post.id}
              article={{
                id: post.id,
                title: post.title,
                excerpt: post.excerpt || post.content.substring(0, 150) + '...',
                featured_image: '', // Will be populated if available
                date: post.date,
                author: {
                  name: post.author_name,
                  id: post.author_id
                },
                slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                category: data.category.name
              }}
            />
          ))}
        </div>

        {/* Load More Button */}
        {data.pagination.hasMore && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <span className="flex items-center">
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Memuat...
                </span>
              ) : (
                'Muat Lebih Banyak'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;