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
    }
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm ${className}`}>
      {/* Category Badge */}
      <div className="mb-3">
        <span className="inline-block bg-teal-100 text-teal-800 text-xs font-medium px-2 py-1 rounded">
          {category}
        </span>
      </div>

      {/* Image if available */}
      {image_url && (
        <div className="mb-3">
          <img 
            src={image_url} 
            alt={question}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              // Hide image if failed to load
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Question */}
      <h3 className="text-sm font-semibold text-gray-900 mb-3 leading-tight">
        {question}
      </h3>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`w-full text-left p-3 border rounded-lg transition-colors duration-200 ${
              selectedOption === index.toString()
                ? 'bg-teal-50 border-teal-500'
                : 'border-gray-300 hover:bg-gray-50'
            } ${hasVoted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleOptionClick(index)}
            disabled={hasVoted}
          >
            <span className="text-sm text-gray-800">{option}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>{totalVotes.toLocaleString()} votes</span>
        <span>{calculateDaysLeft(endDate)} days left</span>
      </div>
    </div>
  );
}; 