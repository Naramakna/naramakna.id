import React from 'react';

interface ContactMethodProps {
  name: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
  className?: string;
}

export const ContactMethod: React.FC<ContactMethodProps> = ({ 
  name, 
  description, 
  icon, 
  link, 
  color, 
  className = '' 
}) => {
  return (
    <a
      href={link}
      target={link.startsWith('http') ? '_blank' : undefined}
      rel={link.startsWith('http') ? 'noopener noreferrer' : undefined}
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group ${className}`}
    >
      <div className="text-center">
        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h4 className="text-lg font-semibold mb-2">{name}</h4>
        <p className="text-sm opacity-90 leading-relaxed">{description}</p>
      </div>
    </a>
  );
};
