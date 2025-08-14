import React from 'react';
import { HowToWriteFAQItem } from '../../molecules/HowToWriteFAQItem';

interface FAQ {
  question: string;
  answer: string;
}

interface HowToWriteFAQSectionProps {
  faqs: FAQ[];
  className?: string;
}

export const HowToWriteFAQSection: React.FC<HowToWriteFAQSectionProps> = ({
  faqs,
  className = ''
}) => {
  return (
    <div className={`mt-16 ${className}`}>
      <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Pertanyaan Umum</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, index) => (
          <HowToWriteFAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </div>
  );
};
