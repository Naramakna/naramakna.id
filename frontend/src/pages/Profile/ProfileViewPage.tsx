import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../../components/atoms/ProfileAvatar';
import { SocialStats } from '../../components/molecules/SocialStats';
import { ProfileActionButtons } from '../../components/molecules/ProfileActionButtons';
import { ProfileTabs } from '../../components/molecules/ProfileTabs';

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path starting with /uploads, prepend backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:3001${imagePath}`;
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  return `http://localhost:3001/uploads/${imagePath}`;
};

interface ProfileViewPageProps {
  username?: string;
}

const ProfileViewPage: React.FC<ProfileViewPageProps> = ({ username }) => {
  const { user, isLoading } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('konten');
  const [userArticles, setUserArticles] = useState<any[]>([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(false);
  const [stats] = useState({
    mengikuti: 0,
    pengikut: 0
  });

  const isOwnProfile = !username || (user?.user_login === username) || false;

  // Fetch profile data if username is provided
  useEffect(() => {
    if (username && !isOwnProfile) {
      setIsLoadingProfile(true);
      // TODO: Implement API call to fetch user profile by username
      // For now, we'll use mock data
      setTimeout(() => {
        setProfileUser({
          display_name: 'nara makna',
          user_login: username,
          user_email: 'nara@example.com',
          user_role: 'writer',
          profile_image: null,
          bio: null,
          profile: null
        });
        setIsLoadingProfile(false);
      }, 500);
    }
  }, [username, isOwnProfile]);

  // Fetch user articles when displayUser is available
  useEffect(() => {
    const fetchUserArticles = async () => {
      const targetUser = isOwnProfile ? user : profileUser;
      if (!targetUser) {
        console.log('❌ No target user found', { isOwnProfile, user: !!user, profileUser: !!profileUser });
        return;
      }

      const authorId = targetUser.ID || targetUser.id;
      console.log('🔍 Fetching articles for user:', { 
        username: targetUser.user_login, 
        authorId, 
        isOwnProfile,
        targetUserType: isOwnProfile ? 'logged-in user' : 'profile user'
      });

      setIsLoadingArticles(true);
      try {
        let allPosts = [];

        if (isOwnProfile) {
          // For own profile, fetch published, pending, and draft posts separately
          console.log('🔍 Fetching published posts...');
          const publishedResponse = await fetch(`http://localhost:3001/api/content/author/${authorId}?status=publish&limit=20`, {
            credentials: 'include'
          });
          
          console.log('🔍 Fetching pending posts...');
          const pendingResponse = await fetch(`http://localhost:3001/api/content/author/${authorId}?status=pending&limit=20`, {
            credentials: 'include'
          });
          
          console.log('🔍 Fetching draft posts...');
          const draftResponse = await fetch(`http://localhost:3001/api/content/author/${authorId}?status=draft&limit=20`, {
            credentials: 'include'
          });

          if (publishedResponse.ok && pendingResponse.ok && draftResponse.ok) {
            const publishedResult = await publishedResponse.json();
            const pendingResult = await pendingResponse.json();
            const draftResult = await draftResponse.json();
            
            allPosts = [
              ...(publishedResult.data?.posts || []),
              ...(pendingResult.data?.posts || []),
              ...(draftResult.data?.posts || [])
            ];
            
            // Sort by date descending
            allPosts.sort((a, b) => new Date(b.post_date || b.date).getTime() - new Date(a.post_date || a.date).getTime());
            
            console.log('📄 Combined posts for', targetUser.user_login, ':', 
              `${publishedResult.data?.posts?.length || 0} published + ${pendingResult.data?.posts?.length || 0} pending = ${allPosts.length} total`);
          }
        } else {
          // For other profiles, fetch only published posts
          const apiUrl = `http://localhost:3001/api/content/author/${authorId}?status=publish&limit=20`;
          console.log('📡 API URL:', apiUrl);
          
          const response = await fetch(apiUrl, {
            credentials: 'include'
          });

          if (response.ok) {
            const result = await response.json();
            allPosts = result.data?.posts || [];
            console.log('📄 Published posts for', targetUser.user_login, ':', allPosts.length, 'articles');
          }
        }

        setUserArticles(allPosts);
      } catch (error) {
        console.error('Error fetching user articles:', error);
        setUserArticles([]);
      } finally {
        setIsLoadingArticles(false);
      }
    };

    fetchUserArticles();
  }, [isOwnProfile, user, profileUser]);

  const displayUser = isOwnProfile ? user : profileUser;

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="animate-pulse p-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
            <div className="flex space-x-4 mb-4">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser && !username) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Akses Ditolak</h2>
            <p className="text-gray-600 mb-4">Anda harus login untuk melihat profil.</p>
            <a 
              href="/login" 
              className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!displayUser) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto bg-white min-h-screen">
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil Tidak Ditemukan</h2>
            <p className="text-gray-600 mb-4">User @{username} tidak ditemukan.</p>
            <a 
              href="/" 
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Remove unused helper functions since this is now a social media style profile

  const renderTabContent = () => {
    switch (activeTab) {
      case 'konten':
        if (isLoadingArticles) {
          return (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (userArticles.length === 0) {
          return (
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada konten</h3>
              <p className="text-gray-500 text-sm">Sudah ditampilkan semua</p>
            </div>
          );
        }

        return (
          <div className="divide-y divide-gray-200">
            {userArticles.map((article) => (
              <div key={article.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="flex-1 min-w-0">
                    <a 
                      href={`/artikel/${article.slug}`}
                      className="block hover:text-blue-600 transition-colors"
                    >
                      <h3 className="text-base font-medium text-gray-900 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400 space-x-4">
                        <span>{new Date(article.date).toLocaleDateString('id-ID')}</span>
                        {article.view_count !== undefined && (
                          <span>{article.view_count} views</span>
                        )}
                        <span className="capitalize">{article.status}</span>
                      </div>
                    </a>
                    
                    {/* Edit button - show for own articles or admin */}
                    {(isOwnProfile || user?.user_role === 'admin' || user?.user_role === 'superadmin') && (
                      <div className="flex items-center mt-3 space-x-2">
                        {(() => {
                          const isPending = article.status === 'pending' || article.post_status === 'pending';
                          const isWriter = user?.user_role === 'writer';
                          const canEdit = !isPending || !isWriter; // Writers can't edit pending posts
                          
                          if (canEdit) {
                            return (
                              <a
                                href={`/tulis?edit=${article.id}`}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                              </a>
                            );
                          } else {
                            return (
                              <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200 rounded-md cursor-not-allowed">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Under Review
                              </span>
                            );
                          }
                        })()}
                        <a
                          href={`/posts/${article.id}/analytics`}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
                          </svg>
                          Analytics
                        </a>
                      </div>
                    )}
                  </div>
                  {/* Optional thumbnail */}
                  {article.featured_image && (
                    <div className="flex-shrink-0">
                      <img 
                        src={article.featured_image} 
                        alt={article.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      case 'komentar':
        return (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada komentar</h3>
            <p className="text-gray-500 text-sm">Sudah ditampilkan semua</p>
          </div>
        );
      case 'suka':
        return (
          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada yang disukai</h3>
            <p className="text-gray-500 text-sm">Sudah ditampilkan semua</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Social Media Style Profile */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Profile Header */}
        <div className="p-6 text-center">
          {/* Profile Picture */}
          <div className="relative inline-block mb-4">
            <ProfileAvatar
              profileImage={displayUser.profile_image}
              displayName={displayUser.display_name}
              getImageUrl={getImageUrl}
            />
          </div>
          
          {/* User Name */}
          <h1 className="text-xl font-semibold text-gray-900 mb-1">{displayUser.display_name}</h1>
          
          {/* Follow Stats */}
          <SocialStats 
            mengikuti={stats.mengikuti}
            pengikut={stats.pengikut}
          />

          {/* Action Buttons */}
          <ProfileActionButtons isOwnProfile={isOwnProfile} />
        </div>

        {/* Tabs */}
        <ProfileTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default ProfileViewPage;
