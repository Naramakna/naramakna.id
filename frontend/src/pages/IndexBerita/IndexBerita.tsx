import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { AdSection } from '../../components/organisms/AdSection';
import { MainContentSection } from '../../components/organisms/MainContentSection';
import { VideoSection } from '../../components/organisms/VideoSection';
import { PollingMain } from '../../components/organisms/PollingMain';
import { Footer } from '../../components/organisms/Footer';
import { IndexCardList } from '../../components/molecules/IndexCardList/IndexCardList';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner';
import { SEOHead } from '../../components/atoms/SEOHead';
import { buildApiUrl } from '../../config/api';
import type { IndexBeritaData } from './IndexBerita.types';

export const IndexBerita: React.FC = () => {
  const [data, setData] = useState<IndexBeritaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 50
  });

  console.log('🔄 IndexBerita render - loading:', loading, 'data:', data, 'error:', error);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching articles with filters:', filters);

      // Build query parameters
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      if (filters.search) queryParams.append('search', filters.search);
      if (filters.category) queryParams.append('category', filters.category);

      const response = await fetch(buildApiUrl(`content/feed?${queryParams}`));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📡 API Response:', result);

      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch articles');
      }

      // Transform API data to component format
      const transformedArticles = result.data.posts.map((post: any) => ({
        id: post.id,
        title: post.title || 'Untitled',
        content: post.content || '',
        excerpt: post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : ''),
        featured_image: post.featured_image?.url || '',
        date: post.date || new Date().toISOString(),
        author_name: post.author?.display_name || 'Unknown',
        author_id: post.author?.ID || 0,
        slug: post.slug || post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'untitled',
        category_name: post.categories?.[0]?.name || 'Umum',
        view_count: post.view_count || 0
      }));

      // Always replace data since we're using incremental limit instead of pagination
      const totalArticles = result.data.pagination?.totalItems || transformedArticles.length;
      const hasMoreData = transformedArticles.length < totalArticles && filters.limit < 350;
      
      setData({
        articles: transformedArticles,
        pagination: {
          currentPage: result.data.pagination?.currentPage || filters.page,
          totalPages: result.data.pagination?.totalPages || 1,
          totalArticles: totalArticles,
          hasMore: hasMoreData
        }
      });
      
      console.log('📊 Pagination debug:', {
        totalArticles,
        currentArticles: transformedArticles.length,
        limit: filters.limit,
        hasMoreData,
        backendPagination: result.data.pagination
      });

      console.log('✅ Data set successfully');

    } catch (err) {
      console.error('❌ Error fetching articles:', err);
      setError('Gagal memuat artikel. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  };

  // Handle load more - increment by 50 each time
  const handleLoadMore = () => {
    if (data?.pagination.hasMore) {
      const newLimit = Math.min(filters.limit + 50, 350); // Max 350 articles
      setFilters(prev => ({ ...prev, limit: newLimit, page: 1 })); // Reset to page 1 with increased limit
    }
  };





  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Index Berita - Naramakna.id"
          description="Kumpulan lengkap semua berita dan artikel terbaru dari Naramakna.id"
          
        />
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-600">Memuat artikel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Error - Index Berita"
          description="Terjadi kesalahan saat memuat artikel"
        />
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => fetchArticles()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead 
        title="Index Berita - Naramakna.id"
        description="Kumpulan lengkap semua berita dan artikel terbaru dari Naramakna.id. Temukan berita politik, ekonomi, olahraga, dan berbagai topik menarik lainnya."
        

      />

      {/* Navbar Component */}
      <Navbar />

      {/* Hero Banner - Fast rotation (3 seconds) */}
      <AdSection 
        placement="hero-banner" 
        size='header' 
        rotationInterval={3000}
      />



      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
        {/* MainContentSection  */}
        <MainContentSection />

        {/* Mid Content Banner - Normal rotation (5 seconds) */}
        <AdSection 
          placement="mid-content" 
          size='header' 
          rotationInterval={5000}
        />

        {/* Video Section */}
        <VideoSection />
        
        {/* Polling Section */}
        <PollingMain />

        {/* Search and Filter UI */}
        <div className="bg-white shadow-sm border-b border-gray-200 py-6 mb-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Cari artikel..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div className="flex-1 min-w-48">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Semua Berita</option>
                  <option value="narapandang">Narapandang</option>
                  <option value="pelakon">Pelakon</option>
                  <option value="laga-gaya">Laga & Gaya</option>
                  <option value="wahana">Wahana</option>
                  <option value="olah-bola">Olah Bola</option>
                  <option value="cerita-rasa">Cerita Rasa</option>
                  <option value="akal-budi">Akal Budi</option>
                  <option value="budaya">Budaya</option>
                  <option value="pendidikan">Pendidikan</option>
                  <option value="teknologi">Teknologi</option>
                  <option value="horison">Horison</option>
                  <option value="dunia">Dunia</option>
                </select>
              </div>

              {/* Sort Options */}
              <div className="flex-1 min-w-48">
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange({ sortBy, sortOrder });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="date-desc">Terbaru</option>
                  <option value="date-asc">Terlama</option>
                  <option value="title-asc">Judul A-Z</option>
                  <option value="title-desc">Judul Z-A</option>
                  <option value="views-desc">Paling Populer</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-500 whitespace-nowrap">
                {data ? `${data.pagination.totalArticles} artikel` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* IndexCardList dengan iklan setiap 5 artikel */}
        <div className="bg-gray-50 py-8">
          {data && data.articles.length > 0 ? (
            <IndexCardList 
              articles={data.articles.map((article) => ({
                id: article.id,
                title: article.title,
                excerpt: article.excerpt || article.content.substring(0, 150) + '...',
                featured_image: article.featured_image || '',
                date: article.date,
                author: {
                  name: article.author_name,
                  id: article.author_id
                },
                slug: article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                category: article.category_name || 'Umum',
                views: article.view_count || 0
              }))}
            />
          ) : (
            /* Empty State - di dalam content area */
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="text-center">
                  <div className="text-gray-400 mb-6">
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Tidak Ada Artikel Ditemukan</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {filters.search || filters.category 
                      ? 'Tidak ada artikel yang sesuai dengan filter yang dipilih. Coba ubah kata kunci atau filter lainnya.'
                      : 'Belum ada artikel yang dipublikasikan.'
                    }
                  </p>
                  
                  {/* Action buttons untuk clear filters */}
                  {(filters.search || filters.category) && (
                    <button
                      onClick={() => setFilters({
                        search: '',
                        category: '',
                        sortBy: 'date',
                        sortOrder: 'desc',
                        page: 1,
                        limit: 50
                      })}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Load More Button */}
          {data && data.pagination.hasMore && filters.limit < 350 && (
            <div className="text-center mt-8 mb-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat...
                  </span>
                ) : (
                  `Tampilkan ${Math.min(50, data.pagination.totalArticles - data.articles.length)} Lagi (${filters.limit + 50} total)`
                )}
              </button>
              <div className="text-sm text-gray-500 mt-2">
                Menampilkan {data.articles.length} dari {data.pagination.totalArticles} artikel
              </div>
            </div>
          )}
          
          {/* Show when reached maximum limit */}
          {data && filters.limit >= 350 && data.articles.length >= 350 && (
            <div className="text-center mt-8 mb-8">
              <div className="text-gray-600">
                Menampilkan maksimal 350 artikel. Gunakan filter untuk mempersempit pencarian.
              </div>
            </div>
          )}
        </div>

        {/* Bottom Banner - Slow rotation (10 seconds) */}
        <AdSection 
          placement="bottom-content" 
          size='regular' 
          rotationInterval={10000}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
