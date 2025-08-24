const fs = require('fs');
const path = require('path');

/**
 * Convert image URL to WebP if WebP version exists
 * Falls back to original if WebP doesn't exist
 */
function getOptimalImageUrl(imageUrl, userAgent = '') {
    // Skip if already WebP
    if (imageUrl.endsWith('.webp')) {
        return imageUrl;
    }
    
    // Check if browser supports WebP (more permissive detection)
    const supportsWebP = userAgent.toLowerCase().includes('chrome') || 
                        userAgent.toLowerCase().includes('firefox') || 
                        userAgent.toLowerCase().includes('opera') || 
                        userAgent.toLowerCase().includes('edge') ||
                        userAgent.toLowerCase().includes('safari');
    
    if (!supportsWebP) {
        console.log('Browser does not support WebP:', userAgent);
        return imageUrl;
    }
    
    console.log('Browser supports WebP, checking for:', imageUrl);
    
    // Generate WebP URL
    const webpUrl = imageUrl.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Check if WebP file exists on disk
    try {
        // Handle both localhost and api.naramakna.id domains
        let urlPath;
        if (imageUrl.includes('api.naramakna.id') || imageUrl.includes('localhost')) {
            urlPath = new URL(imageUrl).pathname;
        } else {
            // If it's already a path, use as is
            urlPath = imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl;
        }
        
        const webpPath = urlPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const fullWebpPath = path.join('/var/www/naramakna.id/public', webpPath);
        
        console.log('Original URL:', imageUrl);
        console.log('Checking WebP path:', fullWebpPath);
        
        if (fs.existsSync(fullWebpPath)) {
            console.log('WebP found, returning:', webpUrl);
            return webpUrl;
        } else {
            console.log('WebP not found, keeping original');
        }
    } catch (error) {
        // Fallback to original URL if path parsing fails
        console.log('Image path parsing failed:', error.message);
    }
    
    return imageUrl;
}

/**
 * Process all image URLs in post data
 */
function optimizePostImages(postData, userAgent = '') {
    const optimized = { ...postData };
    
    // Optimize featured image / thumbnail
    if (optimized.featured_image) {
        optimized.featured_image = getOptimalImageUrl(optimized.featured_image, userAgent);
    }
    
    if (optimized.thumbnail) {
        optimized.thumbnail = getOptimalImageUrl(optimized.thumbnail, userAgent);
    }
    
    // Optimize metadata thumbnail URLs
    if (optimized.metadata && optimized.metadata.thumbnail_url) {
        optimized.metadata.thumbnail_url = getOptimalImageUrl(optimized.metadata.thumbnail_url, userAgent);
        optimized.metadata._thumbnail_url = optimized.metadata.thumbnail_url;
    }
    
    // Optimize images in post content
    if (optimized.post_content) {
        optimized.post_content = optimized.post_content.replace(
            /src="([^"]+\.(jpg|jpeg|png))"/gi,
            (match, imageUrl) => {
                const optimizedUrl = getOptimalImageUrl(imageUrl, userAgent);
                return `src="${optimizedUrl}"`;
            }
        );
    }
    
    return optimized;
}

module.exports = {
    getOptimalImageUrl,
    optimizePostImages
};