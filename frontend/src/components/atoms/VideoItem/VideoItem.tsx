import React from 'react';

interface VideoItemProps {
  id: string;
  title: string;
  source: string;
  duration: string;
  tag?: string;
  imageSrc?: string;
  href?: string;
  className?: string;
}

export const VideoItem: React.FC<VideoItemProps> = ({
  id,
  title,
  source,
  duration,
  tag,
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
    <div className={`relative w-64 h-96 bg-gray-200 rounded-lg overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 ${className}`} onClick={handleClick}>
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
              <div className="text-xs">Video Image</div>
            </div>
          </div>
        )}
      </div>

      {/* Top Metadata */}
      <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start">
        {tag && (
          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">
            {tag}
          </div>
        )}
        <div className="flex items-center space-x-1">
                          <span className="text-white text-xs font-medium">naramakna</span>
        </div>
      </div>

      {/* Bottom Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
        <h3 className="text-white text-sm font-medium mb-2 line-clamp-3">
          {title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-white text-xs">{source}</span>
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="text-white text-xs">{duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}; 