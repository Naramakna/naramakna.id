import React, { useState, useEffect } from 'react';

interface Post {
  ID: number;
  post_title: string;
  post_content: string;
  post_status: string;
  post_date: string;
  post_type: string;
}

const WriterDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
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

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes] = await Promise.all([
        fetch('http://dev.naramakna.id/api/approval/my-pending', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        })
      ]);

      const pendingData = await pendingRes.json();
      if (pendingData.success) setPendingPosts(pendingData.data.my_pending_posts);
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
      
      const response = await fetch('http://dev.naramakna.id/api/content', {
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

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ borderBottom: '1px solid #ccc', marginBottom: '20px', paddingBottom: '10px' }}>
        <h1>Writer Dashboard</h1>
        <p>Welcome, {currentUser.display_name}</p>
        <button onClick={logout} style={{ float: 'right', padding: '5px 10px' }}>Logout</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'overview' ? '#ddd' : 'white' }}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'create' ? '#ddd' : 'white' }}
        >
          Create Post
        </button>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'pending' ? '#ddd' : 'white' }}
        >
          Pending Posts ({pendingPosts.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <h2>Writing Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ border: '1px solid #ccc', padding: '15px' }}>
              <h3>Pending Review</h3>
              <p style={{ fontSize: '24px', margin: '10px 0', color: 'orange' }}>{pendingPosts.length}</p>
            </div>
            <div style={{ border: '1px solid #ccc', padding: '15px' }}>
              <h3>Account Status</h3>
              <p style={{ fontSize: '16px', margin: '10px 0', color: 'green' }}>
                {currentUser.user_status === 1 ? 'Active Writer' : 'Pending Approval'}
              </p>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>Quick Actions</h3>
            <button 
              onClick={() => setActiveTab('create')}
              style={{ padding: '15px 20px', fontSize: '16px', backgroundColor: '#007cba', color: 'white', marginRight: '10px' }}
            >
              Create New Post
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              style={{ padding: '15px 20px', fontSize: '16px', backgroundColor: '#f56500', color: 'white' }}
            >
              View Pending Posts
            </button>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div>
          <h2>Create New Post</h2>
          <form onSubmit={createPost} style={{ maxWidth: '600px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Post Type:</label>
              <select
                value={newPost.type}
                onChange={(e) => setNewPost(prev => ({ ...prev, type: e.target.value }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              >
                <option value="post">Article</option>
                {['admin', 'superadmin'].includes(currentUser.user_role) && (
                  <>
                    <option value="youtube_video">YouTube Video</option>
                    <option value="tiktok_video">TikTok Video</option>
                  </>
                )}
                <option value="page">Page</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Title:</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                required
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Content:</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                required
                rows={10}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Featured Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {featuredImage && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Selected: {featuredImage.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Gallery Images (Optional):</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setGalleryImages(Array.from(e.target.files || []))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
              {galleryImages.length > 0 && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  Selected: {galleryImages.length} image(s)
                </p>
              )}
            </div>

            <button 
              type="submit" 
              disabled={creating}
              style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007cba', color: 'white' }}
            >
              {creating ? 'Creating...' : 'Submit for Review'}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f8ff', border: '1px solid #007cba' }}>
            <p><strong>Note:</strong> Your posts will be submitted for admin review before being published.</p>
          </div>
        </div>
      )}

      {activeTab === 'pending' && (
        <div>
          <h2>Posts Pending Review</h2>
          {pendingPosts.length === 0 ? (
            <p>No posts pending review. <button onClick={() => setActiveTab('create')}>Create your first post!</button></p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ccc', padding: '10px' }}>Title</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px' }}>Type</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px' }}>Submitted</th>
                  <th style={{ border: '1px solid #ccc', padding: '10px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingPosts.map(post => (
                  <tr key={post.ID}>
                    <td style={{ border: '1px solid #ccc', padding: '10px' }}>{post.post_title}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px' }}>{post.post_type}</td>
                    <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                      {new Date(post.post_date).toLocaleDateString()}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                      <span style={{ 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        backgroundColor: 'orange',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {post.post_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default WriterDashboard;