export interface Author {
  name: string;
  id: number;
}

export interface Article {
  id: number;
  title: string;
  excerpt: string;
  featured_image?: string;
  date: string;
  author: Author;
  slug: string;
  category: string;
}

export interface ArticleCardProps {
  article: Article;
  className?: string;
}
