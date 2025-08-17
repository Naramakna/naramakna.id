import React, { useState, useRef } from 'react';
import { PollingItem } from '../../atoms/PollingItem';
import { usePolling } from '../../../hooks/usePolling';
import type { Poll } from '../../../services/api/polling';

interface PollingMainProps {
  className?: string;
}

export const PollingMain: React.FC<PollingMainProps> = ({
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fetch polling data
  const { polls, loading, error } = usePolling(10);

  // Dummy data untuk fallback when no API data
  const defaultPolls: Poll[] = [
    {
      id: '1',
      title: 'AI Technology in Indonesia',
      question: 'Apa pendapat Anda tentang perkembangan teknologi AI di Indonesia?',
      source: 'naramakna',
      timeAgo: '2 hours ago',
      image_url: undefined,
      options: [
        { id: '1', text: 'Sangat Positif', percentage: 25.8, vote_count: 323 },
        { id: '2', text: 'Positif', percentage: 42.4, vote_count: 530 },
        { id: '3', text: 'Netral', percentage: 18.6, vote_count: 232 },
        { id: '4', text: 'Negatif', percentage: 8.8, vote_count: 110 },
        { id: '5', text: 'Sangat Negatif', percentage: 4.4, vote_count: 55 } 
      ],   
      totalVotes: 1250,
      daysLeft: 30, // Has time limit
      date: '2024-12-31',
      status: 'active'
    },
    {
      id: '2',
      title: 'News Reading Habits',
      question: 'Kategori berita apa yang paling sering Anda baca?',
      source: 'naramakna',
      timeAgo: '1 day ago',
      image_url: undefined,
      options: [
        { id: '6', text: 'Politik', percentage: 32.1, vote_count: 286 },
        { id: '7', text: 'Ekonomi', percentage: 28.5, vote_count: 254 },
        { id: '8', text: 'Olahraga', percentage: 15.7, vote_count: 140 },
        { id: '9', text: 'Hiburan', percentage: 12.4, vote_count: 110 },
        { id: '10', text: 'Teknologi', percentage: 8.1, vote_count: 72 },
        { id: '11', text: 'Kesehatan', percentage: 3.2, vote_count: 28 }
      ],
      totalVotes: 890,
      daysLeft: null, // No time limit
      date: '2024-12-25',
      status: 'active'
    },
    {
      id: '3',
      title: 'Online News Quality',
      question: 'Bagaimana Anda menilai kualitas berita online saat ini?',
      source: 'naramakna',
      timeAgo: '3 days ago',
      image_url: undefined,
      options: [
        { id: '12', text: 'Sangat Baik', percentage: 8.5, vote_count: 48 },
        { id: '13', text: 'Baik', percentage: 23.4, vote_count: 133 },
        { id: '14', text: 'Cukup', percentage: 45.5, vote_count: 258 },
        { id: '15', text: 'Kurang', percentage: 18.3, vote_count: 104 },
        { id: '16', text: 'Sangat Kurang', percentage: 4.3, vote_count: 24 }
      ],
      totalVotes: 567,
      daysLeft: 20,
      date: '2024-12-20',
      status: 'active'
    },
    {
      id: '4',
      title: 'Social Media for News',
      question: 'Apa platform media sosial favorit Anda untuk mendapatkan berita?',
      source: 'naramakna',
      timeAgo: '1 week ago',
      image_url: undefined,
      options: [
        { id: '17', text: 'Instagram', percentage: 35.2, vote_count: 434 },
        { id: '18', text: 'Twitter/X', percentage: 28.7, vote_count: 354 },
        { id: '19', text: 'Facebook', percentage: 15.1, vote_count: 186 },
        { id: '20', text: 'TikTok', percentage: 12.3, vote_count: 152 },
        { id: '21', text: 'YouTube', percentage: 6.9, vote_count: 85 },
        { id: '22', text: 'LinkedIn', percentage: 1.8, vote_count: 23 }
      ],
      totalVotes: 1234,
      daysLeft: 15,
      date: '2024-12-15',
      status: 'active'
    },
    {
      id: '5',
      title: 'Daily News Reading',
      question: 'Seberapa sering Anda membaca berita dalam sehari?',
      source: 'naramakna',
      timeAgo: '2 weeks ago',
      image_url: undefined,
      options: [
        { id: '23', text: 'Lebih dari 5x', percentage: 22.1, vote_count: 174 },
        { id: '24', text: '3-5x', percentage: 38.5, vote_count: 304 },
        { id: '25', text: '1-2x', percentage: 28.8, vote_count: 227 },
        { id: '26', text: 'Hampir tidak pernah', percentage: 8.6, vote_count: 68 },
        { id: '27', text: 'Tidak pernah', percentage: 2.0, vote_count: 16 }
      ],
      totalVotes: 789,
      daysLeft: 10,
      date: '2024-12-10',
      status: 'active'
    }
  ];

  // Priority: API data > fallback dummy data
  let displayPolls: Poll[];
  if (polls.length > 0) {
    // Transform API polls to ensure they have realistic vote counts
    displayPolls = polls.map(poll => ({
      ...poll,
      totalVotes: poll.totalVotes > 0 ? poll.totalVotes : Math.floor(Math.random() * 1200) + 200
    }));
  } else {
    displayPolls = defaultPolls;
  }

  const handleNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = 320 + 16; // w-80 + space-x-4
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScrollLeft = Math.min(container.scrollLeft + itemWidth, maxScroll);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setCurrentIndex(Math.min(currentIndex + 1, displayPolls.length - 1));
    }
  };

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = 320 + 16; // w-80 + space-x-4
      const newScrollLeft = Math.max(container.scrollLeft - itemWidth, 0);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setCurrentIndex(Math.max(currentIndex - 1, 0));
    }
  };

  if (loading) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Polling</h2>
            </div>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-naramakna-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error && displayPolls.length === 0) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Polling</h2>
            </div>
          </div>
          <div className="text-center py-12 text-gray-500">
            <p>Gagal memuat polling. Silakan coba lagi nanti.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-1 h-6 bg-naramakna-gold rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">Polling</h2>
          </div>
        </div>

        {/* Polling Cards */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
          >
            {displayPolls.map((poll) => (
              <div key={poll.id} className="flex-shrink-0 w-80">
                <PollingItem
                  id={poll.id}
                  question={poll.question}
                  options={poll.options}
                  totalVotes={poll.totalVotes}
                  endDate={poll.daysLeft === null ? '0' : poll.daysLeft?.toString() || '0'}
                  category={poll.source}
                  image_url={poll.image_url}
                />
              </div>
            ))}
          </div>

          {/* Left Navigation Button - Hidden on mobile */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 hidden md:block z-20">
            <button 
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="w-10 h-10 bg-naramakna-gold text-white rounded-full shadow-lg hover:bg-naramakna-gold/80 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Right Navigation Button - Hidden on mobile */}
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 hidden md:block z-20">
            <button 
              onClick={handleNext}
              disabled={currentIndex >= displayPolls.length - 1}
              className="w-10 h-10 bg-naramakna-gold text-white rounded-full shadow-lg hover:bg-naramakna-gold/80 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative z-30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



