import { Category } from '../../atoms/CategoryLink/CategoryLink.types';

export interface CategoryNavigationProps {
  activeSlug?: string;
  showAdditional?: boolean;
  className?: string;
  onCategorySelect?: (category: Category) => void;
}