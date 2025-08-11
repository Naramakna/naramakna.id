import React, { useState } from 'react';
import { PollingItem } from '../../atoms/PollingItem';

interface PollingOption {
  id: string;
  text: string;
  percentage?: number;
}

interface PollingCardProps {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  options: PollingOption[];
  totalVotes: number;
  daysLeft: number;
  date: string;
  onVote?: (pollId: string, optionId: string) => Promise<boolean>;
  className?: string;
}

export const PollingCard: React.FC<PollingCardProps> = ({
  id,
  title,
  source,
  timeAgo,
  imageSrc,
  options,
  totalVotes,
  daysLeft,
  date,
  onVote,
  className = ''
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Check if user has already voted for this poll
  React.useEffect(() => {
    const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '{}');
    if (votedPolls[id]) {
      setHasVoted(true);
      setSelectedOption(votedPolls[id]);
    }
  }, [id]);

  const handleOptionClick = async (optionId: string) => {
    if (hasVoted || isVoting) {
      return; // Prevent multiple votes or spam clicks
    }

    setIsVoting(true);
    setSelectedOption(optionId);
    
    try {
      // Call the onVote callback if provided
      if (onVote) {
        const success = await onVote(id, optionId);
        if (success) {
          setHasVoted(true);
        } else {
          // Reset if vote failed
          setSelectedOption(null);
        }
      }
    } catch (error) {
      console.error('Error during vote:', error);
      setSelectedOption(null);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-center">
              <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs">Polling Image</div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Source and verification */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-sm text-gray-600">{source}</span>
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>

        {/* Polling Options */}
        <div className="space-y-2 mb-4">
          {options.map((option) => (
            <PollingItem
              key={option.id}
              id={option.id}
              optionText={option.text}
              percentage={hasVoted ? option.percentage : undefined}
              isSelected={selectedOption === option.id}
              onClick={handleOptionClick}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{totalVotes} Pemilih - {daysLeft} hari</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}; 