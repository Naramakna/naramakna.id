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
import type { IndexBeritaData } from './IndexBerita.types';

export const IndexBerita: React.FC = () => {
  const [data, setData] = useState<IndexBeritaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔄 IndexBerita render - loading:', loading, 'data:', data, 'error:', error);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching articles...');

      // Simple mock data that always works
      const mockArticles = [
        {
          id: 1,
          title: "Berita Politik Terkini: Perkembangan Terbaru di Dunia Politik",
          content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          excerpt: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
          featured_image: "https://picsum.photos/400/300?random=1",
          date: "2024-01-15T10:30:00Z",
          author_name: "John Doe",
          author_id: 1,
          slug: "berita-politik-terkini",
          category_name: "Politik",
          view_count: 1250
        },
        {
          id: 2,
          title: "Update Ekonomi: Kondisi Perekonomian Indonesia Saat Ini",
          content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          excerpt: "Ut enim ad minim veniam, quis nostrud exercitation...",
          featured_image: "https://picsum.photos/400/300?random=2",
          date: "2024-01-14T15:45:00Z",
          author_name: "Jane Smith",
          author_id: 2,
          slug: "update-ekonomi-indonesia",
          category_name: "Ekonomi",
          view_count: 890
        },
        {
          id: 3,
          title: "Olahraga Nasional: Prestasi Atlet Indonesia di Kancah Internasional",
          content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
          excerpt: "Duis aute irure dolor in reprehenderit in voluptate...",
          featured_image: "https://picsum.photos/400/300?random=3",
          date: "2024-01-13T09:20:00Z",
          author_name: "Bob Johnson",
          author_id: 3,
          slug: "olahraga-nasional-prestasi-atlet",
          category_name: "Olahraga",
          view_count: 2100
        }
      ];

      // Short delay
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('✅ Setting data...');

      setData({
        articles: mockArticles,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalArticles: 3,
          hasMore: false
        }
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
  }, []);





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

  if (!data || data.articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SEOHead 
          title="Index Berita - Naramakna.id"
          description="Kumpulan lengkap semua berita dan artikel terbaru dari Naramakna.id"
          
        />
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Belum Ada Artikel</h2>
            <p className="text-gray-600">Belum ada artikel yang dipublikasikan.</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* IndexCardList dengan iklan setiap 5 artikel */}
        <div className="bg-gray-50 py-8">
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
              views: article.view_count || Math.floor(Math.random() * 3000) + 100
            }))}
          />



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
