// Komponen gallery untuk display video grid
import React, { useState, useEffect } from 'react';
import { VideoItem } from '../../atoms/VideoItem';

export const VideoGallery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Dummy data untuk 8 video dengan format yang sama seperti VideoSection
  const dummyVideos = [
    {
      id: '1',
      title: 'Tips dan Trik Memasak Nasi Goreng yang Enak\nResep Rahasia Chef Professional',
      source: 'naramaknaFOOD',
      duration: '08:45',
      tag: 'FOOD & LIFESTYLE'
    },
    {
      id: '2',
      title: 'Review Gadget Terbaru 2024 - Mana yang Worth It?\nAnalisis Lengkap Spesifikasi dan Harga',
      source: 'naramaknaTECH',
      duration: '12:30',
      tag: 'TECHNOLOGY'
    },
    {
      id: '3',
      title: 'Tutorial Makeup Natural untuk Pemula\nStep by Step dari Basic sampai Advanced',
      source: 'naramaknaBEAUTY',
      duration: '15:20',
      tag: 'BEAUTY & FASHION'
    },
    {
      id: '4',
      title: 'Workout di Rumah - 30 Menit Full Body\nTanpa Alat, Efektif Bakar Kalori',
      source: 'naramaknaFITNESS',
      duration: '30:15',
      tag: 'HEALTH & FITNESS'
    },
    {
      id: '5',
      title: 'Resep Kue Brownies Cokelat Lembut\nTeknik Baking yang Mudah untuk Pemula',
      source: 'naramaknaBAKING',
      duration: '10:45',
      tag: 'FOOD & LIFESTYLE'
    },
    {
      id: '6',
      title: 'Travel Guide: 5 Tempat Wajib Kunjung di Bali\nHidden Gems yang Jarang Diketahui',
      source: 'naramaknaTRAVEL',
      duration: '18:30',
      tag: 'TRAVEL & ADVENTURE'
    },
    {
      id: '7',
      title: 'Tips Investasi Saham untuk Pemula\nStrategi Aman dan Menguntungkan',
      source: 'naramaknaFINANCE',
      duration: '22:15',
      tag: 'BUSINESS & FINANCE'
    },
    {
      id: '8',
      title: 'Review Film Terbaru - Bagaimana Plot Twist-nya?\nAnalisis Mendalam Storyline dan Acting',
      source: 'naramaknaENTERTAINMENT',
      duration: '14:50',
      tag: 'ENTERTAINMENT'
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

  return (
    <div className="w-full">
      {/* Video Grid - 4 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyVideos.map((video) => (
          <div key={video.id} className="flex-shrink-0">
            <VideoItem
              id={video.id}
              title={video.title}
              source={video.source}
              duration={video.duration}
              tag={video.tag}
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
    </div>
  );
};
