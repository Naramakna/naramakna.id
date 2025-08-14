import React, { useState, useEffect } from 'react';
import { PollingItem } from '../../atoms/PollingItem/PollingItem';

interface PollingData {
  id: string;
  question: string;
  options: string[];
  totalVotes: number;
  endDate: string;
  category: string;
  isActive: boolean;
}

export const PollingGallery: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Dummy data untuk polling dengan format yang sesuai
  const dummyPollings: PollingData[] = [
    {
      id: '1',
      question: 'Apa makanan favorit Anda saat berbuka puasa?',
      options: ['Es Campur', 'Kolak Pisang', 'Soto', 'Nasi Goreng'],
      totalVotes: 1247,
      endDate: '2024-12-31',
      category: 'FOOD & LIFESTYLE',
      isActive: true
    },
    {
      id: '2',
      question: 'Destinasi wisata mana yang ingin Anda kunjungi tahun depan?',
      options: ['Bali', 'Yogyakarta', 'Labuan Bajo', 'Raja Ampat'],
      totalVotes: 892,
      endDate: '2024-12-31',
      category: 'TRAVEL',
      isActive: true
    },
    {
      id: '3',
      question: 'Apa genre film yang paling Anda sukai?',
      options: ['Action', 'Romance', 'Horror', 'Comedy'],
      totalVotes: 1567,
      endDate: '2024-12-31',
      category: 'ENTERTAINMENT',
      isActive: true
    },
    {
      id: '4',
      question: 'Apa olahraga yang paling sering Anda lakukan?',
      options: ['Jalan Kaki', 'Bersepeda', 'Gym', 'Berenang'],
      totalVotes: 734,
      endDate: '2024-12-31',
      category: 'HEALTH & FITNESS',
      isActive: true
    },
    {
      id: '5',
      question: 'Apa aplikasi yang paling sering Anda gunakan?',
      options: ['WhatsApp', 'Instagram', 'TikTok', 'YouTube'],
      totalVotes: 2103,
      endDate: '2024-12-31',
      category: 'TECHNOLOGY',
      isActive: true
    },
    {
      id: '6',
      question: 'Apa warna yang paling Anda sukai?',
      options: ['Biru', 'Merah', 'Hijau', 'Kuning'],
      totalVotes: 445,
      endDate: '2024-12-31',
      category: 'LIFESTYLE',
      isActive: true
    },
    {
      id: '7',
      question: 'Apa genre musik yang paling Anda dengarkan?',
      options: ['Pop', 'Rock', 'Jazz', 'Klasik'],
      totalVotes: 678,
      endDate: '2024-12-31',
      category: 'MUSIC',
      isActive: true
    },
    {
      id: '8',
      question: 'Apa hobi yang paling Anda nikmati?',
      options: ['Membaca', 'Menulis', 'Menggambar', 'Memasak'],
      totalVotes: 567,
      endDate: '2024-12-31',
      category: 'HOBBIES',
      isActive: true
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
      {/* Polling Grid - 4 kolom */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyPollings.map((polling) => (
          <div key={polling.id} className="flex-shrink-0">
            <PollingItem
              id={polling.id}
              question={polling.question}
              options={polling.options}
              totalVotes={polling.totalVotes}
              endDate={polling.endDate}
              category={polling.category}
              isActive={polling.isActive}
            />
          </div>
        ))}
      </div>
      
      {/* Loading Animation - Muncul otomatis saat scroll */}
      {loading && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span className="text-gray-600 text-sm">Memuat polling...</span>
          </div>
        </div>
      )}
      
      {/* No More Data Message - Muncul ketika tidak ada data lagi */}
      {!hasMoreData && !loading && (
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">Tidak ada polling lagi untuk ditampilkan</p>
        </div>
      )}
    </div>
  );
};
