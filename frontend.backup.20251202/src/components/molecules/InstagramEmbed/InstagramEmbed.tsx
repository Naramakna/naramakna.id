import React, { useEffect, useRef, useState } from 'react';

interface InstagramEmbedProps {
  url: string;
  className?: string;
}

export const InstagramEmbed: React.FC<InstagramEmbedProps> = ({ url, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);

  // Extract post ID from Instagram URL
  const getInstagramEmbedCode = (instagramUrl: string) => {
    // Handle various Instagram URL formats
    let postId = '';
    
    // Format: https://www.instagram.com/p/POST_ID/
    const matches = instagramUrl.match(/\/p\/([A-Za-z0-9_-]+)/);
    if (matches) {
      postId = matches[1];
    } else {
      // Handle other formats if needed
      console.warn('Could not extract Instagram post ID from URL:', instagramUrl);
      return null;
    }

    return `https://www.instagram.com/p/${postId}/embed/`;
  };

  useEffect(() => {
    const embedUrl = getInstagramEmbedCode(url);
    if (!embedUrl || !embedRef.current) return;

    // Create iframe for Instagram embed
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.width = '100%';
    iframe.height = '600';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.allowTransparency = true;
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';

    // Handle load events
    iframe.onload = () => {
      setIsLoading(false);
    };

    iframe.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };

    // Clear existing content and append iframe
    embedRef.current.innerHTML = '';
    embedRef.current.appendChild(iframe);

    // Cleanup
    return () => {
      if (embedRef.current) {
        embedRef.current.innerHTML = '';
      }
    };
  }, [url]);

  if (hasError) {
    return (
      <div className={`instagram-embed-error bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
        <div className="flex flex-col items-center space-y-3">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-gray-900 font-medium">Gagal memuat postingan Instagram</h3>
            <p className="text-gray-600 text-sm mt-1">
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Lihat postingan di Instagram
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`instagram-embed-container ${className}`}>
      {isLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
            <p className="text-gray-600 text-sm">Memuat postingan Instagram...</p>
          </div>
        </div>
      )}
      
      <div 
        ref={embedRef} 
        className={`instagram-embed w-full max-w-lg mx-auto ${isLoading ? 'hidden' : ''}`}
      />
      
      {!isLoading && !hasError && (
        <div className="text-center mt-3">
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Lihat di Instagram
          </a>
        </div>
      )}
    </div>
  );
};
