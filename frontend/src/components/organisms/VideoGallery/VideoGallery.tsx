// Komponen gallery untuk display video grid - REAL TIKTOK DATA ONLY
import React, { useState } from 'react';
import { VideoItemGallery } from '../../atoms/VideoItemGallery';
import { useTikTokVideos } from '../../../hooks/useTikTok';
import { tiktokUtils } from '../../../services/api/tiktok';
import type { TikTokVideo } from '../../../services/api/tiktok';
import { TikTokVideoModal } from '../TikTokVideoModal/TikTokVideoModal';

export const VideoGallery: React.FC = () => {
  const [selectedTikTokVideo, setSelectedTikTokVideo] = useState<TikTokVideo | null>(null);
  const [isTikTokModalOpen, setIsTikTokModalOpen] = useState(false);
  
  // Use TikTok videos hook
  const { 
    videos: tiktokVideos, 
    loading, 
    error,
    pagination
  } = useTikTokVideos();

  // Handler untuk membuka modal TikTok
  const openTikTokModal = (video: TikTokVideo) => {
    setSelectedTikTokVideo(video);
    setIsTikTokModalOpen(true);
  };

  const closeTikTokModal = () => {
    setIsTikTokModalOpen(false);
    setSelectedTikTokVideo(null);
  };

  // Calculate if there are more videos to load
  const hasMore = pagination.total > tiktokVideos.length;

  return (
    <div className="w-full">
      {/* Header untuk Real TikTok Videos */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Video TikTok @naramakna.id
        </h2>
        <p className="text-gray-600">
          {tiktokVideos.length} video real dari akun TikTok resmi
        </p>
      </div>

      {/* Error State for TikTok */}
      {error && (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-800 text-sm">
              Gagal memuat video TikTok: {error}
            </p>
          </div>
        </div>
      )}

      {/* TikTok Videos Grid - Real Data Only */}
      {tiktokVideos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {tiktokVideos.map((video, index) => (
            <div key={video.id} className="flex-shrink-0">
              <VideoItemGallery
                id={String(video.id)}
                title={video.title || video.description || 'Video TikTok'}
                source="naramakna.id"
                duration={tiktokUtils.formatDuration(video.duration || 0)}
                tag="TIKTOK"
                imageSrc={video.cover_image_url || 'https://picsum.photos/400/225?random=' + index}
                onClick={() => openTikTokModal(video)}
              />
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Belum Ada Video TikTok
            </h3>
            <p className="text-gray-500 text-sm">
              Video TikTok akan muncul di sini setelah akun terhubung dan sync data
            </p>
          </div>
        </div>
      )}
      
      {/* Loading Animation */}
      {loading && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="text-gray-600 text-sm">
              Memuat video TikTok...
            </span>
          </div>
        </div>
      )}
      
      {/* No More Data Message */}
      {!hasMore && !loading && tiktokVideos.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">Semua video TikTok telah ditampilkan</p>
        </div>
      )}

      {/* TikTok Video Modal */}
      <TikTokVideoModal
        isOpen={isTikTokModalOpen}
        onClose={closeTikTokModal}
        video={selectedTikTokVideo}
      />
    </div>
  );
};