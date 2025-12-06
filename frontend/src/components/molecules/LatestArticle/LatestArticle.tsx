import React from 'react';
import { TrendingItem } from '../../atoms/TrendingItem';

interface LatestArticleItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  views?: number;
}

interface LatestArticleProps {
  articles: LatestArticleItem[];
  className?: string;
}

export const LatestArticle: React.FC<LatestArticleProps> = ({
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
          views={article.views}
        />
      ))}
    </div>
  );
};
