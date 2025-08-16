// Komponen untuk display banner iklan
import React from 'react';
import type { Advertisement } from '../../../services/api';

interface AdBannerProps {
  className?: string;
  imageSrc?: string;
  altText?: string;
  href?: string;
  isPlaceholder?: boolean;
  size?: 'header' | 'regular'; // header: 970x250, regular: 728x90
  // New props for advanced ads
  advertisement?: Advertisement;
  onAdClick?: (adId: string) => void;
  // Animation props
  isVisible?: boolean;
  showTransition?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  className = '',
  imageSrc,
  altText = 'Advertisement',
  href,
  isPlaceholder = true,
  size = 'regular',
  advertisement,
  onAdClick,
  isVisible = true,
  showTransition = true
}) => {
  // Check if we have real advertisement data
  const hasRealAd = advertisement && !isPlaceholder;
  const adMediaUrl = advertisement?.media_url || advertisement?.image_url || imageSrc;
  const adTargetUrl = advertisement?.target_url || href;
  const adMediaType = advertisement?.media_type || 'image';

  const handleClick = () => {
    if (hasRealAd && advertisement && onAdClick) {
      onAdClick(advertisement.id);
    }
    
    if (adTargetUrl) {
      window.open(adTargetUrl, '_blank');
    }
  };

  const getSizeClasses = () => {
    const baseClasses = showTransition 
      ? 'transition-all duration-700 ease-in-out transform hover:scale-105 hover:shadow-lg' 
      : '';
    const visibilityClasses = isVisible 
      ? 'opacity-100 scale-100' 
      : 'opacity-0 scale-95';
    
    switch (size) {
      case 'header':
        // Mobile: w-[90%] h-[120px], Tablet: w-[95%] h-[150px], Desktop: max-w-[970px] h-[250px]
        return `w-[90%] sm:w-[95%] md:w-full lg:w-full xl:max-w-[970px] h-[120px] sm:h-[150px] md:h-[180px] lg:h-[200px] xl:h-[250px] ${baseClasses} ${visibilityClasses}`;
      case 'regular':
      default:
        // Mobile: w-[90%] h-[60px], Tablet: w-[95%] h-[70px], Desktop: max-w-[728px] h-[90px]
        return `w-[90%] sm:w-[95%] md:w-full lg:max-w-[728px] h-[60px] sm:h-[70px] md:h-[80px] lg:h-[90px] ${baseClasses} ${visibilityClasses}`;
    }
  };

  const getPlaceholderText = () => {
    switch (size) {
      case 'header':
        return {
          mobile: '90% x 120px',
          tablet: '95% x 180px',
          desktop: '970 x 250px'
        };
      case 'regular':
      default:
        return {
          mobile: '90% x 60px',
          tablet: '95% x 80px',
          desktop: '728 x 90px'
        };
    }
  };

  // Render placeholder if no real ad data
  if (!hasRealAd || isPlaceholder) {
    const placeholderSizes = getPlaceholderText();
    
    return (
      <div className={`${getSizeClasses()} bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center ${className}`}>
        <div className="text-center px-4">
          <div className="text-gray-500 font-medium text-sm sm:text-base">Advertisement Banner</div>
          
          {/* Responsive size display */}
          <div className="text-gray-400 text-xs sm:text-sm">
            <span className="block sm:hidden">{placeholderSizes.mobile}</span>
            <span className="hidden sm:block lg:hidden">{placeholderSizes.tablet}</span>
            <span className="hidden lg:block">{placeholderSizes.desktop}</span>
          </div>
          
          {/* Image source info */}
          {adMediaUrl && (
            <div className="text-gray-400 text-xs mt-1 truncate max-w-full">
              Placeholder: {adMediaUrl}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render media content based on type
  const renderMediaContent = () => {
    switch (adMediaType) {
      case 'image':
      case 'gif':
        return (
          <img 
            src={adMediaUrl} 
            alt={altText}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
        );
      
      case 'video':
        return (
          <video 
            src={adMediaUrl}
            className="w-full h-full object-cover rounded-lg"
            autoPlay 
            muted 
            loop
            playsInline
          />
        );
      
      case 'html':
        return (
          <div 
            className="w-full h-full rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: advertisement?.ad_content || '' }}
          />
        );
      
      case 'google_ads':
        return (
          <div 
            className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden"
            dangerouslySetInnerHTML={{ __html: advertisement?.google_ads_code || advertisement?.ad_content || '' }}
          />
        );
      
      default:
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 rounded-lg">
            <div className="text-center">
              <div className="text-sm">Unsupported media type</div>
              <div className="text-xs mt-1">{adMediaType}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`${getSizeClasses()} relative rounded-lg overflow-hidden shadow-sm ${className}`}>
      {adTargetUrl ? (
        <a 
          href={adTargetUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block w-full h-full cursor-pointer"
        >
          {renderMediaContent()}
        </a>
      ) : (
        <div onClick={handleClick} className="w-full h-full cursor-pointer">
          {renderMediaContent()}
        </div>
      )}
      
      {/* Ad attribution - Responsive positioning */}
      {hasRealAd && (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded z-10">
          Ad
        </div>
      )}
      
      {/* Optional: Responsive loading indicator */}
      {!adMediaUrl && hasRealAd && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
        </div>
      )}
    </div>
  );
};