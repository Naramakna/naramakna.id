import React, { useState, useRef, useEffect } from 'react';
import { tiktokUtils } from '../../../services/api/tiktok';
import type { TikTokVideo } from '../../../services/api/tiktok';
import { useVideoViewTracking } from '../../../hooks/useTikTok';

interface TikTokVideoCardProps {
  video: TikTokVideo;
  className?: string;
  showStats?: boolean;
  autoplay?: boolean;
}

export const TikTokVideoCard: React.FC<TikTokVideoCardProps> = ({
  video,
  className = '',
  showStats = true,
  autoplay = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasViewed, setHasViewed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { trackView } = useVideoViewTracking();

  // Track view when video starts playing
  useEffect(() => {
    if (isPlaying && !hasViewed) {
      setHasViewed(true);
      trackView(video.id, {
        device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop'
      });
    }
  }, [isPlaying, hasViewed, video.id, trackView]);

  // Handle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(currentTime);
      
      // Track view progress
      if (duration > 0) {
        const percentage = (currentTime / duration) * 100;
        
        // Track milestones (25%, 50%, 75%, 100%)
        if (percentage >= 25 && percentage < 50 && !hasViewed) {
          trackView(video.id, {
            view_duration: Math.floor(currentTime),
            view_percentage: 25,
            device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop'
          });
        }
      }
    }
  };

  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      const duration = videoRef.current.duration;
      trackView(video.id, {
        view_duration: Math.floor(duration),
        view_percentage: 100,
        device_type: window.innerWidth <= 768 ? 'mobile' : 'desktop'
      });
    }
  };

  // Format hashtags
  const hashtags = typeof video.hashtags === 'string' 
    ? JSON.parse(video.hashtags || '[]') 
    : video.hashtags || [];

  // Calculate engagement rate
  const engagementRate = tiktokUtils.calculateEngagementRate(video);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-[9/16] bg-black">
        {video.video_url ? (
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.cover_image_url}
            className="w-full h-full object-cover"
            playsInline
            muted={autoplay}
            autoPlay={autoplay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnd}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        ) : video.cover_image_url ? (
          <img
            src={video.cover_image_url}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📱</div>
              <p className="text-sm">TikTok Video</p>
            </div>
          </div>
        )}

        {/* Play/Pause Overlay */}
        {video.video_url && (
          <div
            onClick={togglePlayPause}
            className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black bg-opacity-0 hover:bg-opacity-20 transition-all"
          >
            {!isPlaying && (
              <div className="bg-black bg-opacity-60 rounded-full p-3">
                <svg
                  className="w-8 h-8 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8 5v10l7-5z" />
                </svg>
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {tiktokUtils.formatDuration(video.duration)}
          </div>
        )}

        {/* TikTok Logo */}
        <div className="absolute top-2 left-2">
          <div className="bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            TikTok
          </div>
        </div>

        {/* Source Badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-xs px-2 py-1 rounded font-medium ${
            video.source === 'uploaded' ? 'bg-blue-500 text-white' :
            video.source === 'synced' ? 'bg-purple-500 text-white' :
            'bg-gray-500 text-white'
          }`}>
            {video.source === 'uploaded' ? '📤' : 
             video.source === 'synced' ? '🔄' : '📝'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Username */}
        {video.tiktok_username && (
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-900">
              @{video.tiktok_username}
            </span>
          </div>
        )}

        {/* Title */}
        {video.title && (
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {video.title}
          </h3>
        )}

        {/* Description */}
        {video.description && (
          <p className="text-xs text-gray-600 mb-3 line-clamp-3">
            {video.description}
          </p>
        )}

        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {hashtags.slice(0, 3).map((hashtag: string, index: number) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
              >
                {hashtag}
              </span>
            ))}
            {hashtags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{hashtags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>{tiktokUtils.formatViewCount(video.tiktok_view_count)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>❤️</span>
                <span>{tiktokUtils.formatViewCount(video.tiktok_like_count)}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <span>💬</span>
                <span>{tiktokUtils.formatViewCount(video.tiktok_comment_count)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📈</span>
                <span>{engagementRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          {/* View on TikTok */}
          {video.share_url && (
            <a
              href={video.share_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-black text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              View on TikTok
            </a>
          )}

          {/* Local Views */}
          <div className="text-xs text-gray-500">
            {video.local_view_count} local views
          </div>
        </div>

        {/* Date */}
        <div className="text-xs text-gray-400 mt-2">
          {video.tiktok_created_at 
            ? new Date(video.tiktok_created_at).toLocaleDateString()
            : new Date(video.created_at).toLocaleDateString()
          }
        </div>
      </div>
    </div>
  );
};
