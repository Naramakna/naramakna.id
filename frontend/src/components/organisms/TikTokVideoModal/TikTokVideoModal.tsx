import React, { useEffect } from 'react';
import type { TikTokVideo } from '../../../services/api/tiktok';
import { useAnalytics } from '../../../hooks/useAnalytics';
import IconLogo from '../../../assets/icons/IconLogo.png';

interface TikTokVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: TikTokVideo | null;
}

export const TikTokVideoModal: React.FC<TikTokVideoModalProps> = ({
  isOpen,
  onClose,
  video
}) => {
  const { trackVideoPlay } = useAnalytics();
  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Track video play when modal opens
  useEffect(() => {
    if (isOpen && video) {
      trackVideoPlay({
        title: video.title || video.description || 'TikTok Video',
        videoId: video.tiktok_video_id || video.id,
        platform: 'tiktok',
        duration: video.duration
      });
    }
  }, [isOpen, video, trackVideoPlay]);

  if (!isOpen || !video) return null;

  // Extract video ID from share_url for embed
  const getVideoId = (shareUrl: string, videoIdFromDB?: string) => {
    // If we have tiktok_video_id from database, use that
    if (videoIdFromDB && videoIdFromDB.match(/^\d+$/)) {
      return videoIdFromDB;
    }
    
    try {
      const url = new URL(shareUrl);
      // Extract from real TikTok URL: /video/7539079460159556869
      const videoMatch = url.pathname.match(/\/video\/(\d+)/);
      if (videoMatch) {
        return videoMatch[1];
      }
      
      // Fallback: try last path segment if it's numeric
      const pathSegments = url.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment.match(/^\d+$/)) {
        return lastSegment;
      }
    } catch {
      // If URL parsing fails, return null
    }
    return null;
  };

  const videoId = video.share_url ? getVideoId(video.share_url, video.tiktok_video_id) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <img 
                src={IconLogo} 
                alt="Logo" 
                className="w-5 h-5 object-contain"
              />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {video.title || video.description || 'Video TikTok'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Player/Embed */}
            <div className="space-y-4">
              {videoId ? (
                <div className="relative aspect-[9/16] bg-black rounded-lg overflow-hidden">
                  {/* TikTok Embed */}
                  <iframe
                    src={`https://www.tiktok.com/embed/v2/${videoId}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                /* Fallback to cover image */
                <div className="relative aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={video.cover_image_url || '/placeholder-video.jpg'}
                    alt={video.title || 'Video TikTok'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <a
                      href={video.share_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Buka di TikTok
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Detail Video</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {video.description || 'Tidak ada deskripsi tersedia.'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Views</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {video.tiktok_view_count?.toLocaleString() || '—'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Likes</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {video.tiktok_like_count?.toLocaleString() || '—'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Comments</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {video.tiktok_comment_count?.toLocaleString() || '—'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Shares</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {video.tiktok_share_count?.toLocaleString() || '—'}
                  </div>
                </div>
              </div>

              {/* Duration */}
              {video.duration && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Duration</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <a
                  href={video.share_url.includes('vm.tiktok.com') 
                    ? `https://www.tiktok.com/@naramakna.id/video/${video.tiktok_video_id}` 
                    : video.share_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Buka di TikTok
                </a>
                <button
                  onClick={() => {
                    if (video.share_url) {
                      // Ensure we copy the real TikTok URL, not vm.tiktok.com
                      const realUrl = video.share_url.includes('vm.tiktok.com') 
                        ? `https://www.tiktok.com/@naramakna.id/video/${video.tiktok_video_id}` 
                        : video.share_url;
                      
                      navigator.clipboard.writeText(realUrl);
                      // Simple feedback - you might want to add a toast notification
                      alert('Link TikTok berhasil disalin!');
                    }
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};