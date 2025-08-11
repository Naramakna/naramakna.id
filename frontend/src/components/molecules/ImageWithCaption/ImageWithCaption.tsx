import React, { useState } from 'react';

interface ImageWithCaptionProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  showZoom?: boolean;
}

export const ImageWithCaption: React.FC<ImageWithCaptionProps> = ({
  src,
  alt,
  caption,
  className = '',
  showZoom = true
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <figure className={`my-8 ${className}`}>
        <div className="relative group overflow-hidden rounded-lg">
          <img 
            src={src}
            alt={alt}
            className="w-full h-auto object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105"
            onClick={showZoom ? openModal : undefined}
          />
          
          {/* Zoom indicator on hover */}
          {showZoom && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-md text-sm flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  <span>Perbesar</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Caption */}
        {caption && (
          <figcaption className="text-sm text-gray-600 mt-3 leading-relaxed italic text-center">
            {caption}
          </figcaption>
        )}
      </figure>

      {/* Modal for zoomed image */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={src}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Caption in modal */}
            {caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-center">
                <p className="bg-black bg-opacity-50 px-4 py-2 rounded-lg text-sm">
                  {caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
