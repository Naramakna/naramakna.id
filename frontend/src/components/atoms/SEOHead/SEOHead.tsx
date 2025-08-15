import React from 'react';
import { useSEO } from '../../../hooks/useSEO';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'article' | 'website';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  locale?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = (props) => {
  useSEO(props);
  return null; // This component doesn't render anything
};

export default SEOHead;

