// TikTok integration types

export interface TikTokProfile {
  open_id: string;
  union_id?: string;
  avatar_url: string;
  display_name: string;
  bio_description?: string;
  profile_deep_link?: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

export interface TikTokVideo {
  id: string;
  create_time: number;
  cover_image_url: string;
  share_url: string;
  video_description?: string;
  duration: number;
  height: number;
  width: number;
  title?: string;
  embed_html?: string;
  embed_link?: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

export interface TikTokVideoListResponse {
  videos: TikTokVideo[];
  cursor: string;
  has_more: boolean;
}

export interface TikTokAuthResponse {
  success: boolean;
  authURL?: string;
  message: string;
  profile?: {
    display_name: string;
    avatar_url: string;
    follower_count: number;
    video_count: number;
  };
}

export interface TikTokSyncResponse {
  success: boolean;
  message: string;
  stats: {
    totalFetched: number;
    totalFiltered: number;
    savedCount: number;
    errorCount: number;
  };
  errors?: Array<{
    videoId: string;
    error: string;
  }>;
}

export interface TikTokStatusResponse {
  success: boolean;
  connected: boolean;
  rateLimitRemaining: number;
  message: string;
}

export interface TikTokContent {
  ID: number;
  post_title: string;
  post_content: string;
  post_name: string;
  post_type: string;
  post_status: string;
  post_date: string;
  guid: string;
  metadata: {
    external_id: string;
    tiktok_author_username: string;
    tiktok_author_display_name: string;
    tiktok_play_count: string;
    tiktok_like_count: string;
    tiktok_share_count: string;
    tiktok_comment_count: string;
    tiktok_cover_url: string;
    source_url: string;
  };
}

export interface TikTokContentResponse {
  success: boolean;
  content: TikTokContent[];
}

// Untuk trending section integration
export interface TikTokTrendingItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  type: 'tiktok';
  metadata: {
    likes: number;
    views: number;
    author: string;
    duration: number;
  };
}

// API service types
export interface TikTokAPIService {
  getAuthURL(): Promise<TikTokAuthResponse>;
  handleCallback(code: string, state: string): Promise<TikTokAuthResponse>;
  getProfile(): Promise<{ success: boolean; profile: TikTokProfile }>;
  getVideos(cursor?: string, maxId?: string): Promise<{ success: boolean } & TikTokVideoListResponse>;
  syncContent(): Promise<TikTokSyncResponse>;
  getStatus(): Promise<TikTokStatusResponse>;
  disconnect(): Promise<{ success: boolean; message: string }>;
  getContent(limit?: number, offset?: number): Promise<TikTokContentResponse>;
}

// Hook types
export interface UseTikTokOptions {
  autoSync?: boolean;
  syncInterval?: number;
}

export interface UseTikTokReturn {
  profile: TikTokProfile | null;
  videos: TikTokVideo[];
  content: TikTokContent[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  authURL: string | null;
  stats: {
    rateLimitRemaining: number;
    lastSync?: Date;
  };
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  syncContent: () => Promise<void>;
  getVideos: (cursor?: string) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

// Component props
export interface TikTokEmbedProps {
  videoId: string;
  width?: number;
  height?: number;
  autoplay?: boolean;
  className?: string;
}

export interface TikTokVideoCardProps {
  video: TikTokContent;
  onClick?: (video: TikTokContent) => void;
  showStats?: boolean;
  compact?: boolean;
}
