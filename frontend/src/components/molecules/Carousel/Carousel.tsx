import React, { useState, useEffect } from 'react';
import { CarouselItem } from '../../atoms/CarouselItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselArticle {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  href?: string;
  isFeatured?: boolean;
  views?: number;
}

interface CarouselProps {
  articles: CarouselArticle[];
  className?: string;
  autoSlide?: boolean;
  autoSlideInterval?: number;
  showDots?: boolean;
}

export const Carousel: React.FC<CarouselProps> = ({
  articles,
  className = '',
  autoSlide = true,
  autoSlideInterval = 5000,
  showDots = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    if (!articles || articles.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === articles.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    if (!articles || articles.length === 0) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? articles.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (!autoSlide || !articles || articles.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === articles.length - 1 ? 0 : prevIndex + 1
      );
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [autoSlide, autoSlideInterval, articles]);

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
          {articles.map((article, _index) => (
            <div key={article.id} className="w-full flex-shrink-0">
              <CarouselItem
                title={article.title}
                source={article.source}
                timeAgo={article.timeAgo}
                imageSrc={article.imageSrc}
                href={article.href}
                isFeatured={true}
                views={article.views}
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Only show if more than 1 article */}
        {articles && articles.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1 md:p-2 rounded-full transition-all duration-200 z-10"
            >
              <ChevronLeft className="w-4 h-4 md:w-6 md:h-6" />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-1 md:p-2 rounded-full transition-all duration-200 z-10"
            >
              <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
            </button>

            {/* Dots Indicator */}
            {showDots && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hidden md:flex space-x-2 z-10">
                {articles.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToSlide(index);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 