import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../../config/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SingleCategorySectionProps {
  categorySlug: string;
  categoryName: string;
  className?: string;
}

interface CategoryPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  modified: string;
  author_name: string;
  author_id: number;
  featured_image?: string;
  slug?: string;
  view_count?: number;
}

// Support multiple response structures
type ApiResponse = 
  | { posts: CategoryPost[] }
  | { data: { posts: CategoryPost[] } }
  | CategoryPost[]
  | null;

export const SingleCategorySection: React.FC<SingleCategorySectionProps> = ({
  categorySlug,
  categoryName,
  className = ''
}) => {
  const [data, setData] = useState<ApiResponse>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    const fetchCategoryPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching category posts for:', categorySlug);
        const response = await fetch(buildApiUrl(`category/${categorySlug}/posts`));
        if (!response.ok) {
          throw new Error('Failed to fetch category posts');
        }
        const result = await response.json();
        console.log('API Response:', result);
        setData(result);
      } catch (err) {
        console.error('Error fetching category posts:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryPosts();
  }, [categorySlug]);

  // Auto-slide effect setiap 5 detik
  useEffect(() => {
    if (data) {
      let posts: CategoryPost[] = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if ('posts' in data && Array.isArray(data.posts)) {
        posts = data.posts;
      } else if ('data' in data && data.data && 'posts' in data.data && Array.isArray(data.data.posts)) {
        posts = data.data.posts;
      }

      if (posts.length > 1) {
        const interval = setInterval(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
        }, 5000); // 5 detik

        return () => clearInterval(interval);
      }
    }
  }, [data]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Baru saja';
    if (diffInHours < 24) return `${diffInHours} jam`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} hari`;
    
    return date.toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleClick = (slug: string) => {
    if (!isDragging) {
      window.location.href = `/artikel/${slug}`;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!startX || !startY) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    
    const diffX = Math.abs(currentX - startX);
    const diffY = Math.abs(currentY - startY);
    
    // If horizontal movement is greater than vertical, consider it a drag
    if (diffX > 10 && diffX > diffY) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!startX || !isDragging) {
      setStartX(0);
      setStartY(0);
      setIsDragging(false);
      return;
    }
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    // Swipe threshold
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide(); // Swipe left = next
      } else {
        prevSlide(); // Swipe right = previous  
      }
    }
    
    setStartX(0);
    setStartY(0);
    // Keep isDragging true for a moment to prevent click
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setStartY(e.clientY);
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!startX || !startY) return;
    
    const diffX = Math.abs(e.clientX - startX);
    const diffY = Math.abs(e.clientY - startY);
    
    if (diffX > 10 && diffX > diffY) {
      setIsDragging(true);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!startX || !isDragging) {
      setStartX(0);
      setStartY(0);
      setIsDragging(false);
      return;
    }
    
    const endX = e.clientX;
    const diffX = startX - endX;
    
    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    
    setStartX(0);
    setStartY(0);
    setTimeout(() => setIsDragging(false), 100);
  };

  const nextSlide = () => {
    if (data) {
      let posts: CategoryPost[] = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if ('posts' in data && Array.isArray(data.posts)) {
        posts = data.posts;
      } else if ('data' in data && data.data && 'posts' in data.data && Array.isArray(data.data.posts)) {
        posts = data.data.posts;
      }
      setCurrentIndex((prevIndex) => (prevIndex + 1) % posts.length);
    }
  };

  const prevSlide = () => {
    if (data) {
      let posts: CategoryPost[] = [];
      if (Array.isArray(data)) {
        posts = data;
      } else if ('posts' in data && Array.isArray(data.posts)) {
        posts = data.posts;
      } else if ('data' in data && data.data && 'posts' in data.data && Array.isArray(data.data.posts)) {
        posts = data.data.posts;
      }
      setCurrentIndex((prevIndex) => (prevIndex - 1 + posts.length) % posts.length);
    }
  };

  // Debug: Log current state
  console.log('SingleCategorySection State:', { loading, error, data, categorySlug, categoryName });

  if (loading) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat artikel kategori...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
            <p className="text-sm text-gray-500 mt-2">Category: {categorySlug}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle different data structures
  let posts: CategoryPost[] = [];
  if (data) {
    if (Array.isArray(data)) {
      posts = data;
    } else if ('posts' in data && Array.isArray(data.posts)) {
      posts = data.posts;
    } else if ('data' in data && data.data && 'posts' in data.data && Array.isArray(data.data.posts)) {
      posts = data.data.posts;
    }
  }

  console.log('Processed posts:', posts);

  if (posts.length === 0) {
    return (
      <div className={`bg-gray-50 py-8 ${className}`}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <p className="text-gray-600">Tidak ada artikel dalam kategori ini.</p>
            <p className="text-sm text-gray-500 mt-2">Category: {categorySlug}</p>
            <p className="text-sm text-gray-500">Data structure: {JSON.stringify(data, null, 2)}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentPost = posts[currentIndex];

  return (
    <div className={`bg-gray-50 py-8 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
         {/* Grid Container */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
           {/* Left Column - Carousel */}
           <div className="lg:col-span-2">
             <div className="relative h-[calc(2*theme(spacing.60)+theme(spacing.4))]">
               {/* Featured Article - Card Style dengan Teks Menimpa Gambar */}
               {currentPost && (
                 <div 
                   className="relative h-full rounded-lg overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                   onClick={() => handleClick(currentPost.slug || currentPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
                   onTouchStart={handleTouchStart}
                   onTouchMove={handleTouchMove}
                   onTouchEnd={handleTouchEnd}
                   onMouseDown={handleMouseDown}
                   onMouseMove={handleMouseMove}
                   onMouseUp={handleMouseUp}
                 >
                   {/* Background Image */}
                   <div className="absolute inset-0">
                     {currentPost.featured_image ? (
                       <img
                         src={currentPost.featured_image}
                         alt={currentPost.title}
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center">
                         <div className="text-center">
                           <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                             <span className="text-gray-600 text-2xl font-bold">A</span>
                           </div>
                           <p className="text-gray-500 text-base">No Image</p>
                         </div>
                       </div>
                     )}
                     
                     {/* Gradient Overlay untuk Teks */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                   </div>
                   
                   {/* Content yang Menimpa Gambar */}
                   <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 text-white">
                     <h3 className="text-lg lg:text-2xl font-bold mb-2 line-clamp-2 leading-tight">
                       {currentPost.title}
                     </h3>
                     
                     {currentPost.excerpt && (
                       <p className="text-sm lg:text-base mb-3 line-clamp-2 leading-relaxed text-gray-200">
                         {currentPost.excerpt}
                       </p>
                     )}
                     
                     <div className="flex items-center space-x-3 text-xs lg:text-sm">
                       <div className="flex items-center space-x-2">
                         <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                           <span className="text-white text-xs font-bold">
                             {currentPost.author_name.charAt(0).toUpperCase()}
                           </span>
                         </div>
                         <span className="font-medium text-white">{currentPost.author_name}</span>
                         <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                           <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                         </svg>
                       </div>
                       <>
                         <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                         </svg>
                         <span className="text-gray-200">{(currentPost.view_count || 0).toLocaleString()}</span>
                       </>
                       <span className="text-gray-200">{formatDate(currentPost.date)}</span>
                     </div>
                   </div>
                   
                   {/* Carousel Navigation */}
                   <div className="absolute top-3 right-3 hidden md:flex space-x-2 z-20">
                     {posts.map((_, index) => (
                       <button
                         key={index}
                         onClick={(e) => {
                           e.stopPropagation();
                           setCurrentIndex(index);
                         }}
                         className={`w-0.5 h-0.5 md:w-2 md:h-2 rounded-full transition-all ${
                           index === currentIndex ? 'bg-orange-500 w-2 md:w-6' : 'bg-white bg-opacity-60'
                         }`}
                       />
                     ))}
                   </div>
                   
                   {/* Navigation Arrows */}
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       prevSlide();
                     }}
                     className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all text-white z-20"
                   >
                     <ChevronLeft className="w-4 h-4" />
                   </button>
                   
                   <button
                     onClick={(e) => {
                       e.stopPropagation();
                       nextSlide();
                     }}
                     className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-all text-white z-20"
                   >
                     <ChevronRight className="w-4 h-4" />
                   </button>
                 </div>
               )}
             </div>
           </div>
           
           {/* Right Column - 2 Articles */}
           <div className="lg:col-span-1 space-y-4">
             {posts.slice(1, 3).map((post, index) => (
               <div 
                 key={post.id}
                 className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                 onClick={() => handleClick(post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}
               >
                 {/* Article Image */}
                 <div className="h-32 bg-gray-200 overflow-hidden">
                   {post.featured_image ? (
                     <img
                       src={post.featured_image}
                       alt={post.title}
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                       <div className="text-center">
                         <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                           <span className="text-gray-600 text-lg font-bold">A</span>
                         </div>
                         <p className="text-gray-400 text-sm">No Image</p>
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {/* Article Content */}
                 <div className="p-4 text-left">
                   <h4 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight hover:text-orange-600 transition-colors">
                     {post.title}
                   </h4>
                   
                   {post.excerpt && (
                     <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                       {post.excerpt}
                     </p>
                   )}
                   
                   <div className="flex items-center space-x-2 text-xs text-gray-500">
                     <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                       <span className="text-white text-xs font-bold">
                         {post.author_name.charAt(0).toUpperCase()}
                       </span>
                     </div>
                     <span className="font-medium">{post.author_name}</span>
                     <svg className="w-3 h-3 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                       <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                     </svg>
                   </div>
                   
                   <div className="mt-2 text-xs text-gray-400">
                     {formatDate(post.date)}
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>
     </div>
   );
};
