import React from 'react';
import { AdSectionSide } from '../../organisms/AdSectionSide';
import type { ArticleCardProps } from '../ArticleCard/ArticleCard.types';

interface ArticleCardListProps {
  articles: ArticleCardProps['article'][];
  className?: string;
}

export const ArticleCardList: React.FC<ArticleCardListProps> = ({
  articles,
  className = ''
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari`;
    
    return date.toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClick = (slug: string) => {
    window.location.href = `/artikel/${slug}`;
  };

  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="flex gap-6">
        {/* Left Column - Article List */}
        <div className="flex-1">
          {/* Feed Header */}
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">Feed</h2>
            </div>
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {articles.map((article) => (
              <div 
                key={article.id}
                className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer border border-gray-200 bg-white"
                onClick={() => handleClick(article.slug)}
              >
                {/* Article Content */}
                <div className="flex-1 min-w-0">
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight text-left">
                    {article.title}
                  </h3>
                  
                  {/* Author and Time */}
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {article.author.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{article.author.name}</span>
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {/* Views */}
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{(article.views || 0).toLocaleString()}</span>
                    </div>
                    <span>{formatDate(article.date)}</span>
                  </div>
                </div>
                
                {/* Thumbnail Image - Always show */}
                <div className="flex-shrink-0 w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                  {article.featured_image ? (
                    <img
                      src={article.featured_image}
                      alt={article.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallbackDiv = e.currentTarget.parentElement?.querySelector('.fallback-placeholder');
                        fallbackDiv?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  {/* Fallback placeholder when no image */}
                  <div className={`fallback-placeholder w-full h-full flex items-center justify-center ${article.featured_image ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1 flex items-center justify-center">
                        <span className="text-gray-600 text-xs font-bold">A</span>
                      </div>
                      <p className="text-gray-400 text-xs">No Image</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Right Column - Ad Section Side */}
        <div className="hidden lg:block">
          <AdSectionSide />
        </div>
      </div>
    </div>
  );
};
