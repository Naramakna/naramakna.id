// TypeScript types untuk navigation components
export interface MenuItem {
  title: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export interface DropdownItem {
  title: string;
  description?: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface NavCategory {
  name: string;
  items: MenuItem[];
}

export interface NavService {
  name: string;
  type?: 'default' | 'breaking' | 'halal' | 'green';
  href?: string;
  onClick?: () => void;
}