import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { Footer } from '../../components/organisms/Footer';
import { buildApiUrl } from '../../config/api';

interface Photo {
  id: number;
  image_url: string;
  caption: string;
  alt_text: string;
  photographer: string;
  sort_order: number;
  is_cover: boolean;
}

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
  photos: Photo[];
}

export const GalleryDetailPage: React.FC = () => {
  // Extract slug from URL manually (similar to CategoryPage approach)
  const slug = window.location.pathname.match(/^\/mata-elang\/([a-zA-Z0-9\-]+)$/)?.[1];
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  // Touch/swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await fetch(buildApiUrl(`mata-elang/${slug}`));

        if (response.ok) {
          const data = await response.json();
          setGallery(data.data);
        } else if (response.status === 404) {
          window.location.href = '/mata-elang';
        }
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchGallery();
    }
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openPhotoViewer = (index: number) => {
    setCurrentPhotoIndex(index);
    setShowPhotoViewer(true);
  };

  const closePhotoViewer = () => {
    setShowPhotoViewer(false);
  };

  const nextPhoto = () => {
    if (gallery && currentPhotoIndex < gallery.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (showPhotoViewer) {
      switch (e.key) {
        case 'Escape':
          closePhotoViewer();
          break;
        case 'ArrowRight':
          nextPhoto();
          break;
        case 'ArrowLeft':
          prevPhoto();
          break;
      }
    }
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && gallery && currentPhotoIndex < gallery.photos.length - 1) {
      nextPhoto();
    }
    if (isRightSwipe && currentPhotoIndex > 0) {
      prevPhoto();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPhotoViewer, currentPhotoIndex]);

  // EXTREME SCREENSHOT PROTECTION - KERNEL LEVEL APPROACH
  useEffect(() => {
    let isBlurred = false;

    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };

    // NUCLEAR OPTION - Block ALL keyboard events during potential screenshot
    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // AGGRESSIVE: Block ANY Cmd/Meta key combinations
      if (e.metaKey || e.ctrlKey) {
        console.log('🚨 BLOCKED MODIFIER KEY:', e.key, e.code, e.metaKey, e.ctrlKey, e.shiftKey, e.altKey);
        e.preventDefault();
        e.stopImmediatePropagation();

        // Immediate blur on any suspicious activity
        if (!isBlurred) {
          document.body.style.filter = 'blur(20px)';
          document.body.style.opacity = '0.1';
          isBlurred = true;

          setTimeout(() => {
            document.body.style.filter = 'none';
            document.body.style.opacity = '1';
            isBlurred = false;
          }, 2000);
        }
        return false;
      }

      // Block ALL function keys and special keys
      if (
        e.key.startsWith('F') || // All F keys
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        e.code.includes('Print') ||
        e.key === 'Insert' ||
        e.key === 'Pause' ||
        e.key === 'ScrollLock'
      ) {
        console.log('🛡️ FUNCTION/SPECIAL KEY BLOCKED:', e.key, e.code);
        e.preventDefault();
        e.stopImmediatePropagation();
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
        // Blur the page content when user switches away
        document.body.style.filter = 'blur(10px)';
        console.log('🛡️ Page blurred - potential screenshot attempt detected');
      } else {
        // Remove blur when user returns
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900">Galeri tidak ditemukan</h1>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle download with watermark
  const handleDownload = async (photo: Photo) => {
    console.log('🔄 Starting download for photo:', photo.id);
    try {
      const url = buildApiUrl(`mata-elang/download-photo/${photo.id}`);
      console.log('📡 Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ Response OK, creating blob...');
        const blob = await response.blob();
        console.log('💾 Blob created, size:', blob.size);

        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadUrl;
        a.download = `naramakna-${photo.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
        console.log('📁 Download triggered successfully');
      } else {
        const errorText = await response.text();
        console.error('❌ Download failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Download error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{userSelect: 'none', WebkitUserSelect: 'none'}}>
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-8 overflow-x-auto">
          <a href="/mata-elang" className="hover:text-yellow-600 whitespace-nowrap">Mata Elang</a>
          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 truncate">{gallery.title}</span>
        </nav>

        {/* Gallery Header */}
        <header className="mb-6 sm:mb-12">
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-6 leading-tight">
            {gallery.title}
          </h1>

          {gallery.description && (
            <p className="text-sm sm:text-base lg:text-xl text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              {gallery.description}
            </p>
          )}

          <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-6 text-xs sm:text-sm text-gray-500">
            {gallery.photographer && (
              <span className="flex items-center">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span><strong>Fotografer:</strong> {gallery.photographer}</span>
              </span>
            )}

            {gallery.location && (
              <span className="flex items-center">
                <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span><strong>Lokasi:</strong> {gallery.location}</span>
              </span>
            )}

            <span className="flex items-center">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span><strong>Tanggal:</strong> {formatDate(gallery.published_at)}</span>
            </span>

            <span className="flex items-center">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{gallery.view_count} kali dilihat</span>
            </span>

            <span className="flex items-center">
              <svg className="w-3 h-3 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{gallery.photos.length} foto</span>
            </span>
          </div>
        </header>

        {/* Photo Grid - Kompas style larger thumbnails */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-8">
          {gallery.photos.map((photo, index) => (
            <div
              key={photo.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => openPhotoViewer(index)}
            >
              <div className="aspect-w-16 aspect-h-12 relative">
                <img
                  src={photo.image_url}
                  alt={photo.alt_text || photo.caption || `Foto ${index + 1}`}
                  className="w-full h-64 sm:h-72 lg:h-80 xl:h-72 object-cover pointer-events-none"
                  loading="lazy"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{userSelect: 'none', WebkitUserSelect: 'none'}}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <svg className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>

              {photo.caption && (
                <div className="p-4 sm:p-6">
                  <p className="text-gray-700 text-sm sm:text-base line-clamp-3 leading-relaxed">
                    {photo.caption}
                  </p>
                  {photo.photographer && photo.photographer !== gallery.photographer && (
                    <p className="text-gray-500 text-xs sm:text-sm mt-3">
                      Foto: {photo.photographer}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Photo Viewer Modal */}
        {showPhotoViewer && gallery.photos[currentPhotoIndex] && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
            <div
              className="relative w-full h-full flex items-center justify-center p-4"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Close Button */}
              <button
                onClick={closePhotoViewer}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-xl sm:text-2xl hover:text-gray-300 z-60 p-2"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Download Button */}
              <button
                onClick={() => handleDownload(gallery.photos[currentPhotoIndex])}
                className="absolute top-2 right-12 sm:top-4 sm:right-16 text-white text-xl sm:text-2xl hover:text-gray-300 z-60 p-2"
                title="Download with watermark"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>

              {/* Navigation Buttons */}
              {currentPhotoIndex > 0 && (
                <button
                  onClick={prevPhoto}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white text-2xl sm:text-3xl hover:text-gray-300 z-60 p-2"
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}

              {currentPhotoIndex < gallery.photos.length - 1 && (
                <button
                  onClick={nextPhoto}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white text-2xl sm:text-3xl hover:text-gray-300 z-60 p-2"
                >
                  <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}

              {/* Main Image */}
              <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl px-2 sm:px-4">
                <img
                  src={gallery.photos[currentPhotoIndex].image_url}
                  alt={gallery.photos[currentPhotoIndex].alt_text || gallery.photos[currentPhotoIndex].caption || `Foto ${currentPhotoIndex + 1}`}
                  className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain touch-manipulation pointer-events-none"
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  style={{userSelect: 'none', WebkitUserSelect: 'none'}}
                />

                {/* Caption */}
                {gallery.photos[currentPhotoIndex].caption && (
                  <div className="bg-black bg-opacity-70 text-white p-2 sm:p-4 mt-2 sm:mt-4 rounded-lg max-w-full sm:max-w-4xl mx-2">
                    <p className="text-center text-xs sm:text-base">
                      {gallery.photos[currentPhotoIndex].caption}
                    </p>
                    {gallery.photos[currentPhotoIndex].photographer &&
                     gallery.photos[currentPhotoIndex].photographer !== gallery.photographer && (
                      <p className="text-center text-xs sm:text-sm text-gray-300 mt-1 sm:mt-2">
                        Foto: {gallery.photos[currentPhotoIndex].photographer}
                      </p>
                    )}
                  </div>
                )}

                {/* Photo Counter */}
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm">
                  {currentPhotoIndex + 1} dari {gallery.photos.length}
                </div>

                {/* Swipe Indicator for Mobile */}
                <div className="absolute bottom-16 sm:bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xs opacity-60 sm:hidden">
                  Geser kiri/kanan untuk navigasi
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};