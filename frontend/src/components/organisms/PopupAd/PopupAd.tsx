import React, { useState, useEffect } from 'react';

interface PopupAdData {
  id: number;
  title: string;
  image_url: string;
  target_url: string;
  status: 'active' | 'inactive';
  start_date: string;
  end_date: string;
}

interface PopupAdProps {
  onClose?: () => void;
}

export const PopupAd: React.FC<PopupAdProps> = ({ onClose }) => {
  const [adData, setAdData] = useState<PopupAdData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    checkAndShowPopupAd();
  }, []);

  const checkAndShowPopupAd = async () => {
    try {
      // Check if popup was already shown today
      const lastShown = localStorage.getItem('naramakna_popup_shown');
      const today = new Date().toDateString();
      
      if (lastShown === today) {
        setLoading(false);
        return; // Don't show popup if already shown today
      }

      // Fetch active popup ad from API
      const response = await fetch('http://localhost:3001/api/ads/popup-active');
      const result = await response.json();

      if (result.success && result.data) {
        setAdData(result.data);
        // Small delay for better UX
        setTimeout(() => {
          setIsVisible(true);
        }, 1000);
      }
    } catch (error) {
      console.error('Error fetching popup ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Mark as shown today
    localStorage.setItem('naramakna_popup_shown', new Date().toDateString());
    onClose?.();
  };

  const handleAdClick = () => {
    if (adData?.target_url) {
      // Track click analytics here if needed
      window.open(adData.target_url, '_blank');
      handleClose();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Don't render if no ad data or not visible
  if (loading || !adData || !isVisible) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        {/* Popup Container */}
        <div 
          className="relative bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-2 transition-all duration-200"
            aria-label="Tutup iklan"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Ad Content */}
          <div className="relative">
            {/* Loading State */}
            {!imageLoaded && (
              <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Ad Image */}
            <img
              src={adData.image_url}
              alt={adData.title}
              className={`w-full cursor-pointer transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
              }`}
              style={{ aspectRatio: '3/4', objectFit: 'cover' }}
              onClick={handleAdClick}
              onLoad={handleImageLoad}
              onError={() => {
                console.error('Failed to load popup ad image');
                handleClose();
              }}
            />

            {/* Ad Title Overlay (if needed) */}
            {adData.title && imageLoaded && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                <h3 className="text-white font-semibold text-sm">{adData.title}</h3>
              </div>
            )}
          </div>

          {/* Optional CTA Button */}
          {adData.target_url && imageLoaded && (
            <div className="p-4 bg-gray-50">
              <button
                onClick={handleAdClick}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                Lihat Penawaran
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
