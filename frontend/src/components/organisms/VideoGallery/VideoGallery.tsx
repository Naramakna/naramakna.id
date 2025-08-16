// Komponen gallery untuk display video grid
import React, { useState, useEffect } from 'react';
import { VideoItemGallery } from '../../atoms/VideoItemGallery';
import { VideoModal } from '../VideoModal';

export const VideoGallery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);

  // Dummy data untuk 8 video dengan format yang sama seperti VideoSection
  const dummyVideos = [
    {
      id: '1',
      title: 'Tips dan Trik Memasak Nasi Goreng yang Enak\nResep Rahasia Chef Professional',
      source: 'naramaknaFOOD',
      duration: '08:45',
      tag: 'FOOD & LIFESTYLE',
      // Tambahan data untuk modal
      description: 'Resep rahasia chef professional untuk membuat nasi goreng yang enak dan lezat',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=1',
      timeAgo: '2 jam yang lalu'
    },
    {
      id: '2',
      title: 'Review Gadget Terbaru 2024 - Mana yang Worth It?\nAnalisis Lengkap Spesifikasi dan Harga',
      source: 'naramaknaTECH',
      duration: '12:30',
      tag: 'TECHNOLOGY',
      description: 'Analisis mendalam gadget terbaru 2024, mana yang worth it untuk dibeli',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=2',
      timeAgo: '5 jam yang lalu'
    },
    {
      id: '3',
      title: 'Tutorial Makeup Natural untuk Pemula\nStep by Step dari Basic sampai Advanced',
      source: 'naramaknaBEAUTY',
      duration: '15:20',
      tag: 'BEAUTY & FASHION',
      description: 'Tutorial lengkap makeup natural untuk pemula, step by step yang mudah diikuti',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=3',
      timeAgo: '1 hari yang lalu'
    },
    {
      id: '4',
      title: 'Workout di Rumah - 30 Menit Full Body\nTanpa Alat, Efektif Bakar Kalori',
      source: 'naramaknaFITNESS',
      duration: '30:15',
      tag: 'HEALTH & FITNESS',
      description: 'Workout full body 30 menit yang bisa dilakukan di rumah tanpa alat',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=4',
      timeAgo: '2 hari yang lalu'
    },
    {
      id: '5',
      title: 'Resep Kue Brownies Cokelat Lembut\nTeknik Baking yang Mudah untuk Pemula',
      source: 'naramaknaBAKING',
      duration: '10:45',
      tag: 'FOOD & LIFESTYLE',
      description: 'Resep brownies cokelat yang lembut dengan teknik baking sederhana',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=5',
      timeAgo: '3 hari yang lalu'
    },
    {
      id: '6',
      title: 'Travel Guide: 5 Tempat Wajib Kunjung di Bali\nHidden Gems yang Jarang Diketahui',
      source: 'naramaknaTRAVEL',
      duration: '18:30',
      tag: 'TRAVEL & ADVENTURE',
      description: 'Panduan lengkap 5 tempat wajib kunjung di Bali, termasuk hidden gems',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=6',
      timeAgo: '1 minggu yang lalu'
    },
    {
      id: '7',
      title: 'Tips Investasi Saham untuk Pemula\nStrategi Aman dan Menguntungkan',
      source: 'naramaknaFINANCE',
      duration: '22:15',
      tag: 'BUSINESS & FINANCE',
      description: 'Tips dan strategi investasi saham untuk pemula yang aman dan menguntungkan',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=7',
      timeAgo: '1 minggu yang lalu'
    },
    {
      id: '8',
      title: 'Review Film Terbaru - Bagaimana Plot Twist-nya?\nAnalisis Mendalam Storyline dan Acting',
      source: 'naramaknaENTERTAINMENT',
      duration: '14:50',
      tag: 'ENTERTAINMENT',
      description: 'Review mendalam film terbaru dengan analisis storyline dan acting',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_10mb.mp4',
      thumbnailUrl: 'https://picsum.photos/400/225?random=8',
      timeAgo: '2 minggu yang lalu'
    }
  ];

  // Simulasi auto-loading ketika scroll ke bawah
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100) {
        if (!loading && hasMoreData) {
          // Simulasi loading data baru
          setLoading(true);
          setTimeout(() => {
            setLoading(false);
            // Set hasMoreData ke false setelah beberapa kali load untuk simulasi
            if (Math.random() > 0.7) {
              setHasMoreData(false);
            }
          }, 800); // Lebih cepat dari 1.5 detik
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMoreData]);

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
    <div className="w-full">
      {/* Video Grid - Mobile: 2 kolom, Desktop: 4 kolom */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
        {dummyVideos.map((video, index) => (
          <div key={video.id} className="flex-shrink-0">
            <VideoItemGallery
              id={video.id}
              title={video.title}
              source={video.source}
              duration={video.duration}
              tag={video.tag}
              imageSrc={video.thumbnailUrl}
              onClick={() => openModal(index)} // Pass onClick handler
            />
          </div>
        ))}
      </div>
      
      {/* Loading Animation - Muncul otomatis saat scroll */}
      {loading && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="text-gray-600 text-sm">Memuat video...</span>
          </div>
        </div>
      )}
      
      {/* No More Data Message - Muncul ketika tidak ada data lagi */}
      {!hasMoreData && !loading && (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">Tidak ada video lagi untuk ditampilkan</p>
        </div>
      )}

      {/* Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        videos={dummyVideos}
        initialVideoIndex={selectedVideoIndex}
      />
    </div>
  );
};
