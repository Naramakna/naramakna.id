import React, { useState, useRef } from 'react';
import { VideoItem } from '../../atoms/VideoItem';
import { useYouTubeVideos } from '../../../hooks/useYouTube';
import { VideoModal } from '../VideoModal';
import type { YouTubeVideo } from '../../../services/api/youtube';

interface VideoData {
  id: string;
  title: string;
  source: string;
  duration: string;
  tag?: string;
  imageSrc?: string;
  href?: string;
}

interface VideoSectionProps {
  videos?: VideoData[];
  className?: string;
}

export const VideoSection: React.FC<VideoSectionProps> = ({
  videos = [],
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch YouTube videos
  const { videos: youtubeVideos, loading, error } = useYouTubeVideos(false);

  // Helper function to convert YouTube data to VideoData format
  const convertYouTubeToVideoData = (ytVideo: YouTubeVideo): VideoData => {
    // Format duration from seconds to MM:SS
    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return {
      id: ytVideo.id.toString(),
      title: ytVideo.title || 'Untitled Video',
      source: ytVideo.youtube_channel_name || 'naramaknaTV',
      duration: ytVideo.duration ? formatDuration(ytVideo.duration) : '00:00',
      tag: 'YOUTUBE VIDEO',
      imageSrc: ytVideo.thumbnail_url,
      href: `/video/${ytVideo.id}`
    };
  };

  // Convert YouTube videos to VideoData format
  const youtubeVideoData: VideoData[] = youtubeVideos.slice(0, 8).map(convertYouTubeToVideoData);

  // Dummy data untuk fallback when no YouTube videos or error
  const defaultVideos: VideoData[] = [
    {
      id: '1',
      title: 'Warga Jepara Tolak Pembangunan Peternakan Babi\nDitentang Keras Warga sampai MUI Keluarkan Fatwa Haram',
      source: 'naramaknaNEWS',
      duration: '01:09',
      tag: 'NEWS UPDATE'
    },
    {
      id: '2',
      title: 'REZA ARAP UNGKAP TANTANGAN TERBERAT SAAT DEBUT SEBAGAI SUTRADARA',
      source: 'naramaknaHITS',
      duration: '00:39',
      tag: 'NEWS UPDATE'
    },
    {
      id: '3',
      title: 'Komplotan Pemain Judol di DIY Ternak Akun buat Akali Bandar, Raup Puluhan Juta',
      source: 'naramaknaNEWS',
      duration: '00:28',
      tag: 'NEWS UPDATE'
    },
    {
      id: '4',
      title: 'Ada Masalah, KRL Bogor-Jakarta Kota Cuma sampai Stasiun Manggarai',
      source: 'naramaknaNEWS',
      duration: '00:30',
      tag: 'NEWS UPDATE'
    },
    {
      id: '5',
      title: 'Satu Juta Perempuan dan Anak Terjebak Kelaparan Kekerasan',
      source: 'naramaknaWOMAN',
      duration: '00:45',
      tag: 'WOMEN\'S UPDATE'
    }
  ];

  // Priority: props videos > YouTube API data > fallback dummy data
  let displayVideos: VideoData[];
  if (videos.length > 0) {
    displayVideos = videos;
  } else if (youtubeVideoData.length > 0) {
    displayVideos = youtubeVideoData;
  } else {
    displayVideos = defaultVideos;
  }

  // Convert VideoData to format yang dibutuhkan VideoModal
  const convertToModalVideos = (videos: VideoData[]) => {
    return videos.map((video, index) => ({
      id: video.id,
      title: video.title,
      description: `Video dari ${video.source}`,
      videoUrl: `https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_${(index % 4) + 1}mb.mp4`, // Sample video URLs
      thumbnailUrl: video.imageSrc || `https://picsum.photos/400/225?random=${index + 1}`,
      source: video.source,
      timeAgo: `${Math.floor(Math.random() * 24) + 1} jam yang lalu`
    }));
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = 256 + 16; // w-64 + space-x-4
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScrollLeft = Math.min(container.scrollLeft + itemWidth, maxScroll);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setCurrentIndex(Math.min(currentIndex + 1, displayVideos.length - 1));
    }
  };

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = 256 + 16; // w-64 + space-x-4
      const newScrollLeft = Math.max(container.scrollLeft - itemWidth, 0);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setCurrentIndex(Math.max(currentIndex - 1, 0));
    }
  };

  // Handler untuk membuka modal
  const openModal = (videoIndex: number) => {
    setSelectedVideoIndex(videoIndex);
    setIsModalOpen(true);
  };

  // Handler untuk menutup modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`bg-gray-50 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">
              {youtubeVideoData.length > 0 ? 'YouTube Videos' : 'Video Story'}
            </h2>
          </div>
        </div>

        {/* Video Cards */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          >
            {displayVideos.map((video, index) => (
              <div key={video.id} className="flex-shrink-0">
                <VideoItem
                  id={video.id}
                  title={video.title}
                  source={video.source}
                  duration={video.duration}
                  tag={video.tag}
                  imageSrc={video.imageSrc}
                  onClick={() => openModal(index)} // Pass onClick handler
                />
              </div>
            ))}
          </div>

          {/* Left Navigation Button - Hidden on mobile */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 hidden md:block">
            <button 
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="w-10 h-10 bg-naramakna-gold text-white rounded-full shadow-lg hover:bg-naramakna-gold/80 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Right Navigation Button - Hidden on mobile */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 hidden md:block">
            <button 
              onClick={handleNext}
              disabled={currentIndex >= displayVideos.length - 1}
              className="w-10 h-10 bg-naramakna-gold text-white rounded-full shadow-lg hover:bg-naramakna-gold/80 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Video Modal */}
        <VideoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          videos={convertToModalVideos(displayVideos)}
          initialVideoIndex={selectedVideoIndex}
        />
      </div>
    </div>
  );
};