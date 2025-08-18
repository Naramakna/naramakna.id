/**
 * URL Utilities for proper image URL handling
 */

/**
 * Generate proper image URL with correct path handling
 * @param {string} relativePath - Relative path to image file
 * @param {string} baseUrl - Base URL (default from env)
 * @returns {string} - Proper absolute URL
 */
function generateImageUrl(relativePath, baseUrl = null) {
  if (!relativePath) return null;
  
  const uploadsUrl = baseUrl || process.env.UPLOADS_URL || 'https://benarmak.naramakna.id/uploads';
  
  // If already a full URL, return as is (but fix double paths)
  if (relativePath.startsWith('http')) {
    return cleanUrl(relativePath);
  }
  
  // Remove leading slash if exists
  const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;
  
  // Remove 'uploads/' prefix if it exists (to prevent double uploads path)
  const finalPath = cleanPath.startsWith('uploads/') ? cleanPath.substring(8) : cleanPath;
  
  // Combine base URL with clean path
  const fullUrl = `${uploadsUrl}/${finalPath}`;
  
  return cleanUrl(fullUrl);
}

/**
 * Clean URL to remove double slashes and fix common issues
 * @param {string} url - URL to clean
 * @returns {string} - Cleaned URL
 */
function cleanUrl(url) {
  if (!url) return url;
  
  // Fix double uploads paths
  let cleanedUrl = url.replace(/\/uploads\/uploads\//g, '/uploads/');
  
  // Fix double slashes (but keep protocol slashes)
  cleanedUrl = cleanedUrl.replace(/([^:]\/)\/+/g, '$1');
  
  return cleanedUrl;
}

/**
 * Extract filename from image URL or path
 * @param {string} imageUrl - Image URL or path
 * @returns {string} - Filename only
 */
function extractFilename(imageUrl) {
  if (!imageUrl) return null;
  
  const cleanedUrl = cleanUrl(imageUrl);
  return cleanedUrl.split('/').pop();
}

/**
 * Check if URL is a local upload path
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a local upload
 */
function isLocalUpload(url) {
  if (!url) return false;
  
  return url.includes('/uploads/') && 
         !url.startsWith('http') || 
         url.includes('localhost') || 
         url.includes('.ngrok');
}

/**
 * Convert any image URL to proper production URL
 * @param {string} imageUrl - Original image URL
 * @param {string} newBaseUrl - New base URL to use
 * @returns {string} - Converted URL
 */
function convertToProductionUrl(imageUrl, newBaseUrl = null) {
  if (!imageUrl) return imageUrl;
  
  const baseUrl = newBaseUrl || process.env.UPLOADS_URL || 'https://benarmak.naramakna.id/uploads';
  
  // If it's already a proper production URL, just clean it
  if (imageUrl.startsWith(baseUrl)) {
    return cleanUrl(imageUrl);
  }
  
  // Extract the relative path from various URL formats
  let relativePath = imageUrl;
  
  // Remove domain and protocol
  if (relativePath.includes('://')) {
    const urlParts = relativePath.split('/');
    const uploadsIndex = urlParts.findIndex(part => part === 'uploads');
    if (uploadsIndex !== -1 && uploadsIndex < urlParts.length - 1) {
      relativePath = urlParts.slice(uploadsIndex + 1).join('/');
    }
  } else if (relativePath.startsWith('/uploads/')) {
    // Remove /uploads/ prefix
    relativePath = relativePath.substring(9);
  } else if (relativePath.startsWith('uploads/')) {
    // Remove uploads/ prefix
    relativePath = relativePath.substring(8);
  }
  
  return generateImageUrl(relativePath, baseUrl);
}

/**
 * Validate if image URL is accessible
 * @param {string} imageUrl - URL to validate
 * @returns {Promise<boolean>} - True if accessible
 */
async function validateImageUrl(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith('http')) return false;
  
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

module.exports = {
  generateImageUrl,
  cleanUrl,
  extractFilename,
  isLocalUpload,
  convertToProductionUrl,
  validateImageUrl
};