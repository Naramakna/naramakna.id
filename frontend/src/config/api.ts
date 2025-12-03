// API Configuration
export const API_CONFIG = {
  // Determine base URL based on environment
  BASE_URL: (() => {
    // Check for environment variable first
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // In production, use relative path
    return '/api';
  })(),
  
  // Backend base URL for uploads and other resources
  BACKEND_URL: (() => {
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL;
    }
    
    // In production, use current domain
    return window.location.origin;
  })(),
  
  // Uploads base URL
  UPLOADS_URL: (() => {
    if (import.meta.env.VITE_UPLOADS_BASE_URL) {
      return import.meta.env.VITE_UPLOADS_BASE_URL;
    }
    
    // In production, use relative path
    return '/uploads';
  })(),
  
  // Request defaults
  DEFAULTS: {
    TIMEOUT: 10000, // 10 seconds
    HEADERS: {
      'Content-Type': 'application/json',
    }
  }
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

// Helper function to build upload URLs
export const buildUploadsUrl = (path: string): string => {
  const baseUrl = API_CONFIG.UPLOADS_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanPath}`;
};

// Helper function to build backend URLs
export const buildBackendUrl = (path: string): string => {
  const baseUrl = API_CONFIG.BACKEND_URL.replace(/\/$/, ''); // Remove trailing slash
  const cleanPath = path.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanPath}`;
};

// Export for easy import
export const API_BASE_URL = API_CONFIG.BASE_URL;
export const BACKEND_URL = API_CONFIG.BACKEND_URL;
export const UPLOADS_URL = API_CONFIG.UPLOADS_URL;