import React, { useState, useEffect } from 'react';
import { CarouselItem } from '../../atoms/CarouselItem';

interface CarouselArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  isFeatured?: boolean;
}

interface CarouselProps {
  articles: CarouselArticle[];
  className?: string;
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

export const Carousel: React.FC<CarouselProps> = ({
  articles,
  className = '',
  autoSlide = true,
  autoSlideInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === articles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? articles.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === articles.length - 1 ? 0 : prevIndex + 1
      );
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, articles.length]);

  // Reset to first slide when articles change
  useEffect(() => {
    setCurrentIndex(0);
  }, [articles]);

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div className="relative overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {articles.map((article, index) => (
            <div key={article.id} className="w-full flex-shrink-0">
              <CarouselItem
                title={article.title}
                source={article.source}
                timeAgo={article.timeAgo}
                imageSrc={article.imageSrc}
                href={article.href}
                isFeatured={true}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Only show if more than 1 article */}
        {articles.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {articles.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-white' 
                      : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 