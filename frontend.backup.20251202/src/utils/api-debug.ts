// API Debug utilities
import { API_CONFIG, buildApiUrl } from '../config/api';

export const debugAPI = {
  // Show current API configuration
  showConfig() {
    console.group('🔧 API Configuration');
    console.log('Base URL:', API_CONFIG.BASE_URL);
    console.log('Environment:', import.meta.env.MODE);
    console.log('Custom API URL:', import.meta.env.VITE_API_URL);
    console.log('Is Development:', import.meta.env.DEV);
    console.groupEnd();
  },

  // Test API connection
  async testConnection() {
    console.group('🧪 Testing API Connection');
    
    try {
      const testUrl = buildApiUrl('');
      console.log('Testing URL:', testUrl);
      
      const response = await fetch(testUrl);
      const data = await response.json();
      
      console.log('✅ Connection successful!');
      console.log('Response:', data);
      console.groupEnd();
      return true;
    } catch (error) {
      console.error('❌ Connection failed!');
      console.error('Error:', error);
      console.groupEnd();
      return false;
    }
  },

  // Test specific endpoint
  async testEndpoint(endpoint: string) {
    console.group(`🎯 Testing endpoint: ${endpoint}`);
    
    try {
      const url = buildApiUrl(endpoint);
      console.log('Full URL:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('✅ Endpoint successful!');
      console.log('Status:', response.status);
      console.log('Data:', data);
      console.groupEnd();
      return data;
    } catch (error) {
      console.error('❌ Endpoint failed!');
      console.error('Error:', error);
      console.groupEnd();
      return null;
    }
  }
};

// Auto-run basic debug in development
if (import.meta.env.DEV) {
  // Show config on load
  debugAPI.showConfig();
  
  // Test connection after a short delay
  setTimeout(() => {
    debugAPI.testConnection();
  }, 1000);
}