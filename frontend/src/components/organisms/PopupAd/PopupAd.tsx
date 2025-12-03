import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../../config/api';

interface PopupAdData {
  id: number;
  campaign_name: string;
  media_type: 'image' | 'gif' | 'video' | 'google_adsense';
  image_url?: string;
  media_url?: string;
  target_url?: string;
  google_ads_code?: string;
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
  const [adsenseLoaded, setAdsenseLoaded] = useState(false);

  // Check if ads are disabled
  const adsDisabled = import.meta.env.VITE_DISABLE_ADS === 'true';

  useEffect(() => {
    if (!adsDisabled) {
      checkAndShowPopupAd();
    } else {
      setLoading(false);
    }
  }, [adsDisabled]);

  // Load AdSense when popup is visible and ad is AdSense type
  useEffect(() => {
    if (isVisible && adData?.media_type === 'google_adsense' && !adsenseLoaded) {
      // Give a small delay for DOM to be ready
      setTimeout(() => {
        try {
          // @ts-ignore
          if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
            const adElements = document.querySelectorAll('.adsbygoogle[data-ad-status="unfilled"]');
            adElements.forEach((el) => {
              // @ts-ignore
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            });
            setAdsenseLoaded(true);
          }
        } catch (err) {
          console.error('AdSense error in popup:', err);
        }
      }, 300);
    }
  }, [isVisible, adData, adsenseLoaded]);

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
      const response = await fetch(buildApiUrl('ads/popup-active'));
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
    if (adData?.target_url && adData.target_url !== 'google-adsense') {
      // Track click analytics here if needed
      window.open(adData.target_url, '_blank');
      handleClose();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Get the actual image URL
  const getImageUrl = () => {
    return adData?.image_url || adData?.media_url || '';
  };

  // Check if this is a custom image ad (not AdSense)
  const isCustomImageAd = () => {
    return adData?.media_type !== 'google_adsense' && getImageUrl();
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
            {/* Custom Image Ad */}
            {isCustomImageAd() && (
              <>
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
                  src={getImageUrl()}
                  alt={adData.campaign_name}
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
                {adData.campaign_name && imageLoaded && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                    <h3 className="text-white font-semibold text-sm">{adData.campaign_name}</h3>
                  </div>
                )}
              </>
            )}

            {/* Google AdSense Ad */}
            {adData.media_type === 'google_adsense' && (
              <div className="p-4 min-h-[500px] flex items-center justify-center bg-gray-50">
                <ins
                  className="adsbygoogle"
                  style={{ display: 'block', minHeight: '450px' }}
                  data-ad-client="ca-pub-5027382595607261"
                  data-ad-slot="7842839474"
                  data-ad-format="auto"
                  data-full-width-responsive="true"
                ></ins>
              </div>
            )}
          </div>

          {/* Optional CTA Button - Only for custom image ads */}
          {isCustomImageAd() && adData.target_url && adData.target_url !== 'google-adsense' && imageLoaded && (
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
