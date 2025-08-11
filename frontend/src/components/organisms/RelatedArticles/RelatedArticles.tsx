import React from 'react';

interface RelatedArticle {
  id: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    name: string;
    isVerified?: boolean;
  };
  publishedDate: string;
  readTime: string;
  category: string;
}

interface RelatedArticlesProps {
  articles: RelatedArticle[];
  title?: string;
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  articles,
  title = "Baca Lainnya"
}) => {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="border-t border-gray-200 pt-8 mt-12">
      {/* Section Header */}
      <div className="flex items-center mb-6">
        <div className="w-1 h-6 bg-red-500 mr-3"></div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <article key={article.id} className="group cursor-pointer">
            <a href={`/artikel/${article.slug || article.id}`} className="block">
              {/* Article Image */}
              {article.featuredImage && (
                <div className="relative overflow-hidden rounded-lg mb-4 aspect-video">
                  <img 
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Article Content */}
              <div className="space-y-2">
                {/* Title */}
                <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h4>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm line-clamp-2">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span>{article.author.name}</span>
                    {article.author.isVerified && (
                      <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>{article.publishedDate}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            </a>
          </article>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-8">
        <button className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <span>Lihat Artikel Lainnya</span>
          <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};
