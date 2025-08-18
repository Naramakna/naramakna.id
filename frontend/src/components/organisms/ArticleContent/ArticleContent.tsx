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
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  title: _title,
  featuredImage
}) => {
  
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
      // Enhance image tags with captions
      .replace(
        /<img([^>]+)>/g,
        (match, attributes) => {
          const srcMatch = attributes.match(/src="([^"]+)"/);
          const altMatch = attributes.match(/alt="([^"]*)"/);
          const titleMatch = attributes.match(/title="([^"]*)"/);
          
          if (srcMatch) {
            const src = srcMatch[1];
            const alt = altMatch ? altMatch[1] : '';
            const caption = titleMatch ? titleMatch[1] : '';
            
            return `<div data-enhanced-image='{"src":"${src}","alt":"${alt}","caption":"${caption}"}'></div>`;
          }
          return match;
        }
      );

    return (
      <div className="prose prose-lg max-w-none">
        <div 
          className="
            prose-headings:font-bold prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-justify
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-justify
            prose-ul:space-y-2 prose-ol:space-y-2
            prose-li:text-gray-700 prose-li:text-justify
            text-justify
          "
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
      </div>
    );
  };

  // Render Instagram embeds and enhanced images for a content part
  const renderContentExtras = (htmlContent: string) => {
    return (
      <>
        {/* Render Instagram embeds */}
        {(() => {
          const instagramMatches = htmlContent.match(/https:\/\/www\.instagram\.com\/p\/[A-Za-z0-9_-]+\/?/g);
          return instagramMatches?.map((url, index) => (
            <InstagramEmbed key={`instagram-${index}`} url={url} className="my-8" />
          ));
        })()}
        
        {/* Render enhanced images */}
        {(() => {
          const imageMatches = htmlContent.match(/<img[^>]+>/g);
          return imageMatches?.map((imgTag, index) => {
            const srcMatch = imgTag.match(/src="([^"]+)"/);
            const altMatch = imgTag.match(/alt="([^"]*)"/);
            const titleMatch = imgTag.match(/title="([^"]*)"/);
            
            if (srcMatch) {
              const src = srcMatch[1];
              const alt = altMatch ? altMatch[1] : '';
              const caption = titleMatch ? titleMatch[1] : '';
              
              return (
                <ImageWithCaption
                  key={`image-${index}`}
                  src={src}
                  alt={alt}
                  caption={caption}
                  className="my-8"
                />
              );
            }
            return null;
          });
        })()}
      </>
    );
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Featured Image - Kumparan Style */}
      {featuredImage && (
        <div className="mb-8">
          <div className="relative overflow-hidden rounded-lg">
            <img 
              src={featuredImage.url}
              alt={featuredImage.alt || 'Featured image'}
              className="w-full h-auto object-cover"
              style={{ maxHeight: '600px' }}
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
        {(() => {
          const { firstHalf, secondHalf } = splitContentForAd(content);
          
          return (
            <>
              {/* First Half of Content */}
              <div className="content-part-1">
                {renderContentPart(firstHalf)}
                {renderContentExtras(firstHalf)}
              </div>
              
              {/* Middle Ad - Regular Size */}
              <div className="my-8 flex justify-center">
                <AdSection 
                  placement="content-middle" 
                  size="regular" 
                  rotationInterval={5000}
                />
              </div>
              
              {/* Second Half of Content */}
              <div className="content-part-2">
                {renderContentPart(secondHalf)}
                {renderContentExtras(secondHalf)}
              </div>
            </>
          );
        })()}
      </div>

      {/* Content Advertisement */}
      <div className="my-12">
        <AdSection 
          placement="content-ad" 
          size="header" 
          rotationInterval={7000}
        />
      </div>


      {/* Follow Us Section */}
      <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ikuti Naramakna.id di Media Sosial
          </h3>
          <p className="text-gray-600 mb-6">
            Dapatkan update berita terbaru dan konten menarik lainnya
          </p>
          <div className="flex justify-center">
            <SocialMediaLinks showLabels={true} size="lg" />
          </div>
        </div>
      </div>
    </article>
  );
};
