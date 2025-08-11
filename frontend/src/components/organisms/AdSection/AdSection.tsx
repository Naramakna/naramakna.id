import React, { useMemo, useState, useEffect } from 'react';
import { AdBanner } from '../../molecules/AdBanner';
import { useAds } from '../../../contexts/AdsContext';
import type { Advertisement } from '../../../services/api';

interface AdSectionProps {
  className?: string;
  position?: 'top' | 'bottom';
  imageSrc?: string;
  altText?: string;
  href?: string;
  isPlaceholder?: boolean;
  size?: 'header' | 'regular' | 'sidebar';
  placement?: string; // Override automatic placement detection
  rotationInterval?: number; // Custom rotation timing in milliseconds (default: 5000)
}

export const AdSection: React.FC<AdSectionProps> = ({
  className = '',
  imageSrc,
  altText,
  href,
  isPlaceholder,
  size = 'regular',
  placement,
  rotationInterval = 5000 // Default 5 seconds
}) => {
  const { getAdsForPlacement, trackClick } = useAds();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);

  // Determine placement based on size if not explicitly provided
  const adPlacement = placement || (size === 'header' ? 'header' : size === 'sidebar' ? 'sidebar' : 'regular');

  // Get ads for this placement
  const availableAds = useMemo(() => {
    const ads = getAdsForPlacement(adPlacement);
    // console.log(`🎯 AdSection: Available ads for ${adPlacement}:`, ads);
    return ads;
  }, [getAdsForPlacement, adPlacement]);

  // Filter active ads
  const activeAds = useMemo(() => {
    return availableAds.filter((ad: Advertisement) => {
      const now = new Date();
      const endDate = new Date(ad.end_date);
      const startDate = new Date(ad.start_date);
      const isActive = ad.status === 'active' && startDate <= now && endDate >= now;
      return isActive;
    });
  }, [availableAds]);

  // Progress bar effect
  useEffect(() => {
    if (activeAds.length <= 1) return;

    const progressInterval = setInterval(() => {
      setProgress(prev => (prev + 1) % 100);
    }, rotationInterval / 100);

    return () => clearInterval(progressInterval);
  }, [rotationInterval, activeAds.length]);

  // Auto-rotation effect with smooth transitions
  useEffect(() => {
    if (activeAds.length <= 1) return; // No rotation if only 1 or 0 ads

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Short delay for fade out effect
      setTimeout(() => {
        setCurrentAdIndex(prevIndex => (prevIndex + 1) % activeAds.length);
        setProgress(0); // Reset progress bar
      }, 350); // Half of transition duration
      
      // Reset transition state
      setTimeout(() => {
        setIsTransitioning(false);
      }, 700); // Full transition duration
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [activeAds.length, rotationInterval]);

  // Reset index if ads change
  useEffect(() => {
    setCurrentAdIndex(0);
  }, [activeAds]);

  // Select current ad to display
  const selectedAd = useMemo(() => {
    if (activeAds.length === 0) return null;
    const ad = activeAds[currentAdIndex];
    if (ad) {
      console.log(`🎯 AdSection: Showing ad ${currentAdIndex + 1}/${activeAds.length} for ${adPlacement}:`, ad.campaign_name);
    }
    return ad;
  }, [activeAds, currentAdIndex, adPlacement]);

  // Determine if we should show placeholder
  const shouldShowPlaceholder = isPlaceholder !== undefined ? isPlaceholder : !selectedAd;

  const handleAdClick = (adId: string) => {
    trackClick(adId);
  };

  return (
    <div className={`w-full flex justify-center py-4 pb-8 relative ${className}`}>
      <div className="relative w-full flex justify-center">
        <AdBanner
          imageSrc={imageSrc}
          altText={altText}
          href={href}
          isPlaceholder={shouldShowPlaceholder}
          size={size}
          advertisement={selectedAd || undefined}
          onAdClick={handleAdClick}
          isVisible={!isTransitioning}
          showTransition={true}
        />
        
        {/* Progress Bar & Rotation Indicator */}
        {activeAds.length > 1 && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
            {/* Progress Bar */}
            <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-500 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Dots Indicator */}
            <div className="flex justify-center mt-2 space-x-1">
              {activeAds.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentAdIndex 
                      ? 'bg-yellow-500 scale-125' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  onClick={() => {
                    setCurrentAdIndex(index);
                    setProgress(0);
                  }}
                />
              ))}
            </div>
            
            {/* Ads Counter */}
            <div className="text-center mt-1">
              <span className="text-xs text-gray-500">
                {currentAdIndex + 1}/{activeAds.length} • {adPlacement}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 