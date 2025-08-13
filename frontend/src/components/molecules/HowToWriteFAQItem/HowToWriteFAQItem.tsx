import React from 'react';

interface HowToWriteFAQItemProps {
  question: string;
  answer: string;
  className?: string;
}

export const HowToWriteFAQItem: React.FC<HowToWriteFAQItemProps> = ({ 
  question, 
  answer, 
  className = '' 
}) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-md border border-gray-100 ${className}`}>
      <h4 className="text-lg font-semibold text-gray-900 mb-3">{question}</h4>
      <p className="text-gray-600">{answer}</p>
    </div>
  );
};
