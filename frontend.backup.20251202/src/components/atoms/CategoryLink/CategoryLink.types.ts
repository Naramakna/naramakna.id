export interface Category {
  name: string;
  slug: string;
  count: number;
}

export interface CategoryLinkProps {
  category: Category;
  isActive?: boolean;
  className?: string;
  onClick?: (category: Category) => void;
}