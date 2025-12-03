import React, { useState, useEffect } from 'react';

interface Post {
  ID: number;
  post_title: string;
  post_content: string;
  post_status: string;
  post_date: string;
  post_type: string;
}

const UserDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    display_name: '',
    user_email: '',
    bio: ''
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [updating, setUpdating] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
    setProfile({
      display_name: currentUser.display_name || '',
      user_email: currentUser.user_email || '',
      bio: currentUser.bio || ''
    });
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://dev.naramakna.id/api/content/feed?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) setPosts(data.data.posts);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await fetch('http://dev.naramakna.id/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(profile)
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Profile updated successfully!');
        localStorage.setItem('user', JSON.stringify(data.data.user));
      } else {
        alert('Error updating profile: ' + data.message);
      }
    } catch (error) {
      alert('Error updating profile');
    } finally {
      setUpdating(false);
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
        <h1>User Dashboard</h1>
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
          onClick={() => setActiveTab('profile')}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'profile' ? '#ddd' : 'white' }}
        >
          Profile
        </button>
        <button 
          onClick={() => setActiveTab('content')}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: activeTab === 'content' ? '#ddd' : 'white' }}
        >
          Latest Content
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <h2>Account Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ border: '1px solid #ccc', padding: '20px' }}>
              <h3>Account Info</h3>
              <p><strong>Username:</strong> {currentUser.user_login}</p>
              <p><strong>Email:</strong> {currentUser.user_email}</p>
              <p><strong>Role:</strong> <span style={{ 
                padding: '2px 6px', 
                borderRadius: '3px',
                backgroundColor: '#007cba',
                color: 'white',
                fontSize: '12px'
              }}>
                {currentUser.user_role}
              </span></p>
              <p><strong>Member since:</strong> {new Date(currentUser.user_registered).toLocaleDateString()}</p>
            </div>

            <div style={{ border: '1px solid #ccc', padding: '20px' }}>
              <h3>Upgrade Account</h3>
              <p>Want to create content? Become a writer!</p>
              <div style={{ marginTop: '15px' }}>
                <a href="/register" style={{ 
                  display: 'inline-block',
                  padding: '10px 15px', 
                  backgroundColor: '#f56500', 
                  color: 'white', 
                  textDecoration: 'none',
                  borderRadius: '3px'
                }}>
                  Register as Writer
                </a>
              </div>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                Writer accounts require admin approval
              </p>
            </div>
          </div>

          <div style={{ marginTop: '30px' }}>
            <h3>What you can do:</h3>
            <ul style={{ fontSize: '16px', lineHeight: '1.6' }}>
              <li>✅ Read all published content</li>
              <li>✅ Comment on articles and videos</li>
              <li>✅ Update your profile information</li>
              <li>❌ Create new content (upgrade to Writer)</li>
              <li>❌ Moderate comments (Admin only)</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div>
          <h2>Update Profile</h2>
          <form onSubmit={updateProfile} style={{ maxWidth: '400px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label>Display Name:</label>
              <input
                type="text"
                value={profile.display_name}
                onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Email:</label>
              <input
                type="email"
                value={profile.user_email}
                onChange={(e) => setProfile(prev => ({ ...prev, user_email: e.target.value }))}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Bio:</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                placeholder="Tell us about yourself..."
              />
            </div>

            <button 
              type="submit" 
              disabled={updating}
              style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007cba', color: 'white' }}
            >
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'content' && (
        <div>
          <h2>Latest Published Content</h2>
          {posts.length === 0 ? (
            <p>No content available.</p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {posts.map(post => (
                <div key={post.ID} style={{ border: '1px solid #ccc', padding: '20px' }}>
                  <h3>{post.post_title}</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    {post.post_type} • {new Date(post.post_date).toLocaleDateString()}
                  </p>
                  <p>{post.post_content.substring(0, 200)}...</p>
                  <button style={{ padding: '5px 10px', marginTop: '10px' }}>
                    Read More
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;