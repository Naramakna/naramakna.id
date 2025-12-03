import React from 'react';
import { AdSection } from '../AdSection';

interface AdSectionSideProps {
  className?: string;
  placement?: string;
  rotationInterval?: number;
}

export const AdSectionSide: React.FC<AdSectionSideProps> = ({
  className = '',
  placement = 'sidebar',
  rotationInterval = 7000
}) => {
  return (
    <div className={`w-[300px] ${className}`}>
      <AdSection 
        placement={placement}
        size="sidebar"
        rotationInterval={rotationInterval}
      />
    </div>
  );
};
