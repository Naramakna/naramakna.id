import React from 'react';

interface TrendingItemProps {
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  className?: string;
  views?: number;
}

export const TrendingItem: React.FC<TrendingItemProps> = ({
  title,
  source,
  timeAgo,
  imageSrc,
  href,
  className = '',
  views
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
          <>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-xs text-gray-500">{(views || Math.floor(Math.random() * 1800) + 120).toLocaleString()}</span>
          </>
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
      </div>
    </div>
  );
}; 