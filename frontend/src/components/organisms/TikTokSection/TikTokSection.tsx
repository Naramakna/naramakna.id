import React, { useState, useEffect } from 'react';
import { TikTokVideoCard } from '../../molecules/TikTokVideoCard/TikTokVideoCard';
import { useTikTokVideos } from '../../../hooks/useTikTok';

interface TikTokSectionProps {
  className?: string;
  limit?: number;
  showTitle?: boolean;
  category?: string;
}

export const TikTokSection: React.FC<TikTokSectionProps> = ({
  className = '',
  limit = 8,
  showTitle = true,
  category
}) => {
  const [visibleCount, setVisibleCount] = useState(limit);
  const { 
    videos, 
    loading, 
    error, 
    fetchVideos 
  } = useTikTokVideos(false); // Public mode

  const [filteredVideos, setFilteredVideos] = useState(videos);

  // Filter videos by category if specified
  useEffect(() => {
    if (category) {
      const filtered = videos.filter(video => 
        video.categories?.toLowerCase().includes(category.toLowerCase())
      );
      setFilteredVideos(filtered);
    } else {
      setFilteredVideos(videos);
    }
  }, [videos, category]);

  // Load more videos
  const loadMore = () => {
    setVisibleCount(prev => prev + limit);
  };

  // Show less videos
  const showLess = () => {
    setVisibleCount(limit);
  };

  const displayedVideos = filteredVideos.slice(0, visibleCount);
  const hasMore = visibleCount < filteredVideos.length;
  const canShowLess = visibleCount > limit;

  if (loading && videos.length === 0) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-black rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">TikTok Videos</h2>
              </div>
            </div>
          )}
          
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-2 text-gray-600">Loading videos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-black rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">TikTok Videos</h2>
              </div>
            </div>
          )}
          
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error loading videos: {error}</p>
            <button
              onClick={() => fetchVideos()}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (filteredVideos.length === 0) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {showTitle && (
            <div className="flex items-center mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-black rounded-full"></div>
                <h2 className="text-xl font-semibold text-gray-900">TikTok Videos</h2>
              </div>
            </div>
          )}
          
          <div className="text-center py-8">
            <p className="text-gray-500">No TikTok videos available at the moment</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {showTitle && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-black rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                TikTok Videos {category && `- ${category}`}
              </h2>
            </div>
            <div className="text-sm text-gray-500">
              Showing {displayedVideos.length} of {filteredVideos.length} videos
            </div>
          </div>
        )}

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedVideos.map((video) => (
            <TikTokVideoCard
              key={video.id}
              video={video}
            />
          ))}
        </div>

        {/* Load More / Show Less Controls */}
        {(hasMore || canShowLess) && (
          <div className="flex justify-center space-x-4 mt-8">
            {canShowLess && (
              <button
                onClick={showLess}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Show Less
              </button>
            )}
            {hasMore && (
              <button
                onClick={loadMore}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Load More Videos
              </button>
            )}
          </div>
        )}

        {/* Loading indicator for load more */}
        {loading && videos.length > 0 && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
            <span className="ml-2 text-gray-600 text-sm">Loading more videos...</span>
          </div>
        )}
      </div>
    </div>
  );
};

