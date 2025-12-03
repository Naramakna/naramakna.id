import { useCallback } from 'react';
import * as analytics from '../utils/analytics';

export const useAnalytics = () => {
  const trackArticleRead = useCallback((articleData: {
    title: string;
    slug: string;
    category: string;
    author: string;
    readTime?: string;
  }) => {
    analytics.trackArticleRead(articleData);
  }, []);

  const trackVideoPlay = useCallback((videoData: {
    title: string;
    videoId: string;
    platform: 'tiktok' | 'youtube';
    duration?: number;
  }) => {
    analytics.trackVideoPlay(videoData);
  }, []);

  const trackSearch = useCallback((searchTerm: string, resultsCount?: number) => {
    analytics.trackSearch(searchTerm, resultsCount);
  }, []);

  const trackEngagement = useCallback((
    action: 'like' | 'share' | 'comment' | 'download',
    contentType: 'article' | 'video',
    contentId: string,
    contentTitle?: string
  ) => {
    analytics.trackEngagement(action, contentType, contentId, contentTitle);
  }, []);

  const trackSocialShare = useCallback((
    platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'copy_link',
    contentTitle: string,
    contentUrl: string
  ) => {
    analytics.trackSocialShare(platform, contentTitle, contentUrl);
  }, []);

  return {
    trackArticleRead,
    trackVideoPlay,
    trackSearch,
    trackEngagement,
    trackSocialShare
  };
};