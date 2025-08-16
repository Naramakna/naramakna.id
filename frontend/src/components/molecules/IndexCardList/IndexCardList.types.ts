export interface IndexCardListProps {
  articles: {
    id: number;
    title: string;
    excerpt: string;
    featured_image?: string;
    date: string;
    author: {
      name: string;
      id: number;
    };
    slug: string;
    category: string;
    views?: number;
  }[];
  className?: string;
}
