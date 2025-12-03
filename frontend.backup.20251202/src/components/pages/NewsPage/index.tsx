// src/components/pages/NewsPage/index.tsx
import React from 'react';
import ArticleLayout from '../../layouts/ArticleLayout';

const NewsPage: React.FC = () => {
  const sidebarContent = (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-4">Trending Topics</h3>
        <div className="space-y-3">
          {['Politik Terkini', 'Ekonomi Indonesia', 'Teknologi AI', 'Olahraga'].map((topic, index) => (
            <a key={index} href="#" className="block text-sm text-gray-600 hover:text-blue-600">
              #{topic}
            </a>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-4">Berita Populer</h3>
        <div className="space-y-4">
          {Array.from({length: 3}).map((_, index) => (
            <div key={index} className="border-b border-gray-200 pb-3 last:border-0">
              <h4 className="text-sm font-medium text-gray-800 mb-1">
                Berita Populer #{index + 1}
              </h4>
              <p className="text-xs text-gray-600">
                Lorem ipsum dolor sit amet consectetur...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ArticleLayout sidebar={sidebarContent}>
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Halaman Berita
        </h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            Ini adalah contoh halaman berita menggunakan ArticleLayout. 
            Layout ini memiliki sidebar yang sticky dan responsive.
          </p>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Fitur ArticleLayout
          </h2>
          
          <ul className="text-gray-600 space-y-2 mb-6">
            <li>• Layout 2 kolom dengan sidebar sticky</li>
            <li>• Responsive design untuk mobile</li>
            <li>• Sidebar tersembunyi pada mobile</li>
            <li>• Container yang terpusat dengan padding optimal</li>
          </ul>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tips:</strong> Sidebar akan menjadi sticky ketika di-scroll, 
              memberikan pengalaman reading yang lebih baik untuk artikel panjang.
            </p>
          </div>
        </div>
      </div>
    </ArticleLayout>
  );
};

export default NewsPage;