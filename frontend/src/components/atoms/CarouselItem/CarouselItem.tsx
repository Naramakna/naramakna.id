import React from 'react';

interface CarouselItemProps {
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  isFeatured?: boolean;
  className?: string;
}

export const CarouselItem: React.FC<CarouselItemProps> = ({
  title,
  source,
  timeAgo,
  imageSrc,
  href,
  isFeatured = false,
  className = ''
}) => {
  // Debug removed - production ready

  const handleClick = () => {
    if (href) {
      window.location.href = href;
    }
  };

  if (isFeatured) {
    return (
      <div className={`relative w-full h-64 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 ${className}`} onClick={handleClick}>
        {/* Background Image or Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-400 to-gray-600">
          {imageSrc ? (
            <img 
              src={imageSrc} 
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm opacity-75">Featured Image</div>
              </div>
            </div>
          )}
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-6">
          <h3 className="text-white text-lg font-semibold mb-2 line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-white text-sm">{source}</span>
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-sm opacity-75">{timeAgo}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 ${className}`} onClick={handleClick}>
      {/* Background Image or Placeholder */}
      <div className="absolute inset-0">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs">Image</div>
            </div>
          </div>
        )}
      </div>

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
        <h3 className="text-white text-sm font-medium mb-2 line-clamp-2">
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-white text-xs">{source}</span>
          <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-white text-xs opacity-75">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}; 