import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { Footer } from '../../components/organisms/Footer';
import { buildApiUrl, buildBackendUrl } from '../../config/api';

interface Post {
  ID: number;
  post_title: string;
  post_content: string;
  post_status: string;
  post_date: string;
  post_type: string;
  post_modified?: string;
  featured_image?: string;
  view_count?: number;
  review?: {
    action: string;
    reviewer_name: string;
    review_date: string;
    feedback?: string;
  };
}

const WriterDashboard: React.FC = () => {
  const [_posts, _setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [rejectedPosts, setRejectedPosts] = useState<Post[]>([]);
  const [draftPosts, setDraftPosts] = useState<Post[]>([]);
  const [publishedPosts, setPublishedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'post'
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [creating, setCreating] = useState(false);
  const [draftPage, setDraftPage] = useState(1);
  const [draftTotalPages, setDraftTotalPages] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [publishedPage, setPublishedPage] = useState(1);
  const [publishedTotalPages, setPublishedTotalPages] = useState(1);
  const [rejectedPage, setRejectedPage] = useState(1);
  const [rejectedTotalPages, setRejectedTotalPages] = useState(1);

  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return buildBackendUrl(imagePath);
    return buildBackendUrl(`uploads/${imagePath}`);
  };

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, [draftPage, pendingPage, publishedPage, rejectedPage]);

  const fetchData = async () => {
    try {
      const [pendingRes, rejectedRes, draftsRes, publishedRes] = await Promise.all([
        fetch(buildApiUrl(`approval/my-pending?page=${pendingPage}&limit=20`), {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch(buildApiUrl(`approval/my-rejected?page=${rejectedPage}&limit=20`), {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch(buildApiUrl(`content/author/${currentUser.ID}?status=draft&limit=20&page=${draftPage}`), {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        }),
        fetch(buildApiUrl(`content/author/${currentUser.ID}?status=publish&limit=20&page=${publishedPage}`), {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
      ]);

      const pendingData = await pendingRes.json();
      const rejectedData = await rejectedRes.json();
      const draftsData = await draftsRes.json();
      const publishedData = await publishedRes.json();

      if (pendingData.success) {
        const source = Array.isArray(pendingData.data?.my_pending_posts) ? pendingData.data.my_pending_posts : [];
        const normalizedPending = source.map((p: any) => {
          const imgMatch = (p.post_content || '').match(/<img[^>]+src=['"]([^'\"]+)['"]/);
          const contentImage = imgMatch ? imgMatch[1] : null;
          return {
            ID: p.ID ?? p.id ?? 0,
            post_title: p.post_title ?? p.title ?? 'Untitled',
            post_content: p.post_content ?? p.content ?? '',
            post_status: p.post_status ?? p.status ?? 'pending',
            post_date: p.post_date ?? p.date ?? new Date().toISOString(),
            post_type: p.post_type ?? p.type ?? 'post',
            post_modified: p.post_modified ?? p.modified ?? null,
            featured_image: (p.featured_image && p.featured_image.url) ? p.featured_image.url : (p.featured_image || contentImage || null)
          } as Post;
        });
        setPendingPosts(normalizedPending);
        setPendingTotalPages(pendingData.data?.pagination?.total_pages ?? 1);
      }
      if (rejectedData.success) {
        setRejectedPosts(rejectedData.data.my_rejected_posts);
        setRejectedTotalPages(rejectedData.data?.pagination?.total_pages ?? 1);
      }
      if (draftsData.success) {
        const source = (draftsData.data && draftsData.data.posts) ? draftsData.data.posts : (Array.isArray(draftsData.data) ? draftsData.data : []);
        const normalized = source.map((p: any) => ({
          ID: p.ID ?? p.id ?? 0,
          post_title: p.post_title ?? p.title ?? 'Untitled',
          post_content: p.post_content ?? p.content ?? '',
          post_status: p.post_status ?? p.status ?? 'draft',
          post_date: p.post_date ?? p.date ?? new Date().toISOString(),
          post_type: p.post_type ?? p.type ?? 'post',
          post_modified: p.post_modified ?? p.modified ?? p.date ?? p.post_date ?? null,
          featured_image: (p.featured_image && p.featured_image.url) ? p.featured_image.url : (p.featured_image || null)
        }));
        setDraftPosts(normalized);
        setDraftTotalPages(draftsData.data?.pagination?.totalPages ?? 1);
      }
      if (publishedData.success) {
        const source = (publishedData.data && publishedData.data.posts) ? publishedData.data.posts : (Array.isArray(publishedData.data) ? publishedData.data : []);
        const normalized = source.map((p: any) => ({
          ID: p.ID ?? p.id ?? 0,
          post_title: p.post_title ?? p.title ?? 'Untitled',
          post_content: p.post_content ?? p.content ?? '',
          post_status: p.post_status ?? p.status ?? 'publish',
          post_date: p.post_date ?? p.date ?? new Date().toISOString(),
          post_type: p.post_type ?? p.type ?? 'post',
          post_modified: p.post_modified ?? p.modified ?? p.date ?? p.post_date ?? null,
          featured_image: (p.featured_image && p.featured_image.url) ? p.featured_image.url : (p.featured_image || null),
          view_count: p.view_count ?? 0
        }));
        setPublishedPosts(normalized);
        setPublishedTotalPages(publishedData.data?.pagination?.totalPages ?? 1);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Debug: Check form data before submission
      console.log('Form submission data:', {
        title: newPost.title,
        content: newPost.content,
        type: newPost.type,
        author_id: currentUser.ID,
        status: 'pending'
      });
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', newPost.title);
      formData.append('content', newPost.content);
      formData.append('type', newPost.type);
      formData.append('status', 'pending');
      // Don't send author_id - backend will use authenticated user
      
      // Add featured image if selected
      if (featuredImage) {
        formData.append('featured_image', featuredImage);
      }
      
      // Add gallery images if selected
      galleryImages.forEach((file) => {
        formData.append('gallery_images', file);
      });
      
      const response = await fetch(buildApiUrl('content'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      console.log('Server response:', data);
      
      if (data.success) {
        alert('Post created and submitted for review!');
        setNewPost({ title: '', content: '', type: 'post' });
        setFeaturedImage(null);
        setGalleryImages([]);
        fetchData(); // Refresh data
      } else {
        console.error('Error details:', data);
        alert('Error creating post: ' + data.message);
      }
    } catch (error) {
      alert('Error creating post');
    } finally {
      setCreating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Writer Dashboard</h1>
                <p className="text-gray-600 mt-2">Welcome back, {currentUser.display_name || 'Writer'}</p>
              </div>
              <button 
                onClick={logout} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="px-6">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('drafts')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'drafts'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Draft Posts ({draftPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Posts ({pendingPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('published')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'published'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Published Posts ({publishedPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'rejected'
                    ? 'border-yellow-500 text-yellow-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Rejected Posts ({rejectedPosts.length})
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Writing Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-6 text-white">
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-30 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Pending Review</h3>
                      <p className="text-3xl font-bold">{pendingPosts.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className={`rounded-lg p-6 text-white ${currentUser.user_status === 1 ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-yellow-400 to-yellow-600'}`}>
                  <div className="flex items-center">
                    <div className="p-3 bg-white bg-opacity-30 rounded-full">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">Account Status</h3>
                      <p className="text-lg font-bold">
                        {currentUser.user_status === 1 ? 'Active Writer' : 'Pending Approval'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <a 
                  href="/tulis"
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create New Post
                </a>
                <button 
                  onClick={() => setActiveTab('pending')}
                  className="flex items-center justify-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Pending Posts ({pendingPosts.length})
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'published' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Published Posts</h2>
            {publishedPosts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No published posts</h3>
                <p className="text-gray-600 mb-6">You haven’t published any posts yet.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {publishedPosts.map(post => (
                      <tr key={post.ID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const primary = post.featured_image ? getImageUrl(post.featured_image) : null;
                            const imgMatch = (!primary && post.post_content) ? post.post_content.match(/<img[^>]+src=['"]([^'\"]+)['"]/): null;
                            const rawUrl = imgMatch ? imgMatch[1] : null;
                            const fallback = rawUrl ? getImageUrl(rawUrl) : null;
                            const imageUrl = primary || fallback;
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={post.post_title}
                                className="w-16 h-16 object-cover rounded-md"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : null;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.post_title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(post.post_date).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {post.view_count ?? 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setPublishedPage(p => Math.max(1, p - 1))}
                    disabled={publishedPage <= 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${publishedPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {publishedPage} of {publishedTotalPages}</span>
                  <button
                    onClick={() => setPublishedPage(p => Math.min(publishedTotalPages, p + 1))}
                    disabled={publishedPage >= publishedTotalPages}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${publishedPage >= publishedTotalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Draft Posts</h2>
            {draftPosts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts</h3>
                <p className="text-gray-600 mb-6">You haven't created any drafts yet.</p>
                <a
                  href="/tulis"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create a draft
                </a>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Modified</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {draftPosts.map(post => (
                      <tr key={post.ID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const primary = post.featured_image ? getImageUrl(post.featured_image) : null;
                            const imgMatch = (!primary && post.post_content) ? post.post_content.match(/<img[^>]+src=['"]([^'\"]+)['"]/): null;
                            const rawUrl = imgMatch ? imgMatch[1] : null;
                            const fallback = rawUrl ? getImageUrl(rawUrl) : null;
                            const imageUrl = primary || fallback;
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={post.post_title}
                                className="w-16 h-16 object-cover rounded-md"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : null;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.post_title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 capitalize">{post.post_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(post.post_modified || post.post_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={`/tulis?edit=${post.ID}`}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            Edit Draft
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setDraftPage(p => Math.max(1, p - 1))}
                    disabled={draftPage <= 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${draftPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {draftPage} of {draftTotalPages}</span>
                  <button
                    onClick={() => setDraftPage(p => Math.min(draftTotalPages, p + 1))}
                    disabled={draftPage >= draftTotalPages}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${draftPage >= draftTotalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Posts Pending Review</h2>
            {pendingPosts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pending posts</h3>
                <p className="text-gray-600 mb-6">You haven't submitted any posts for review yet.</p>
                <a
                  href="/tulis"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Create your first post!
                </a>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pendingPosts.map(post => (
                      <tr key={post.ID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const primary = post.featured_image ? getImageUrl(post.featured_image) : null;
                            const imgMatch = (!primary && post.post_content) ? post.post_content.match(/<img[^>]+src=['"]([^'\"]+)['"]/): null;
                            const rawUrl = imgMatch ? imgMatch[1] : null;
                            const fallback = rawUrl ? getImageUrl(rawUrl) : null;
                            const imageUrl = primary || fallback;
                            return imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={post.post_title}
                                className="w-16 h-16 object-cover rounded-md"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : null;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{post.post_title}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 capitalize">{post.post_type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(post.post_date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            {post.post_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                    disabled={pendingPage <= 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${pendingPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {pendingPage} of {pendingTotalPages}</span>
                  <button
                    onClick={() => setPendingPage(p => Math.min(pendingTotalPages, p + 1))}
                    disabled={pendingPage >= pendingTotalPages}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${pendingPage >= pendingTotalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rejected' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Rejected Posts</h2>
            {rejectedPosts.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected posts</h3>
                <p className="text-gray-600">All your submissions have been approved or are pending review.</p>
              </div>
            ) : (
              <div>
                <div className="space-y-4">
                  {rejectedPosts.map(post => (
                  <div key={post.ID} className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.post_title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="capitalize">{post.post_type}</span>
                          <span>•</span>
                          <span>Rejected on {post.post_modified ? new Date(post.post_modified).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'N/A'}</span>
                        </div>
                      </div>
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Rejected
                      </span>
                    </div>

                    {post.review && (
                      <div className="bg-white border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                          <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-1">
                              Rejection Reason
                              {post.review.reviewer_name && (
                                <span className="text-gray-600 font-normal"> by {post.review.reviewer_name}</span>
                              )}
                            </p>
                            {post.review.feedback ? (
                              <p className="text-sm text-gray-700 bg-red-50 p-3 rounded border border-red-100">
                                {post.review.feedback}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No specific reason provided</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex space-x-3">
                      <a
                        href={`/tulis?edit=${post.ID}`}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Edit & Resubmit
                      </a>
                    </div>
                  </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setRejectedPage(p => Math.max(1, p - 1))}
                    disabled={rejectedPage <= 1}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${rejectedPage <= 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">Page {rejectedPage} of {rejectedTotalPages}</span>
                  <button
                    onClick={() => setRejectedPage(p => Math.min(rejectedTotalPages, p + 1))}
                    disabled={rejectedPage >= rejectedTotalPages}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${rejectedPage >= rejectedTotalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WriterDashboard;
