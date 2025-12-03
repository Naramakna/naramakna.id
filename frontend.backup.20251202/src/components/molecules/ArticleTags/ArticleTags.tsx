import React from 'react';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface ArticleTagsProps {
  tags: Tag[];
}

export const ArticleTags: React.FC<ArticleTagsProps> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 py-6 border-t border-gray-200">
      {tags.map((tag) => (
        <a
          key={tag.id}
          href={`/tag/${tag.slug}`}
          className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          {tag.name}
        </a>
      ))}
    </div>
  );
};
