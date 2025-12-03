// API service untuk artikel endpoints
import { buildApiUrl } from '../../config/api';

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  type: string;
  status: string;
  slug: string;
  date: string;
  modified: string;
  author: {
    ID: number;
    display_name: string;
    user_email: string;
  };
  categories: any[];
  metadata: Record<string, any>;
  youtube?: {
    videoId: string;
    channelTitle: string;
    viewCount: number;
    likeCount: number;
    thumbnailUrl: string;
    sourceUrl: string;
  };
  tiktok?: {
    videoId: string;
    username: string;
    displayName: string;
    playCount: number;
    likeCount: number;
    coverUrl: string;
    sourceUrl: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FeedResponse {
  posts: Article[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface Category {
  id: number;
  termId: number;
  name: string;
  slug: string;
  description: string;
  count: number;
  parent: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export const articlesAPI = {
  async getFeed(params?: {
    page?: number;
    limit?: number;
    type?: string;
    category?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<FeedResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const response = await fetch(buildApiUrl(`content/feed?${queryParams}`));
    return response.json();
  },

  async getById(id: string): Promise<ApiResponse<Article>> {
    const response = await fetch(buildApiUrl(`content/${id}`));
    return response.json();
  },

  async getByType(type: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<FeedResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await fetch(buildApiUrl(`content/type/${type}?${queryParams}`));
    return response.json();
  },

  async getStats(): Promise<ApiResponse<{
    articles: number;
    youtube_videos: number;
    tiktok_videos: number;
    drafts: number;
    trash: number;
    total_published: number;
  }>> {
    const response = await fetch(buildApiUrl('content/stats'));
    return response.json();
  },

  async getCategories(params?: {
    limit?: number;
    minCount?: number;
    taxonomy?: string;
  }): Promise<ApiResponse<CategoriesResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.minCount) queryParams.append('minCount', params.minCount.toString());
    if (params?.taxonomy) queryParams.append('taxonomy', params.taxonomy);
    
    const response = await fetch(buildApiUrl(`content/categories?${queryParams}`));
    return response.json();
  },

  async getTrending(params?: {
    limit?: number;
    category?: string;
    type?: string;
  }): Promise<ApiResponse<FeedResponse>> {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.type) queryParams.append('type', params.type);
    
    const response = await fetch(buildApiUrl(`content/trending?${queryParams}`));
    return response.json();
  }
};
