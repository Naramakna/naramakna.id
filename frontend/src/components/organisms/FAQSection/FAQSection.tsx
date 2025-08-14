import React from 'react';
import { FAQItem } from '../../molecules/FAQItem';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title: string;
  description: string;
  faqs: FAQ[];
  className?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title,
  description,
  faqs,
  className = ''
}) => {
  return (
    <div className={`bg-white p-8 rounded-2xl shadow-xl border border-gray-100 ${className}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            answer={faq.answer}
          />
        ))}
      </div>
    </div>
  );
};
