import React from 'react';

interface TrendingItemProps {
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  className?: string;
}

export const TrendingItem: React.FC<TrendingItemProps> = ({
  title,
  source,
  timeAgo,
  imageSrc,
  href,
  className = ''
}) => {
  const handleClick = () => {
    if (href) {
      window.location.href = href;
    }
  };

  return (
    <div className={`flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200 ${className}`} onClick={handleClick}>
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-xs">No Image</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 text-left">
          {title}
        </h3>
        <div className="flex items-center space-x-2 text-left">
          <span className="text-xs text-gray-600">{source}</span>
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}; 