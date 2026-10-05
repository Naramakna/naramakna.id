import React from 'react';
import type { PollOption } from '../../../services/api/polling';
import { usePolling } from '../../../hooks/usePolling';

interface PollingItemProps {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endDate: string;
  category: string;
  className?: string;
  image_url?: string | null;
}

export const PollingItem: React.FC<PollingItemProps> = ({
  id,
  question,
  options,
  totalVotes,
  endDate,
  category,
  className = '',
  image_url
}) => {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [isVoting, setIsVoting] = React.useState(false);
  
  const { vote } = usePolling();



  // Check if user has already voted for this poll
  React.useEffect(() => {
    const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '{}');
    if (votedPolls[id]) {
      setHasVoted(true);
      // Find the index of the voted option
      const votedOptionId = votedPolls[id];
      const optionIndex = options.findIndex(opt => opt.id === votedOptionId);
      if (optionIndex !== -1) {
        setSelectedOption(optionIndex.toString());
      }
    }
  }, [id, options]);

  const handleOptionClick = async (optionIndex: number) => {
    if (!hasVoted && !isVoting) {
      const selectedOptionId = options[optionIndex].id;
      setIsVoting(true);
      setSelectedOption(optionIndex.toString()); // Set selection immediately for loading UI
      
      try {
        // Submit vote to backend
        const success = await vote({
          poll_id: id,
          option_id: selectedOptionId
        });
        
        if (success) {
          setHasVoted(true);
          
          // Show success message
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        } else {
          // Reset selection if vote failed
          setSelectedOption(null);
        }
      } catch (error) {
        console.error('Error voting:', error);
        // Reset selection if vote failed
        setSelectedOption(null);
      } finally {
        setIsVoting(false);
      }
    }
  };

  const calculateDaysLeft = (endDate: string) => {
    try {
      // If endDate is empty, null, undefined, or "0", return null (no time limit)
      if (!endDate || endDate === '0' || endDate === 'null' || endDate === 'undefined') {
        return null;
      }
      
      // If endDate is a number, treat as days left
      if (!isNaN(Number(endDate))) {
        const days = Number(endDate);
        return days > 0 ? days : null; // Return null if 0 or negative (no time limit)
      }
      
      // If it's a date string, parse it
      const end = new Date(endDate);
      
      // If date is invalid, return null (no time limit)
      if (isNaN(end.getTime())) {
        return null;
      }
      
      const now = new Date();
      const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : null; // Return null if expired or no time limit
    } catch (error) {
      console.warn('Error calculating days left:', error);
      return null; // Default to no time limit on error
    }
  };

  return (
    <div className={`relative bg-white rounded-lg border border-gray-200 p-3 md:p-4 shadow-sm ${hasVoted ? 'ring-2 ring-green-200 bg-green-50' : ''} ${className}`}>
      {/* Category Badge */}
      <div className="mb-2 md:mb-3 flex items-center justify-between">
        <span className="inline-block bg-teal-100 text-teal-800 text-[10px] md:text-xs font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded">
          {category}
        </span>
        {hasVoted && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-[10px] md:text-xs text-green-600 font-medium">Voted</span>
          </div>
        )}
      </div>

      {/* Image if available */}
      {image_url && (
        <div className="mb-2 md:mb-3">
          <img 
            src={image_url} 
            alt={question}
            className="w-full h-20 md:h-32 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/placeholder-gallery.jpg';
            }}
          />
        </div>
      )}

      {/* Question */}
      <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 leading-tight">
        {question}
      </h3>

      {/* Options */}
      <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`relative w-full text-left p-2 md:p-3 border rounded-lg transition-all duration-200 overflow-hidden ${
              selectedOption === index.toString()
                ? 'bg-teal-50 border-teal-500'
                : 'border-gray-300 hover:bg-gray-50'
            } ${hasVoted || isVoting ? 'cursor-not-allowed' : 'cursor-pointer'} ${
              isVoting ? 'opacity-60' : ''
            }`}
            onClick={() => handleOptionClick(index)}
            disabled={hasVoted || isVoting}
          >
            {/* Background percentage bar */}
            {hasVoted && Number(option.percentage || 0) > 0 && (
              <div 
                className="absolute inset-0 bg-gradient-to-r from-teal-100 to-teal-50 opacity-60 transition-all duration-500"
                style={{ 
                  width: `${Number(option.percentage || 0)}%`,
                  maxWidth: '100%'
                }}
              />
            )}
            
            {/* Option content */}
            <div className="relative z-10 flex justify-between items-center">
              <span className="text-xs md:text-sm text-gray-800 line-clamp-2 flex-1 pr-2">
                {option.text}
              </span>
              
              {/* Show loading during voting */}
              {isVoting && selectedOption === index.toString() && (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                </div>
              )}
              
              {/* Show percentage and vote count after voting */}
              {hasVoted && !isVoting && (
                <div className="flex flex-col items-end space-y-0.5">
                  <span className="text-xs font-semibold text-teal-700">
                    {Number(option.percentage || 0).toFixed(1)}%
                  </span>
                  {option.vote_count !== undefined && (
                    <span className="text-[10px] text-gray-500">
                      {Number(option.vote_count || 0).toLocaleString()} suara
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-[10px] md:text-xs text-gray-500">
        <span>{totalVotes.toLocaleString()} votes</span>
        {(() => {
          const daysLeft = calculateDaysLeft(endDate);
          if (daysLeft === null) {
            return <span className="text-green-600 font-medium">No time limit</span>;
          }
          return <span>{daysLeft} days left</span>;
        })()}
      </div>

      {/* Success Toast */}
      {showSuccessMessage && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center rounded-lg">
          <div className="text-center text-white">
            <svg className="w-8 h-8 mx-auto mb-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium">Vote berhasil!</p>
            <p className="text-xs opacity-90">Terima kasih sudah berpartisipasi</p>
          </div>
        </div>
      )}
    </div>
  );
}; 
