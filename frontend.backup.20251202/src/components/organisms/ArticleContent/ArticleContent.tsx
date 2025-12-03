import React from 'react';
import { SocialMediaLinks } from '../../molecules/SocialMediaLinks';
import { InstagramEmbed } from '../../molecules/InstagramEmbed';
import { ImageWithCaption } from '../../molecules/ImageWithCaption';
import { AdSection } from '../AdSection';

interface ArticleContentProps {
  content: string;
  featuredImage?: {
    url: string;
    caption?: string;
    alt?: string;
  };
}

export const ArticleContent: React.FC<ArticleContentProps> = ({
  content,
  featuredImage
}) => {
  // Parse content and render with proper styling, Instagram embeds, and enhanced images
  const renderContent = (rawContent: string) => {
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
    
    // Process content to handle Instagram embeds and enhanced images
    const processedContent = htmlContent
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
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:italic
            prose-ul:space-y-2 prose-ol:space-y-2
            prose-li:text-gray-700
          "
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />
        
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
      </div>
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
        {renderContent(content)}
      </div>

      {/* Content Advertisement */}
      <div className="my-12">
        <AdSection 
          placement="content-ad" 
          size="header" 
          rotationInterval={7000}
        />
      </div>

      {/* Breaking News Pre-Ad */}
      <div className="my-8">
        <AdSection 
          placement="breaking-pre" 
          size="regular" 
          rotationInterval={6000}
        />
      </div>

      {/* Breaking News Banner (like Kumparan) */}
      <div className="my-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-red-600 px-3 py-1 rounded font-bold text-sm">
              BREAKING NEWS
            </div>
            <span className="text-sm">
              Informasi penting disajikan secara kronologis
            </span>
          </div>
          <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm hover:bg-opacity-30 transition-colors">
            Lihat Breaking News
          </button>
        </div>
      </div>

      {/* Breaking News Post-Ad */}
      <div className="my-8">
        <AdSection 
          placement="breaking-post" 
          size="header" 
          rotationInterval={8000}
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
