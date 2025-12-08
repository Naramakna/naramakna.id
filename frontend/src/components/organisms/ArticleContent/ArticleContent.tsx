import React, { useEffect } from 'react';
import { SocialMediaLinks } from '../../molecules/SocialMediaLinks';
import { InstagramEmbed } from '../../molecules/InstagramEmbed';
import { ImageWithCaption } from '../../molecules/ImageWithCaption';
import { AdSection } from '../AdSection';

interface ArticleContentProps {
  content: string;
  title?: string;
  featuredImage?: {
    url: string;
    caption?: string;
    alt?: string;
  };
  imageCaptions?: Record<string, string>;
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  title: _title,
  featuredImage,
  imageCaptions = {}
}) => {
  
  // Debug logging
  console.log('🔍 ArticleContent Debug:', {
    hasContent: !!content,
    contentLength: content?.length,
    imageCaptions,
    imageCaptionsKeys: Object.keys(imageCaptions)
  });
  
  // Copy protection effect
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString();
        const watermark = `\n\nDibaca dari Naramakna.id: ${window.location.href}`;
        
        // Modify clipboard data
        e.clipboardData?.setData('text/plain', selectedText + watermark);
        e.preventDefault();
        
        // Show notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        notification.textContent = 'Teks disalin dengan sumber Naramakna.id';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 3000);
      }
    };

    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, []);

  // Text alignment and mobile image enhancement fix
  useEffect(() => {
    // Inject CSS untuk text alignment dan mobile image enhancement
    const style = document.createElement('style');
    style.id = 'article-text-alignment-fix';
    style.textContent = `
      /* Mobile first - rata kiri tanpa pemenggalan kata */
      .article-content-mobile-fix p,
      .article-content-mobile-fix blockquote,
      .article-content-mobile-fix li,
      .article-content-mobile-fix div {
        text-align: left !important;
        overflow: visible !important;
        hyphens: none !important;
        -webkit-hyphens: none !important;
        -moz-hyphens: none !important;
        word-spacing: normal !important;
        letter-spacing: normal !important;
        word-break: normal !important;
      }

      /* Desktop - justify */
      @media screen and (min-width: 640px) {
        .article-content-mobile-fix p,
        .article-content-mobile-fix blockquote,
        .article-content-mobile-fix li,
        .article-content-mobile-fix div {
          text-align: justify !important;
          overflow: visible !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          -moz-hyphens: none !important;
          word-break: normal !important;
        }
      }

      /* Indent support - preserve indent from Quill editor */
      .article-content .ql-indent-1 {
        padding-left: 3rem !important;
      }

      .article-content .ql-indent-2 {
        padding-left: 4.5rem !important;
      }

      .article-content .ql-indent-3 {
        padding-left: 6rem !important;
      }

      .article-content .ql-indent-4 {
        padding-left: 7.5rem !important;
      }

      .article-content .ql-indent-5 {
        padding-left: 9rem !important;
      }

      /* Mobile indent - minimal padding to prevent text overflow */
      @media screen and (max-width: 639px) {
        .article-content .ql-indent-1 {
          padding-left: 0.5rem !important;
        }

        .article-content .ql-indent-2 {
          padding-left: 0.75rem !important;
        }

        .article-content .ql-indent-3 {
          padding-left: 1rem !important;
        }

        .article-content .ql-indent-4 {
          padding-left: 1.25rem !important;
        }

        .article-content .ql-indent-5 {
          padding-left: 1.5rem !important;
        }
      }

      /* Prevent text overflow on mobile - tanpa pemenggalan kata */
      @media screen and (max-width: 639px) {
        .article-content p,
        .article-content div,
        .article-content blockquote,
        .article-content li {
          overflow-wrap: break-word !important;
          max-width: 100% !important;
          line-height: 1.8 !important;
          padding-bottom: 0.25rem !important;
          min-height: fit-content !important;
          text-align: left !important;
          text-align-last: left !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          word-break: normal !important;
        }

        /* Prevent long URLs or unbreakable text from overflowing */
        .article-content a {
          overflow-wrap: break-word !important;
        }

        /* Fix untuk prose typography di mobile */
        .prose p,
        .prose div,
        .prose li {
          line-height: 1.8 !important;
          min-height: fit-content !important;
          text-align: left !important;
          text-align-last: left !important;
          hyphens: none !important;
          -webkit-hyphens: none !important;
          word-break: normal !important;
        }
      }
      
      /* Override prose styles */
      .prose .article-content-mobile-fix p {
        text-align: left !important;
        text-align-last: left !important;
        overflow: visible !important;
        word-spacing: normal !important;
      }

      @media screen and (min-width: 640px) {
        .prose .article-content-mobile-fix p {
          text-align: justify !important;
          text-align-last: left !important;
          overflow: visible !important;
        }
      }

      /* Ensure all prose elements don't clip text */
      .prose,
      .prose p,
      .prose div,
      .prose li,
      .prose blockquote,
      .article-content,
      .article-content p,
      .article-content div {
        overflow: visible !important;
      }

      /* Mobile Image Enhancement - Membuat gambar lebih besar di mobile */
      @media screen and (max-width: 768px) {
        .article-content figure {
          margin-left: -1.5rem !important;
          margin-right: -1.5rem !important;
          width: calc(100% + 3rem) !important;
        }
        
        .article-content figure img {
          width: 100% !important;
          height: auto !important;
          border-radius: 0.5rem !important;
        }
        
        .article-content figure figcaption {
          margin-left: 1.5rem !important;
          margin-right: 1.5rem !important;
          padding-top: 0.75rem !important;
        }

        /* Featured image juga diperbesar */
        .mobile-featured-image {
          margin-left: -1.5rem !important;
          margin-right: -1.5rem !important;
          width: calc(100% + 3rem) !important;
        }

        .mobile-featured-image img {
          border-radius: 0.5rem !important;
        }
      }

      /* Tablet - sedikit lebih besar */
      @media screen and (min-width: 768px) and (max-width: 1024px) {
        .article-content figure {
          margin-left: -2rem !important;
          margin-right: -2rem !important;
          width: calc(100% + 4rem) !important;
        }
        
        .mobile-featured-image {
          margin-left: -2rem !important;
          margin-right: -2rem !important;
          width: calc(100% + 4rem) !important;
        }
      }
    `;
    
    // Remove existing style if any
    const existingStyle = document.getElementById('article-text-alignment-fix');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    document.head.appendChild(style);
    console.log('📱 CSS injected for text alignment');
    
    return () => {
      const styleToRemove = document.getElementById('article-text-alignment-fix');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, []);

  // Parse content and split for ad insertion
  const splitContentForAd = (rawContent: string) => {
    // Check if content is HTML or plain text
    const isHTML = /<[a-z][\s\S]*>/i.test(rawContent);
    
    let htmlContent = rawContent;
    
    // If plain text, convert to basic HTML with paragraph breaks
    if (!isHTML) {
      htmlContent = rawContent
        .split('\n\n')
        .filter(paragraph => paragraph.trim())
        .map(paragraph => `<p>${paragraph.trim().replace(/\n/g, '<br>')}</p>`)
        .join('\n');
    }
    
    // If content is empty or very short, return it as one piece
    if (!htmlContent || htmlContent.trim().length < 100) {
      return { 
        firstHalf: htmlContent, 
        secondHalf: '', 
        fullContent: htmlContent 
      };
    }
    
    // Split content roughly in half for ad placement
    const paragraphs = htmlContent.split('</p>').filter(p => p.trim());
    const midPoint = Math.floor(paragraphs.length / 2);
    
    const firstHalf = paragraphs.slice(0, midPoint).join('</p>') + (paragraphs.length > midPoint ? '</p>' : '');
    const secondHalf = paragraphs.slice(midPoint).join('</p>') + (paragraphs.length > midPoint ? '</p>' : '');
    
    return { firstHalf, secondHalf, fullContent: htmlContent };
  };

  // Parse content and render with proper styling, Instagram embeds, and enhanced images
  const renderContentPart = (rawContent: string) => {
    // Process content to handle Instagram embeds and enhanced images
    const processedContent = rawContent
      // Replace Instagram URLs with embed placeholders
      .replace(
        /https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\/?/g,
        (match) => `<div data-instagram-embed="${match}"></div>`
      )
      // Add 2-line caption section after each image
      .replace(
        /<img([^>]+)>/g,
        (match, attributes) => {
          const srcMatch = attributes.match(/src="([^"]+)"/);
          
          if (srcMatch) {
            const src = srcMatch[1];
            // Get caption from imageCaptions prop
            const caption = imageCaptions[src] || '';
            
            console.log('🖼️ Image Processing Debug:', {
              imageSrc: src,
              hasCaption: !!caption,
              caption: caption,
              allCaptionKeys: Object.keys(imageCaptions)
            });
            
            // Inject onerror fallback to placeholder if not present
            let newAttributes = attributes;
            if (!/onerror=/i.test(newAttributes)) {
              newAttributes = `${attributes} onerror="this.onerror=null;this.src='/images/placeholder-gallery.jpg'"`;
            }

            // Split caption into 2 lines if it exists
            const captionLines = caption ? caption.split('\n') : ['', ''];
            const line1 = captionLines[0] || '';
            const line2 = captionLines[1] || '';
            
            // Return image with 2-line caption section below
            return `
              <img${newAttributes}>
              <div class="caption-container w-full flex flex-col items-center justify-center mt-3 mb-6">
                <p class="text-sm text-gray-600 italic text-center leading-relaxed mx-auto">${line1}</p>
                <p class="text-sm text-gray-600 italic text-center leading-relaxed mx-auto">${line2}</p>
              </div>
              `;
          }
          return match;
        }
      );

    return (
      <div className="prose prose-lg max-w-none article-content">
        <div 
          className="
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic
            prose-ul:space-y-2
            prose-li:text-gray-700
            article-content-mobile-fix
          "
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>
    );
  };


  return (
    <article className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
      {/* Featured Image - Kumparan Style */}
      {featuredImage && (
        <div className="mb-8 mobile-featured-image">
          <div className="relative overflow-hidden rounded-lg">
            <img 
              src={featuredImage.url}
              alt={featuredImage.alt || 'Featured image'}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '600px' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/images/placeholder-gallery.jpg';
              }}
            />
            {/* Zoom button overlay - Kumparan style */}
            <button className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-2 rounded-md text-sm hover:bg-opacity-80 transition-all duration-200 flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
              <span>Perbesar</span>
            </button>
          </div>
          
          {/* Image Caption - Kumparan style */}
          {featuredImage.caption && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed italic">
              {featuredImage.caption}
            </p>
          )}
        </div>
      )}

      {/* Article Content */}
      <div className="article-content">
        {!content || content.trim().length === 0 ? (
          <div className="prose prose-lg max-w-none">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Konten artikel sedang dimuat atau tidak tersedia.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          (() => {
            const { firstHalf, secondHalf } = splitContentForAd(content);
            
            return (
              <>
                {/* First Half of Content */}
                <div className="content-part-1">
                  {renderContentPart(firstHalf)}
                  {/* Instagram embeds for first half */}
                  {(() => {
                    const instagramMatches = firstHalf.match(/https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\/?/g);
                    return instagramMatches?.map((url, index) => (
                      <InstagramEmbed key={`instagram-first-${index}`} url={url} className="my-8" />
                    ));
                  })()}
            </div>
                
                {/* Middle Ad - Regular Size - Only show if we have second half */}
                {secondHalf && (
                  <div className="my-8 flex justify-center">
                    <AdSection 
                      placement="article-ads" 
                      size="article" 
                      rotationInterval={5000}
                    />
                  </div>
                )}    
                
                {/* Second Half of Content */}
                {secondHalf && (
                  <div className="content-part-2">
                    {renderContentPart(secondHalf)}
                    {/* Instagram embeds for second half */}
                    {(() => {
                      const instagramMatches = secondHalf.match(/https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\/?/g);
                      return instagramMatches?.map((url, index) => (
                        <InstagramEmbed key={`instagram-second-${index}`} url={url} className="my-8" />
                      ));
                    })()}
                  </div>
                )}
              </>
            );
          })()
        )}
      </div>




      {/* Follow Us Section */}
      <div className="my-6 sm:my-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Ikuti Naramakna.id di Media Sosial
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 px-2">
            Dapatkan update berita terbaru dan konten menarik lainnya
          </p>
          <div className="flex flex-col items-center gap-2 sm:gap-3">
            <SocialMediaLinks showLabels={true} size="sm" className="sm:hidden" />
            <SocialMediaLinks showLabels={true} size="lg" className="hidden sm:flex" />
          </div>
        </div>
      </div>
    </article>
  );
};
