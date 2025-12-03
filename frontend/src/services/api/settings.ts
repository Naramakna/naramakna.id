import { buildApiUrl } from '../../config/api';

export interface PublicSettings {
  show_analytics_button: boolean;
  enable_polling: boolean;
  show_views_count: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export const settingsAPI = {
  // Get public settings (no auth required)
  async getPublicSettings(): Promise<ApiResponse<PublicSettings>> {
    const response = await fetch(buildApiUrl('settings/public'));
    return await response.json();
  }
};