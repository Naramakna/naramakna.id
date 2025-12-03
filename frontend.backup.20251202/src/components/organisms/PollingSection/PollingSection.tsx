import React, { useState, useRef } from 'react';
import { PollingCard } from '../../molecules/PollingCard';
import { LoadingSpinner } from '../../atoms/LoadingSpinner/LoadingSpinner';

import { usePolling } from '../../../hooks/usePolling';
import type { VoteRequest } from '../../../services/api/polling';

interface PollingSectionProps {
  className?: string;
}

export const PollingSection: React.FC<PollingSectionProps> = ({
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { polls, loading, error, vote } = usePolling(10);

  // Handle voting (NO LOGIN REQUIRED - use browser fingerprint)
  const handleVote = async (pollId: string, optionId: string): Promise<boolean> => {
    const voteData: VoteRequest = {
      poll_id: pollId,
      option_id: optionId,
      user_id: undefined // Will be handled by usePolling hook with browser fingerprint
    };

    const success = await vote(voteData);
    if (!success && error) {
      console.error('Vote failed:', error);
    }
    return success;
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = 320 + 24; // w-80 + space-x-6
      const maxScroll = container.scrollWidth - container.clientWidth;
      const newScrollLeft = Math.min(container.scrollLeft + itemWidth, maxScroll);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setCurrentIndex(Math.min(currentIndex + 1, (polls?.length || 1) - 1));
    }
  };

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const itemWidth = 320 + 24; // w-80 + space-x-6
      const newScrollLeft = Math.max(container.scrollLeft - itemWidth, 0);
      
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      
      setCurrentIndex(Math.max(currentIndex - 1, 0));
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Polling</h2>
            </div>
          </div>
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-gray-600">Memuat polling...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state or no polls
  if (error || !polls || polls.length === 0) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Polling</h2>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-600">
              {error ? 'Gagal memuat polling' : 'Belum ada polling aktif'}
            </p>
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
            <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
            <h2 className="text-xl font-semibold text-gray-900">Polling</h2>
            <span className="text-sm text-gray-500">({polls?.length || 0} polling aktif)</span>
          </div>
        </div>

        {/* Polling Cards */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
          >
            {(polls || []).map((poll) => (
              <div key={poll.id} className="flex-shrink-0 w-80">
                <PollingCard
                  id={poll.id}
                  title={poll.title}
                  source={poll.source}
                  timeAgo={poll.timeAgo}
                  imageSrc={poll.image_url || poll.imageSrc}
                  options={poll.options}
                  totalVotes={poll.totalVotes}
                  daysLeft={poll.daysLeft}
                  date={poll.date}
                  onVote={handleVote}
                />
              </div>
            ))}
          </div>

           {/* Left Navigation Button - Hidden on mobile */}
           <div className="absolute top-1/2 left-4 transform -translate-y-1/2 hidden md:block">
             <button 
               onClick={handlePrev}
               disabled={currentIndex <= 0}
               className="w-10 h-10 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-500/80 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
               disabled={currentIndex >= (polls?.length || 1) - 1}
               className="w-10 h-10 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-500/80 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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