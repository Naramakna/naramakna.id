import { buildApiUrl } from '../../config/api';

// Simple API utility for HTTP requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Use cookies for authentication like auth API
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response;
};

export interface ScheduleInfo {
  id: number;
  post_id: number;
  action_type: 'scheduled' | 'rescheduled' | 'published' | 'cancelled';
  scheduled_date: string | null;
  previous_scheduled_date: string | null;
  scheduled_by: number;
  notes: string | null;
  created_at: string;
  scheduled_by_name?: string;
}

export interface ScheduledPost {
  ID: number;
  post_title: string;
  post_content: string;
  post_status: string;
  post_date: string;
  scheduled_publish_date: string | null;
  scheduled_by: number | null;
  scheduling_notes: string | null;
  original_status: string;
  author: {
    ID: number;
    display_name: string;
    user_login: string;
  };
  schedule_info?: ScheduleInfo;
}

export interface SchedulablePosts {
  posts: ScheduledPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ScheduleRequest {
  scheduledDate: string;
  notes?: string;
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  data?: {
    post_id: number;
    scheduled_date: string;
    original_status?: string;
    new_scheduled_date?: string;
    previous_scheduled_date?: string;
    restored_status?: string;
    cancelled_scheduled_date?: string;
  };
  error?: string;
}

class SchedulerAPI {
  // Get all scheduled posts
  async getScheduledPosts(page: number = 1, limit: number = 10, status?: string): Promise<SchedulablePosts> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await apiRequest(`scheduler/scheduled?${params}`);
    const data = await response.json();
    return data.data;
  }

  // Get posts that can be scheduled
  async getSchedulablePosts(page: number = 1, limit: number = 10, status?: string): Promise<SchedulablePosts> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (status) {
      params.append('status', status);
    }

    const response = await apiRequest(`scheduler/schedulable?${params}`);
    const data = await response.json();
    return data.data;
  }

  // Schedule a post
  async schedulePost(postId: number, scheduleData: ScheduleRequest): Promise<ScheduleResponse> {
    const response = await apiRequest(`scheduler/schedule/${postId}`, {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
    return await response.json();
  }

  // Reschedule a post
  async reschedulePost(postId: number, scheduleData: ScheduleRequest): Promise<ScheduleResponse> {
    const response = await apiRequest(`scheduler/reschedule/${postId}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
    return await response.json();
  }

  // Cancel scheduled post
  async cancelSchedule(postId: number, notes?: string): Promise<ScheduleResponse> {
    const response = await apiRequest(`scheduler/cancel/${postId}`, {
      method: 'DELETE',
      body: JSON.stringify({ notes }),
    });
    return await response.json();
  }

  // Get schedule history for a post
  async getScheduleHistory(postId: number): Promise<ScheduleInfo[]> {
    const response = await apiRequest(`scheduler/history/${postId}`);
    const data = await response.json();
    return data.data;
  }

  // Manually trigger publishing (for testing)
  async publishNow(): Promise<ScheduleResponse> {
    const response = await apiRequest('scheduler/publish-now', {
      method: 'POST',
    });
    return await response.json();
  }

  // Force publish a specific post immediately
  async forcePublishPost(postId: number): Promise<ScheduleResponse> {
    const response = await apiRequest(`scheduler/force-publish/${postId}`, {
      method: 'POST',
    });
    return await response.json();
  }
}

export const schedulerAPI = new SchedulerAPI();
export default schedulerAPI;
