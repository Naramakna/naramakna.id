import { buildApiUrl } from '../../config/api';

export interface PollOption {
  id: string;
  text: string;
  percentage?: number;
  vote_count?: number;
}

export interface Poll {
  id: string;
  title: string;
  question: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  image_url?: string;
  options: PollOption[];
  totalVotes: number;
  daysLeft: number;
  date: string;
  status: 'active' | 'closed' | 'draft';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PollsResponse {
  polls: Poll[];
  total: number;
}

export interface VoteRequest {
  poll_id: string;
  option_id: string;
  user_id?: string;
}

export interface TrendingCandidate {
  ID: number;
  post_title: string;
  post_excerpt: string;
  view_count: number;
  trending_score: number;
  categories: string;
  has_poll: number;
  post_date: string;
}

export interface PollTemplate {
  id: number;
  template_name: string;
  category: string;
  question_template: string;
  options_template: string[];
  usage_count: number;
  success_rate: number;
}

export const pollingAPI = {
  /**
   * Get active polls for public display
   */
  async getActivePolls(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<PollsResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const response = await fetch(buildApiUrl(`polling/active?${queryParams}`));
    return response.json();
  },

  /**
   * Vote on a poll
   */
  async vote(voteData: VoteRequest): Promise<ApiResponse<any>> {
    const response = await fetch(buildApiUrl('polling/vote'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData)
    });
    return response.json();
  },

  /**
   * Get trending candidates for polling (Admin only)
   */
  async getTrendingCandidates(params?: {
    limit?: number;
  }): Promise<ApiResponse<{ candidates: TrendingCandidate[]; total: number }>> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const token = localStorage.getItem('naramakna_token');
    const response = await fetch(buildApiUrl(`polling/trending-candidates?${queryParams}`), {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    return response.json();
  },

  /**
   * Generate polling from article (Admin only)
   */
  async generatePolling(data: {
    article_id: number;
    template_id?: number;
    custom_question?: string;
    custom_options?: string[];
  }): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('naramakna_token');
    const response = await fetch(buildApiUrl('polling/generate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * Create new poll (Admin only)
   */
  async createPoll(data: {
    source_article_id?: number;
    title: string;
    question: string;
    options: string[];
    category?: string;
    source_channel?: string;
    expires_in_days?: number;
  }): Promise<ApiResponse<any>> {
    const token = localStorage.getItem('naramakna_token');
    const response = await fetch(buildApiUrl('polling/create'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  /**
   * Get poll templates
   */
  async getTemplates(category?: string): Promise<ApiResponse<{ templates: PollTemplate[] }>> {
    const queryParams = new URLSearchParams();
    
    if (category) queryParams.append('category', category);
    
    const response = await fetch(buildApiUrl(`polling/templates?${queryParams}`));
    return response.json();
  }
};
