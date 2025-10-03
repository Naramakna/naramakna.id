import { buildApiUrl } from '../../config/api';

export interface YouTubeVideo {
  id: number;
  title: string;
  description?: string;
  youtube_video_id: string;
  youtube_channel_name?: string;
  thumbnail_url?: string;
  duration?: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const youtubeAPI = {
  // Get all YouTube videos
  async getVideos(): Promise<ApiResponse<YouTubeVideo[]>> {
    const response = await fetch(buildApiUrl('youtube'));
    return await response.json();
  },

  // Get YouTube video by ID
  async getVideoById(id: number): Promise<ApiResponse<YouTubeVideo>> {
    const response = await fetch(buildApiUrl(`youtube/${id}`));
    return await response.json();
  },

  // Create new YouTube video (admin only)
  async createVideo(videoData: Partial<YouTubeVideo>): Promise<ApiResponse<YouTubeVideo>> {
    const response = await fetch(buildApiUrl('youtube'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(videoData)
    });
    return await response.json();
  },

  // Update YouTube video (admin only)
  async updateVideo(id: number, videoData: Partial<YouTubeVideo>): Promise<ApiResponse<YouTubeVideo>> {
    const response = await fetch(buildApiUrl(`youtube/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(videoData)
    });
    return await response.json();
  },

  // Delete YouTube video (admin only)
  async deleteVideo(id: number): Promise<ApiResponse<void>> {
    const response = await fetch(buildApiUrl(`youtube/${id}`), {
      method: 'DELETE',
      credentials: 'include'
    });
    return await response.json();
  }
};