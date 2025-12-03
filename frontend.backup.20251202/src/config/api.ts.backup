// API Configuration
export const API_CONFIG = {
  // Determine base URL based on environment
  BASE_URL: (() => {
    // Check for custom environment variable first
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    
    // In development
    if (import.meta.env.DEV) {
      // Try common backend ports in order of preference
      return 'http://localhost:3001/api';
    }
    
    // In production, use relative path
    return '/api';
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

// Export for easy import
export const API_BASE_URL = API_CONFIG.BASE_URL;