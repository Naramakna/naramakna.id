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
        return `w-full max-w-[970px] h-[250px] md:w-[970px] ${baseClasses} ${visibilityClasses}`;
      case 'regular':
      default:
        return `w-full max-w-[728px] h-[90px] md:w-[728px] ${baseClasses} ${visibilityClasses}`;
    }
  };

  const getPlaceholderText = () => {
    switch (size) {
      case 'header':
        return '970 x 250';
      case 'regular':
      default:
        return '728 x 90';
    }
  };

  // Render placeholder if no real ad data
  if (!hasRealAd || isPlaceholder) {
    return (
      <div className={`${getSizeClasses()} bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 font-medium">Advertisement Banner</div>
          <div className="text-gray-400 text-sm">{getPlaceholderText()}</div>
          <div className="text-gray-400 text-xs mt-1">
            Placeholder: {adMediaUrl || 'No image specified'}
          </div>
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
            className="w-full h-full object-cover"
            loading="lazy"
          />
        );
      
      case 'video':
        return (
          <video 
            src={adMediaUrl}
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop
            playsInline
          />
        );
      
      case 'html':
        return (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: advertisement?.ad_content || '' }}
          />
        );
      
      case 'google_ads':
        return (
          <div 
            className="w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: advertisement?.google_ads_code || advertisement?.ad_content || '' }}
          />
        );
      
      default:
        return (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
            Unsupported media type: {adMediaType}
          </div>
        );
    }
  };

  return (
    <div className={`${getSizeClasses()} relative ${className}`}>
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
      
      {/* Ad attribution */}
      {hasRealAd && (
        <div className="absolute top-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded z-10">
          Ad
        </div>
      )}
    </div>
  );
};
