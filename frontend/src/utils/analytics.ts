/**
 * Google Analytics 4 Integration
 * Enhanced tracking for Naramakna.id
 */

declare global {
  interface Window {
    gtag: (command: string, targetId: string, config?: any) => void;
    dataLayer: any[];
  }
}

// Google Analytics Configuration
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-40CJJY40JM';

/**
 * Initialize Google Analytics
 */
export const initGA = (): void => {
  // Don't track in development
  if (import.meta.env.MODE !== 'production') {
    console.log('GA tracking disabled in development');
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // gtag function
  window.gtag = function(...args: any[]) {
    window.dataLayer.push(args);
  };

  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    custom_map: {
      custom_parameter_1: 'content_category',
      custom_parameter_2: 'article_author'
    }
  });

  console.log('Google Analytics initialized:', GA_MEASUREMENT_ID);
};

/**
 * Track page views
 */
export const trackPageView = (path: string, title?: string): void => {
  if (typeof window.gtag === 'undefined') return;

  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: title || document.title,
    page_location: window.location.origin + path
  });
};

/**
 * Track custom events
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
): void => {
  if (typeof window.gtag === 'undefined') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters
  });
};

/**
 * Track article reading events
 */
export const trackArticleRead = (articleData: {
  title: string;
  slug: string;
  category: string;
  author: string;
  readTime?: string;
}): void => {
  trackEvent('article_read', 'Content', articleData.title, undefined, {
    article_slug: articleData.slug,
    content_category: articleData.category,
    article_author: articleData.author,
    estimated_read_time: articleData.readTime
  });
};

/**
 * Track video interactions
 */
export const trackVideoPlay = (videoData: {
  title: string;
  videoId: string;
  platform: 'tiktok' | 'youtube';
  duration?: number;
}): void => {
  trackEvent('video_play', 'Media', videoData.title, undefined, {
    video_id: videoData.videoId,
    video_platform: videoData.platform,
    video_duration: videoData.duration
  });
};

/**
 * Track search events
 */
export const trackSearch = (searchTerm: string, resultsCount?: number): void => {
  trackEvent('search', 'Navigation', searchTerm, resultsCount, {
    search_term: searchTerm,
    results_count: resultsCount
  });
};

/**
 * Track user engagement
 */
export const trackEngagement = (
  action: 'like' | 'share' | 'comment' | 'download',
  contentType: 'article' | 'video',
  contentId: string,
  contentTitle?: string
): void => {
  trackEvent(action, 'Engagement', contentTitle || contentId, undefined, {
    content_type: contentType,
    content_id: contentId
  });
};

/**
 * Track navigation events
 */
export const trackNavigation = (
  destination: string,
  source?: string
): void => {
  trackEvent('navigation', 'User Flow', destination, undefined, {
    navigation_source: source,
    navigation_destination: destination
  });
};

/**
 * Track conversion events (newsletter signup, etc.)
 */
export const trackConversion = (
  conversionType: 'newsletter_signup' | 'contact_form' | 'subscription',
  value?: number
): void => {
  trackEvent('conversion', 'Goal', conversionType, value, {
    conversion_type: conversionType
  });
};

/**
 * Track errors
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  errorLocation?: string
): void => {
  trackEvent('exception', 'Error', errorType, undefined, {
    description: errorMessage,
    fatal: false,
    error_location: errorLocation
  });
};

/**
 * Track user timing (performance metrics)
 */
export const trackTiming = (
  name: string,
  value: number,
  category: string = 'Performance',
  label?: string
): void => {
  if (typeof window.gtag === 'undefined') return;

  window.gtag('event', 'timing_complete', {
    name: name,
    value: value,
    event_category: category,
    event_label: label
  });
};

/**
 * Track social media sharing
 */
export const trackSocialShare = (
  platform: 'facebook' | 'twitter' | 'whatsapp' | 'telegram' | 'copy_link',
  contentTitle: string,
  contentUrl: string
): void => {
  trackEvent('share', 'Social', platform, undefined, {
    content_title: contentTitle,
    content_url: contentUrl,
    social_platform: platform
  });
};

export default {
  initGA,
  trackPageView,
  trackEvent,
  trackArticleRead,
  trackVideoPlay,
  trackSearch,
  trackEngagement,
  trackNavigation,
  trackConversion,
  trackError,
  trackTiming,
  trackSocialShare
};