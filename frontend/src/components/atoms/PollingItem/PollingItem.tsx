import React from 'react';

interface PollingItemProps {
  id: string;
  question: string;
  options: string[];
  totalVotes: number;
  endDate: string;
  category: string;
  isActive: boolean;
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
  isActive,
  className = '',
  image_url
}) => {
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [hasVoted, setHasVoted] = React.useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);

  // Check if user has already voted for this poll
  React.useEffect(() => {
    const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '{}');
    if (votedPolls[id]) {
      setHasVoted(true);
      setSelectedOption(votedPolls[id]);
    }
  }, [id]);

  const handleOptionClick = (optionIndex: number) => {
    if (!hasVoted) {
      setSelectedOption(optionIndex.toString());
      setHasVoted(true);
      
      // Save vote to localStorage
      const votedPolls = JSON.parse(localStorage.getItem('voted_polls') || '{}');
      votedPolls[id] = optionIndex.toString();
      localStorage.setItem('voted_polls', JSON.stringify(votedPolls));
      
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    }
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
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
              // Hide image if failed to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Question */}
      <h3 className="text-xs md:text-sm font-semibold text-gray-900 mb-2 md:mb-3 leading-tight line-clamp-3">
        {question}
      </h3>

      {/* Options */}
      <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`w-full text-left p-2 md:p-3 border rounded-lg transition-colors duration-200 ${
              selectedOption === index.toString()
                ? 'bg-teal-50 border-teal-500'
                : 'border-gray-300 hover:bg-gray-50'
            } ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleOptionClick(index)}
            disabled={hasVoted}
          >
            <span className="text-xs md:text-sm text-gray-800 line-clamp-2">{option}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-[10px] md:text-xs text-gray-500">
        <span>{totalVotes.toLocaleString()} votes</span>
        <span>{calculateDaysLeft(endDate)} days left</span>
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