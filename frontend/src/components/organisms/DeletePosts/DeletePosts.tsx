import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { buildApiUrl } from '../../../config/api';

interface Post {
  ID: number;
  post_title: string;
  post_author: number;
  post_status: string;
  post_date: string;
  author: {
    ID: number;
    display_name: string;
    user_login: string;
  };
}

export const DeletePosts: React.FC = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // For admin: get only their own posts, for superadmin: get all posts
      const endpoint = user?.user_role === 'admin'
        ? `content/author/${user.ID}?page=${page}&limit=10`
        : `content/posts?page=${page}&limit=10`;

      console.log('🔍 [DeletePosts] Fetching:', endpoint);
      console.log('🔍 [DeletePosts] User:', user);

      const response = await fetch(buildApiUrl(endpoint), {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      console.log('🔍 [DeletePosts] Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [DeletePosts] Response data:', data);
        if (data.success) {
          // Transform API data to match expected format
          const transformedPosts = (data.data.posts || data.data || []).map((post: any) => ({
            ID: post.id || post.ID,
            post_title: post.title || post.post_title,
            post_author: post.author?.ID || post.post_author,
            post_status: post.status || post.post_status,
            post_date: post.date || post.post_date,
            author: {
              ID: post.author?.ID || post.post_author,
              display_name: post.author?.display_name || 'Unknown Author',
              user_login: post.author?.user_login || 'unknown'
            }
          }));

          console.log('🔍 [DeletePosts] Transformed posts:', transformedPosts);
          setPosts(transformedPosts);
          setTotalPages(data.data.pagination?.totalPages || 1);
        }
      } else {
        const errorData = await response.json();
        console.error('🔍 [DeletePosts] Error:', errorData);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (postId: number, postTitle: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus artikel "${postTitle}"?`)) {
      return;
    }

    try {
      setDeleting(postId);
      const token = localStorage.getItem('token');

      const response = await fetch(buildApiUrl(`admin/articles/${postId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          alert('✅ Artikel berhasil dihapus!');
          fetchPosts(currentPage); // Refresh the list
        } else {
          alert(`❌ Gagal menghapus artikel: ${data.message}`);
        }
      } else {
        const errorData = await response.json();
        alert(`❌ Gagal menghapus artikel: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('❌ Terjadi kesalahan saat menghapus artikel');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      publish: { label: 'Published', color: 'bg-green-100 text-green-800' },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      future: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
      scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            {user?.user_role === 'admin' ? 'Hapus Postingan Saya' : 'Hapus Postingan'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {user?.user_role === 'admin'
              ? 'Kelola dan hapus artikel yang Anda buat'
              : 'Kelola dan hapus artikel dari semua penulis'
            }
          </p>
        </div>
        <button
          onClick={() => fetchPosts(currentPage)}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">📝</div>
          <p className="text-gray-500">
            {user?.user_role === 'admin'
              ? 'Anda belum memiliki artikel'
              : 'Tidak ada artikel ditemukan'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {posts.map((post) => (
                <li key={post.ID} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {post.post_title}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-sm text-gray-500">
                              {post.author?.display_name || 'Unknown Author'}
                            </p>
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-500">
                              {formatDate(post.post_date)}
                            </p>
                            <span className="text-gray-400">•</span>
                            {getStatusBadge(post.post_status)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <button
                        onClick={() => deletePost(post.ID, post.post_title)}
                        disabled={deleting === post.ID}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleting === post.ID ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menghapus...
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Hapus
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};