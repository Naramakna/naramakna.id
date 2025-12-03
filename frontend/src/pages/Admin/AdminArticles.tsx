import React, { useState, useEffect } from 'react';
import { buildApiUrl } from '../../config/api';

interface Article {
  id: number;
  ID?: number; // Fallback for compatibility
  title?: string;
  post_title?: string; // Fallback for compatibility
  post_author?: number;
  status: string;
  post_status?: string; // Fallback for compatibility
  date?: string;
  post_date?: string; // Fallback for compatibility
  post_modified?: string;
  author?: {
    ID: number;
    display_name: string;
    user_login: string;
    user_email: string;
  };
  view_count?: number;
  views?: number; // Alternative field name
  categories?: Category[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export const AdminArticles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [categorizing, setCategorizing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search/filter changes
      fetchArticles();
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchArticles();
  }, [currentPage]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const apiUrl = buildApiUrl(`content/posts-with-views?${params}`);
      console.log('🌐 Fetching articles from:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('🔍 Articles API Response:', data);
      
      if (data.success) {
        // Filter out articles without valid IDs to prevent duplicate key issues
        const validArticles = data.data.posts.filter((article: Article) => 
          (article.id && typeof article.id === 'number') || (article.ID && typeof article.ID === 'number')
        );
        console.log('📄 Valid articles found:', validArticles.length);
        setArticles(validArticles);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        console.error('❌ API Error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(buildApiUrl('content/categories?limit=100'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Filter to only show categories (those with 'category' in taxonomy field)
        const categoryList = data.data.categories.filter((cat: any) =>
          cat.taxonomy && cat.taxonomy.includes('category')
        );

        // Sort categories by name for better UX
        categoryList.sort((a: any, b: any) => a.name.localeCompare(b.name));

        setCategories(categoryList);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === articles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(articles.map(article => article.id || article.ID));
    }
  };

  const handleSelectArticle = (articleId: number) => {
    setSelectedArticles(prev => 
      prev.includes(articleId) 
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleBulkCategorize = async () => {
    if (!selectedCategory || selectedArticles.length === 0) {
      alert('Please select a category and at least one article');
      return;
    }

    setCategorizing(true);
    try {
      const response = await fetch(buildApiUrl('admin/bulk-categorize'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
          article_ids: selectedArticles,
          category_slug: selectedCategory
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Successfully categorized ${selectedArticles.length} articles!`);
        setSelectedArticles([]);
        setSelectedCategory('');
        fetchArticles(); // Refresh articles list
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error bulk categorizing:', error);
      alert('Error categorizing articles');
    } finally {
      setCategorizing(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No Date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      publish: { bg: 'bg-green-100', text: 'text-green-800', label: 'Published' },
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      trash: { bg: 'bg-red-100', text: 'text-red-800', label: 'Trash' }
    };
    
    const config = statusMap[status as keyof typeof statusMap] || statusMap.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Articles Management</h2>
          <p className="text-gray-600">Bulk categorize articles from migration</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Articles</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or author..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedArticles.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <p className="text-blue-800 font-medium">
                {selectedArticles.length} articles selected
              </p>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.slug} value={category.slug}>
                    {category.name} ({category.count} posts)
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleBulkCategorize}
                disabled={categorizing || !selectedCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {categorizing ? 'Categorizing...' : 'Apply Category'}
              </button>
              
              <button
                onClick={() => setSelectedArticles([])}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedArticles.length === articles.length && articles.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No articles found
                  </td>
                </tr>
              ) : (
                articles.map((article) => {
                  const articleId = article.id || article.ID;
                  return (
                  <tr key={`article-${articleId}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedArticles.includes(articleId)}
                        onChange={() => handleSelectArticle(articleId)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {article.title || article.post_title || 'Untitled'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {article.author?.display_name || 'Unknown Author'}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{article.author?.user_login || 'unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(article.status || article.post_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(article.views || article.view_count || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(article.date || article.post_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <a
                          href={`/tulis?edit=${articleId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </a>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};