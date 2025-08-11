// Komponen untuk embed video TikTok
import React, { useEffect, useRef, useState } from 'react';
import { tiktokExternalAPI } from '../../../services/external/tiktokAPI';
import type { TikTokEmbedProps } from '../../../types/tiktok';

export const TikTokEmbed: React.FC<TikTokEmbedProps> = ({
  videoId,
  width = 325,
  height = 738,
  autoplay = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [embedLoaded, setEmbedLoaded] = useState(false);

  useEffect(() => {
    const loadEmbed = async () => {
      if (!videoId || !tiktokExternalAPI.isValidVideoId(videoId)) {
        setError('Invalid TikTok video ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Check if embeds are supported
        if (!tiktokExternalAPI.isEmbedSupported()) {
          throw new Error('TikTok embeds are not supported in this browser');
        }

        // Load the TikTok embed script
        await tiktokExternalAPI.loadEmbedScript();

        // Generate embed HTML
        const embedHTML = tiktokExternalAPI.generateEmbedHTML(videoId, {
          width,
          height,
          cite: `https://www.tiktok.com/video/${videoId}`
        });

        // Insert embed into container
        if (containerRef.current) {
          containerRef.current.innerHTML = embedHTML;
          
          // Trigger TikTok embed processing if script is loaded
          if (window.tiktokEmbedLoaded && (window as any).TikTokEmbed) {
            (window as any).TikTokEmbed.loadEmbeds();
          }
        }

        setEmbedLoaded(true);
        setIsLoading(false);
      } catch (err: any) {
        console.error('TikTok embed error:', err);
        setError(err.message || 'Failed to load TikTok video');
        setIsLoading(false);
      }
    };

    loadEmbed();
  }, [videoId, width, height]);

  // Fallback component for when embed fails
  const renderFallback = () => {
    const videoUrl = `https://www.tiktok.com/video/${videoId}`;
    
    return (
      <div 
        className={`flex flex-col items-center justify-center bg-gray-100 rounded-lg border ${className}`}
        style={{ width, height: Math.min(height, 400) }}
      >
        <div className="text-center p-4">
          <div className="mb-3">
            <svg 
              className="w-12 h-12 text-gray-400 mx-auto" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          {error && (
            <p className="text-sm text-red-600 mb-3">{error}</p>
          )}
          
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-lg hover:bg-pink-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.589 6.686a4.793 4.793 0 01-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 01-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 013.183-4.51v-3.5a6.329 6.329 0 00-5.394 10.692 6.33 6.33 0 10 10.925-4.424V8.687a8.182 8.182 0 004.6 1.435 8.25 8.25 0 00.11-3.436z"/>
            </svg>
            Lihat di TikTok
          </a>
        </div>
      </div>
    );
  };

  // Loading component
  const renderLoading = () => (
    <div 
      className={`flex items-center justify-center bg-gray-50 rounded-lg border animate-pulse ${className}`}
      style={{ width, height: Math.min(height, 400) }}
    >
      <div className="text-center">
        <svg 
          className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="text-sm text-gray-500">Loading TikTok video...</p>
      </div>
    </div>
  );

  // Main render
  if (isLoading) {
    return renderLoading();
  }

  if (error || !embedLoaded) {
    return renderFallback();
  }

  return (
    <div 
      ref={containerRef}
      className={`tiktok-embed-container ${className}`}
      style={{ 
        width: 'fit-content',
        maxWidth: width,
        margin: '0 auto'
      }}
    />
  );
};
