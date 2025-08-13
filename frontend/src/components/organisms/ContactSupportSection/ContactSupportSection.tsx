import React from 'react';
import { ContactMethod } from '../../molecules/ContactMethod';

interface ContactMethodData {
  name: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}

interface ContactSupportSectionProps {
  title: string;
  description: string;
  contactMethods: ContactMethodData[];
  className?: string;
}

export const ContactSupportSection: React.FC<ContactSupportSectionProps> = ({
  title,
  description,
  contactMethods,
  className = ''
}) => {
  return (
    <div className={`bg-gradient-to-br from-white to-orange-50 p-10 rounded-2xl shadow-xl border border-orange-100 relative overflow-hidden ${className}`}>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-200 to-transparent rounded-full opacity-20 -translate-y-20 -translate-x-20"></div>
      <div className="relative">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-lg">{description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => (
            <ContactMethod
              key={index}
              name={method.name}
              description={method.description}
              icon={method.icon}
              link={method.link}
              color={method.color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
