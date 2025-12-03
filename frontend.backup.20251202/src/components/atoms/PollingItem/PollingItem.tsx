import React from 'react';

interface PollingItemProps {
  id: string;
  optionText: string;
  votes?: number;
  percentage?: number;
  isSelected?: boolean;
  onClick?: (id: string) => void;
  className?: string;
}

export const PollingItem: React.FC<PollingItemProps> = ({
  id,
  optionText,
  votes,
  percentage,
  isSelected = false,
  onClick,
  className = ''
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(id);
    }
  };

  return (
    <button
      type="button"
      className={`w-full text-left p-3 border border-teal-500 rounded-lg transition-colors duration-200
        ${isSelected ? 'bg-teal-50 border-teal-600' : 'hover:bg-teal-50'}
        ${className}`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-800">{optionText}</span>
        {percentage !== undefined && (
          <span className="text-xs font-semibold text-teal-600">{percentage}%</span>
        )}
      </div>
    </button>
  );
}; 