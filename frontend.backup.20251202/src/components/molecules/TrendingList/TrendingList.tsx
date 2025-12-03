import React from 'react';
import { TrendingItem } from '../../atoms/TrendingItem';

interface TrendingArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
}

interface TrendingListProps {
  articles: TrendingArticle[];
  className?: string;
}

export const TrendingList: React.FC<TrendingListProps> = ({
  articles,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {articles.map((article) => (
        <TrendingItem
          key={article.id}
          title={article.title}
          source={article.source}
          timeAgo={article.timeAgo}
          imageSrc={article.imageSrc}
          href={article.href}
        />
      ))}
    </div>
  );
}; 