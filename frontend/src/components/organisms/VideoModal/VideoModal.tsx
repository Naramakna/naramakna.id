import React, { useState, useRef, useEffect } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videos: Array<{
    id: string;
    title: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    source: string;
    timeAgo: string;
  }>;
  initialVideoIndex?: number;
  className?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videos,
  initialVideoIndex = 0,
  className = ''
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(initialVideoIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(videos[initialVideoIndex]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Update current video when index changes
  useEffect(() => {
    if (videos[currentVideoIndex]) {
      setCurrentVideo(videos[currentVideoIndex]);
      setIsPlaying(false); // Reset play state when video changes
    }
  }, [currentVideoIndex, videos]);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentVideoIndex(initialVideoIndex);
      setIsPlaying(false);
    }
  }, [isOpen, initialVideoIndex]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation for desktop
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft') {
        handlePreviousVideo();
      } else if (e.key === 'ArrowRight') {
        handleNextVideo();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentVideoIndex]);

  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleCloseModal = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 ${className}`}
      onClick={handleBackdropClick}
    >
      {/* Mobile Layout - Full Screen */}
      <div 
        className="md:hidden w-full h-full bg-black relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Account Info di atas */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            {/* Account Info */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">U</span>
              </div>
              <div>
                <div className="text-white font-semibold text-base">{currentVideo.source}</div>
                <div className="text-gray-300 text-sm">{currentVideo.timeAgo}</div>
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Player - Full Screen */}
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            key={currentVideo.id}
            className="w-full h-full object-cover"
            autoPlay={false}
            muted={isMuted}
            loop
            playsInline
            poster={currentVideo.thumbnailUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={currentVideo.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Play/Pause Button Overlay - Selalu Tampil */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-20 h-20 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors opacity-80 hover:opacity-100"
            >
              {isPlaying ? (
                // Pause Icon
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                // Play Icon
                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Buttons - Mobile */}
          {currentVideoIndex > 0 && (
            <button
              onClick={handlePreviousVideo}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          
          {currentVideoIndex < videos.length - 1 && (
            <button
              onClick={handleNextVideo}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Video Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-end justify-between">
              {/* Video Info */}
              <div className="text-white flex-1 mr-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{currentVideo.title}</h3>
                {currentVideo.description && (
                  <p className="text-sm opacity-90">{currentVideo.description}</p>
                )}
              </div>

              {/* Mute Button */}
              <button
                onClick={toggleMute}
                className="w-12 h-12 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                {isMuted ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Phone Size Portrait */}
      <div className="hidden md:flex items-center justify-center w-full h-full relative">
        {/* Left Navigation Button - Outside */}
        {currentVideoIndex > 0 && (
          <button
            onClick={handlePreviousVideo}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        
        {/* Right Navigation Button - Outside */}
        {currentVideoIndex < videos.length - 1 && (
          <button
            onClick={handleNextVideo}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-black/70 hover:bg-black/90 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Main Video Container - Phone Size */}
        <div 
          className="relative w-80 h-[640px] bg-black rounded-xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <video
            ref={videoRef}
            key={currentVideo.id}
            className="w-full h-full object-cover"
            autoPlay={false}
            muted={isMuted}
            loop
            playsInline
            poster={currentVideo.thumbnailUrl}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={currentVideo.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Play/Pause Button Overlay - Selalu Tampil */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors opacity-80 hover:opacity-100"
            >
              {isPlaying ? (
                // Pause Icon
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                // Play Icon
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Close Button - Desktop */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleCloseModal}
              className="w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mute Button - Desktop */}
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={toggleMute}
              className="w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
            >
              {isMuted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          </div>

          {/* Account Info - Desktop Top */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">U</span>
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{currentVideo.source}</div>
                <div className="text-gray-300 text-xs">{currentVideo.timeAgo}</div>
              </div>
            </div>
          </div>

          {/* Video Info Overlay - Desktop Bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pb-16">
            <div className="text-white">
              <h3 className="text-base font-semibold mb-2 line-clamp-2">{currentVideo.title}</h3>
              {currentVideo.description && (
                <p className="text-sm opacity-90 line-clamp-3">{currentVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};