const isDevelopment = import.meta.env.DEV;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function buildApiUrl(endpoint: string = ''): string {
  // For production deployment, always use the domain
  const baseUrl = 'http://dev.naramakna.id';
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/api/${cleanEndpoint}`.replace(/\/+/g, '/').replace(/:\//g, '://');
}

// Export for debugging
export const API_CONFIG = {
  baseUrl: 'http://dev.naramakna.id',
  isDevelopment,
  fullApiUrl: buildApiUrl()
};

console.log('🔧 API Config loaded:', API_CONFIG);
