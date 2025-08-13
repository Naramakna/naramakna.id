import React from 'react';
import { StepIcon } from '../../atoms/StepIcon';

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  color: string;
  details: string[];
  tips: string[];
  isActive: boolean;
  onStepClick: (step: number) => void;
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({
  step,
  title,
  description,
  color,
  details,
  tips,
  isActive,
  onStepClick,
  className = ''
}) => {
  return (
    <div 
      className={`${color} p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${isActive ? 'ring-4 ring-white/30' : ''} ${className}`}
      onClick={() => onStepClick(step)}
    >
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
          <StepIcon step={step} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-white/90 text-sm">{description}</p>
        </div>
      </div>
      
      {isActive && (
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-semibold mb-2">Detail Langkah:</h4>
            <ul className="space-y-2">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start text-white/90 text-sm">
                  <span className="w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-2">Tips & Trik:</h4>
            <p className="text-white/90 text-sm">
              {Array.isArray(tips) ? tips.join(' ') : tips}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
