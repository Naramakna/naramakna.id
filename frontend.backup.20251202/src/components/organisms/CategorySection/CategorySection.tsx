import React from 'react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  imageSrc?: string;
  isAd?: boolean;
}

interface CategorySectionProps {
  newsItems?: NewsItem[];
  trendingItems?: NewsItem[];
  latestItems?: NewsItem[];
  className?: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  newsItems = [],
  trendingItems = [],
  latestItems = [],
  className = ''
}) => {
  // Dummy data untuk News (left column)
  const defaultNewsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Perjalanan eFishery: Dari Startup Sederhana, Jadi Unicorn lalu Kolaps',
      source: 'kumparanNEWS',
      timeAgo: '51 menit'
    }
  ];

  // Dummy data untuk Trending (middle column)
  const defaultTrendingItems: NewsItem[] = [
    {
      id: '1',
      title: 'Mutasi Pejabat Polri: Komjen Syahardiantono Jadi Kabareskrim',
      source: 'kumparanNEWS',
      timeAgo: '5 jam'
    },
    {
      id: '2',
      title: 'Hasil Autopsi Jasad Paskibra Terkubur Tanpa Busana di Madina: Mati Lemas',
      source: 'kumparanNEWS',
      timeAgo: '12 jam'
    },
    {
      id: '3',
      title: 'Panser Anoa TNI Bersiaga di Kejagung, Ada Apa?',
      source: 'kumparanNEWS',
      timeAgo: '3 jam'
    }
  ];

  // Dummy data untuk Latest (right column)
  const defaultLatestItems: NewsItem[] = [
    {
      id: '1',
      title: 'Berhadiah Ratusan Juta, AHM Best Student Ajak Gen Z Buat Inovasi di...',
      source: 'kumparanNEWS',
      timeAgo: '2 jam',
      isAd: true
    },
    {
      id: '2',
      title: 'LocknLock Perkuat Posisi Brand Tumbler, Hadirkan Pop-up store ke-3 di BXC 2',
      source: 'kumparanNEWS',
      timeAgo: '37 menit'
    },
    {
      id: '3',
      title: 'Gus Ipul: Sekolah Rakyat Miniatur Pengentasan Kemiskinan Terpadu',
      source: 'kumparanNEWS',
      timeAgo: '1 jam'
    }
  ];

  const displayNewsItems = newsItems.length > 0 ? newsItems : defaultNewsItems;
  const displayTrendingItems = trendingItems.length > 0 ? trendingItems : defaultTrendingItems;
  const displayLatestItems = latestItems.length > 0 ? latestItems : defaultLatestItems;

  const NewsItemComponent = ({ item }: { item: NewsItem }) => {
    const handleClick = () => {
      if (item.href) {
        window.location.href = item.href;
      }
    };

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-200" onClick={handleClick}>
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
        {item.imageSrc ? (
          <img 
            src={item.imageSrc} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center">
            <div className="text-gray-500 text-xs">Image</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {item.title}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-600">{item.source}</span>
          {item.isAd && (
            <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">Ad</span>
          )}
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-500">{item.timeAgo}</span>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className={`bg-gray-50 py-8 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* News Column (Left) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">News</h2>
              </div>
            </div>
            <div className="p-4">
              {displayNewsItems.map((item) => (
                <NewsItemComponent key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Trending Column (Middle) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Populer di News</h2>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {displayTrendingItems.map((item) => (
                <NewsItemComponent key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Latest Column (Right) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-1 h-6 bg-teal-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-900">Terbaru di News</h2>
              </div>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {displayLatestItems.map((item) => (
                <NewsItemComponent key={item.id} item={item} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}; 