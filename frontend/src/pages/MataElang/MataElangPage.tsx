import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { Footer } from '../../components/organisms/Footer';
import { buildApiUrl } from '../../config/api';

interface Gallery {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  photographer: string;
  location: string;
  story_date: string;
  view_count: number;
  published_at: string;
  photo_count: number;
  uploader_name: string;
  uploader_role: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const MataElangPage: React.FC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const fetchGalleries = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`mata-elang?page=${page}&limit=12`));

      if (response.ok) {
        const data = await response.json();
        setGalleries(data.data.galleries);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handlePageChange = (page: number) => {
    fetchGalleries(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Disable right-click and other protections + screenshot detection
  useEffect(() => {
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // Log for debugging Mac keys
      if (e.metaKey && e.shiftKey) {
        console.log('🚨 Mac screenshot attempt detected:', e.key, e.code);
      }

      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      // Also disable Print Screen and screenshot shortcuts
      if (
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) ||
        // Mac screenshot combinations - using both key and code
        (e.metaKey && e.shiftKey && (e.key === '3' || e.code === 'Digit3')) || // Cmd+Shift+3 (full screen)
        (e.metaKey && e.shiftKey && (e.key === '4' || e.code === 'Digit4')) || // Cmd+Shift+4 (selection)
        (e.metaKey && e.shiftKey && (e.key === '5' || e.code === 'Digit5')) || // Cmd+Shift+5 (screenshot options)
        (e.metaKey && e.shiftKey && e.key === '$') || // Cmd+Shift+4 alternative
        (e.metaKey && e.shiftKey && e.key === '%') || // Cmd+Shift+5 alternative
        (e.altKey && e.key === 'PrintScreen') || // Alt+PrtScr
        (e.altKey && e.code === 'PrintScreen') // Alt+PrtScr alternative
      ) {
        console.log('🛡️ Screenshot shortcut blocked:', e.key, e.code);
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const disableSelection = () => {
      document.onselectstart = () => false;
      document.ondragstart = () => false;
    };

    // Blur detection (when user switches tabs/apps for screenshot tools)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        document.body.style.filter = 'blur(10px)';
        console.log('🛡️ Page blurred - potential screenshot attempt detected');
      } else {
        setTimeout(() => {
          document.body.style.filter = 'none';
        }, 500);
      }
    };

    const handleWindowBlur = () => {
      document.body.style.filter = 'blur(10px)';
      console.log('🛡️ Window blurred - potential screenshot attempt detected');
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        document.body.style.filter = 'none';
      }, 500);
    };

    // Add event listeners
    document.addEventListener('contextmenu', disableRightClick);
    document.addEventListener('keydown', disableKeyboardShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    disableSelection();

    // Disable clipboard access
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('cut', (e) => e.preventDefault());

    return () => {
      // Cleanup
      document.removeEventListener('contextmenu', disableRightClick);
      document.removeEventListener('keydown', disableKeyboardShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('copy', (e) => e.preventDefault());
      document.removeEventListener('cut', (e) => e.preventDefault());
      document.onselectstart = null;
      document.ondragstart = null;
      document.body.style.filter = 'none';
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{userSelect: 'none', WebkitUserSelect: 'none'}}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Mata Elang
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
            Cerita Lewat Foto
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && galleries.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Belum Ada Galeri</h3>
            <p className="text-gray-500">Galeri foto sedang dalam proses pembuatan.</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && galleries.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              {galleries.map((gallery) => (
                <article key={gallery.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <a href={`/mata-elang/${gallery.slug}`} className="block">
                    <div className="aspect-w-16 aspect-h-10 relative">
                      <img
                        src={gallery.cover_image || '/images/placeholder-gallery.jpg'}
                        alt={gallery.title}
                        className="w-full h-48 sm:h-56 lg:h-64 object-cover pointer-events-none"
                        loading="lazy"
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        style={{userSelect: 'none', WebkitUserSelect: 'none'}}
                      />
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                        {gallery.photo_count} foto
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 lg:p-6">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 hover:text-yellow-600 transition-colors">
                        {gallery.title}
                      </h2>

                      {gallery.description && (
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                          {gallery.description}
                        </p>
                      )}

                      {/* Uploader info - show if uploaded by partner fotografi */}
                      {gallery.uploader_role === 'partner_fotografi' && (
                        <div className="mb-2 sm:mb-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Partner: {gallery.uploader_name}
                          </span>
                        </div>
                      )}

                      <div className="text-xs sm:text-sm text-gray-500 space-y-2">
                        {/* Top row - photographer and location */}
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          {gallery.photographer && (
                            <span className="flex items-center">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{gallery.photographer}</span>
                            </span>
                          )}

                          {gallery.location && (
                            <span className="flex items-center">
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{gallery.location}</span>
                            </span>
                          )}
                        </div>

                        {/* Bottom row - views and date */}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {gallery.view_count}
                          </span>

                          <time dateTime={gallery.published_at} className="text-right">
                            {formatDate(gallery.published_at)}
                          </time>
                        </div>
                      </div>
                    </div>
                  </a>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sm:hidden">‹</span>
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <div className="flex items-center gap-1 sm:gap-2 max-w-full overflow-x-auto">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first page, last page, current page, and pages around current
                      if (page === 1 || page === pagination.pages) return true;
                      if (Math.abs(page - pagination.page) <= 1) return true;
                      return false;
                    })
                    .map((page, index, filteredPages) => (
                      <React.Fragment key={page}>
                        {index > 0 && filteredPages[index - 1] < page - 1 && (
                          <span className="px-2 py-2 text-xs sm:text-sm text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => handlePageChange(page)}
                          className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md min-w-[32px] sm:min-w-[40px] ${
                            page === pagination.page
                              ? 'text-white bg-yellow-500 border border-yellow-500'
                              : 'text-gray-500 bg-white border border-gray-300 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sm:hidden">›</span>
                  <span className="hidden sm:inline">Selanjutnya</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};