export interface IndexBeritaPageProps {
  className?: string;
}

export interface IndexBeritaData {
  articles: {
    id: number;
    title: string;
    excerpt?: string;
    content: string;
    featured_image?: string;
    date: string;
    modified?: string;
    author_name: string;
    author_id: number;
    slug?: string;
    category_name?: string;
    view_count?: number;
  }[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalArticles: number;
    hasMore: boolean;
  };
}
