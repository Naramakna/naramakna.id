import React from 'react';
import { SocialMediaIcon } from '../../atoms/SocialMediaIcon';

interface SocialMediaLinkProps {
  name: string;
  url: string;
  type: 'instagram' | 'facebook' | 'twitter' | 'whatsapp';
  color: string;
  bgColor: string;
  className?: string;
}

export const SocialMediaLink: React.FC<SocialMediaLinkProps> = ({
  name,
  url,
  type,
  color: _color,
  bgColor,
  className = ''
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${bgColor} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group ${className}`}
    >
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
          <SocialMediaIcon type={type} />
        </div>
        <p className="font-semibold text-sm">{name}</p>
      </div>
    </a>
  );
};
