import React from 'react';
import { useTikTok } from '../../../hooks/useTikTok';
import { LoadingSpinner } from '../../atoms/LoadingSpinner/LoadingSpinner';
import type { TikTokContent } from '../../../types/tiktok';

interface TikTokSectionProps {
  className?: string;
  limit?: number;
  showHeader?: boolean;
  title?: string;
  layout?: 'grid' | 'list' | 'carousel';
}

export const TikTokSection: React.FC<TikTokSectionProps> = ({
  className = '',
  limit = 6,
  showHeader = true,
  title = '🎬 Trending TikTok',
  layout = 'grid'
}) => {
  const { content, isLoading, error } = useTikTok({
    autoSync: false,
    syncInterval: 0
  });

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        {showHeader && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        {showHeader && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm">Failed to load TikTok content</p>
          </div>
        </div>
      </div>
    );
  }

  if (!content || content.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        {showHeader && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
        )}
        <div className="p-6">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
              </svg>
            </div>
            <p className="text-sm">No TikTok content available</p>
            <p className="text-xs text-gray-400 mt-1">Connect your TikTok account to display videos</p>
          </div>
        </div>
      </div>
    );
  }

  const displayContent = content.slice(0, limit);

  const renderGridLayout = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayContent.map((item) => (
        <div key={item.ID} className="group">
          <a 
            href={item.metadata?.source_url || item.guid} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-[9/16] bg-gray-100">
              {item.metadata?.tiktok_cover_url ? (
                <img 
                  src={item.metadata.tiktok_cover_url} 
                  alt={item.post_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-12 h-12 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
                  </svg>
                </div>
              )}
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-6 h-6 text-pink-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* TikTok Logo */}
              <div className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
                </svg>
              </div>

              {/* Video Stats */}
              {item.metadata && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center justify-between text-white text-xs">
                    {item.metadata.tiktok_play_count && parseInt(item.metadata.tiktok_play_count) > 0 && (
                      <div className="flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                        </svg>
                        <span>{parseInt(item.metadata.tiktok_play_count).toLocaleString()}</span>
                      </div>
                    )}
                    {item.metadata.tiktok_like_count && parseInt(item.metadata.tiktok_like_count) > 0 && (
                      <div className="flex items-center space-x-1 bg-black bg-opacity-50 px-2 py-1 rounded">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"/>
                        </svg>
                        <span>{parseInt(item.metadata.tiktok_like_count).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                {item.post_title || 'TikTok Video'}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center space-x-1">
                  <span>@{item.metadata?.tiktok_author_username || 'TikTok'}</span>
                </span>
                <span>{new Date(item.post_date).toLocaleDateString()}</span>
              </div>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

  const renderListLayout = () => (
    <div className="space-y-3">
      {displayContent.map((item) => (
        <a 
          key={item.ID}
          href={item.metadata?.source_url || item.guid} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
        >
          {/* Thumbnail */}
          <div className="flex-shrink-0 w-16 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
            {item.metadata?.tiktok_cover_url ? (
              <img 
                src={item.metadata.tiktok_cover_url} 
                alt={item.post_title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.510v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
                </svg>
              </div>
            )}
            
            {/* TikTok Badge */}
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {item.post_title || 'TikTok Video'}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span>@{item.metadata?.tiktok_author_username || 'TikTok'}</span>
              </span>
              <span>•</span>
              <span>{new Date(item.post_date).toLocaleDateString()}</span>
              {item.metadata?.tiktok_play_count && parseInt(item.metadata.tiktok_play_count) > 0 && (
                <>
                  <span>•</span>
                  <span>{parseInt(item.metadata.tiktok_play_count).toLocaleString()} views</span>
                </>
              )}
            </div>
          </div>
        </a>
      ))}
    </div>
  );

  const renderCarouselLayout = () => (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {displayContent.map((item) => (
        <div key={item.ID} className="flex-shrink-0 w-40">
          <a 
            href={item.metadata?.source_url || item.guid} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            {/* Video Thumbnail */}
            <div className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden mb-2">
              {item.metadata?.tiktok_cover_url ? (
                <img 
                  src={item.metadata.tiktok_cover_url} 
                  alt={item.post_title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <svg className="w-8 h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
                  </svg>
                </div>
              )}

              {/* Play Button Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="w-10 h-10 bg-white bg-opacity-90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-5 h-5 text-pink-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>

              {/* TikTok Logo */}
              <div className="absolute top-2 right-2 w-5 h-5 bg-black bg-opacity-70 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-6.374 6.329 6.372 6.372 0 0012.744 0V9.313a8.243 8.243 0 004.861 1.548v-3.4a4.797 4.797 0 01-1.998-.775z"/>
                </svg>
              </div>
            </div>

            {/* Video Info */}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
              {item.post_title || 'TikTok Video'}
            </h3>
            <div className="text-xs text-gray-500">
              <span>@{item.metadata?.tiktok_author_username || 'TikTok'}</span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {showHeader && (
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {content.length > limit && (
              <a 
                href="#" 
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                View All ({content.length})
              </a>
            )}
          </div>
        </div>
      )}
      
      <div className="p-6">
        {layout === 'grid' && renderGridLayout()}
        {layout === 'list' && renderListLayout()}
        {layout === 'carousel' && renderCarouselLayout()}
      </div>
    </div>
  );
};
