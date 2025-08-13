import React from 'react';

interface FAQItemProps {
  question: string;
  answer: string;
  className?: string;
}

export const FAQItem: React.FC<FAQItemProps> = ({ question, answer, className = '' }) => {
  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      <details className="group">
        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors duration-200">
          <span className="font-medium text-gray-900">{question}</span>
          <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </summary>
        <div className="px-4 pb-4">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      </details>
    </div>
  );
};
