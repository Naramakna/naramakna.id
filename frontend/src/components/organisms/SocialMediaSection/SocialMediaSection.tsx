import React from 'react';
import { SocialMediaLink } from '../../molecules/SocialMediaLink';

interface SocialMediaData {
  name: string;
  url: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'whatsapp';
  color: string;
  bgColor: string;
}

interface SocialMediaSectionProps {
  title: string;
  description: string;
  socialMediaLinks: SocialMediaData[];
  className?: string;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  title,
  description,
  socialMediaLinks,
  className = ''
}) => {
  return (
    <div className={`bg-white/80 backdrop-blur-sm p-10 rounded-2xl shadow-xl border border-orange-100 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200 to-transparent rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
      <div className="relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-lg text-gray-600">{description}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {socialMediaLinks.map((social, index) => (
            <SocialMediaLink
              key={index}
              name={social.name}
              url={social.url}
              type={social.type}
              color={social.color}
              bgColor={social.bgColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
