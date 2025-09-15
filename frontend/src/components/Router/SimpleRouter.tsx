import React, { useState, useEffect } from 'react';
import { trackPageView } from '../../utils/analytics';
import { Home } from '../pages/Home/Home';
import LoginPage from '../../pages/Login/LoginPage';
import RegisterPage from '../../pages/Register/RegisterPage';
import ForgotPasswordPage from '../../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../../pages/ResetPassword/ResetPasswordPage';
import ProfilePage from '../../pages/Profile/ProfilePage';
import ProfileViewPage from '../../pages/Profile/ProfileViewPage';
import AdminDashboard from '../../pages/Admin/AdminDashboard';
import SuperAdminDashboard from '../../pages/Admin/SuperAdminDashboard';
import { AdminTikTok } from '../../pages/Admin/AdminTikTok';
import { AdminYouTube } from '../../pages/Admin/AdminYouTube';
import { AdminGoogleAds } from '../../pages/Admin/AdminGoogleAds';
import WriterDashboard from '../../pages/Writer/WriterDashboard';
import UserDashboard from '../../pages/User/UserDashboard';
import PostAnalytics from '../../pages/Admin/PostAnalytics';
import ArticleDetailPage from '../../pages/ArticleDetail/ArticleDetailPage';
import ArticleWriterPage from '../../pages/Writer/ArticleWriterPage';
import CategoryPage from '../../pages/Category/CategoryPage';
import { NotFound } from '../../pages/NotFound';
import { AboutUs } from '../../pages/AboutUs';
import { Help } from '../../pages/Help';
import { Partnership } from '../../pages/Partnership';
import { HowToWrite } from '../../pages/HowToWrite';
import { Polling } from '../../pages/Polling';
import { VideoStory } from '../../pages/VideoStory';
import { IndexBerita } from '../../pages/IndexBerita/IndexBerita';
import { OTPPage } from '../../pages/OTP';
import AuthSuccessPage from '../../pages/Auth/AuthSuccessPage';
import AuthErrorPage from '../../pages/Auth/AuthErrorPage';
import { TermsOfService } from '../../pages/TermsOfService';
import { PrivacyPolicy } from '../../pages/PrivacyPolicy';

// Component for async username validation
const AsyncUsernameRoute: React.FC<{ username: string }> = ({ username }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const validateUsername = async () => {
      try {
        console.log('🔍 AsyncUsernameRoute: Validating username:', username);
        
        // Basic validation first
        if (!username || username.length < 3 || username.length > 30) {
          console.log('❌ Basic validation failed for username:', username);
          setUserExists(false);
          setIsValidating(false);
          return;
        }

        // Check with backend
        const url = `/api/users/check/${encodeURIComponent(username)}`;
        console.log('🌐 Fetching:', url);
        const response = await fetch(url);
        const data = await response.json();
        console.log('📡 Response:', data);
        
        if (data.success) {
          setUserExists(data.data.exists);
          console.log(`✅ User exists: ${data.data.exists}`);
        } else {
          setUserExists(false);
          console.log('❌ API returned error');
        }
      } catch (error) {
        console.error('❌ Error validating username:', error);
        setUserExists(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateUsername();
  }, [username]);

  if (isValidating) {
    // Show loading state while validating
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (userExists) {
    return <ProfileViewPage username={username} />;
  } else {
    return <NotFound />;
  }
};

const SimpleRouter: React.FC = () => {
  const path = window.location.pathname;

  // Track page view when route changes
  useEffect(() => {
    trackPageView(path);
  }, [path]);

  // Simple route matching
  switch (path) {
    case '/login':
      return <LoginPage />;
    case '/register':
      return <RegisterPage />;
    case '/forgot-password':
      return <ForgotPasswordPage />;
    case '/reset-password':
      return <ResetPasswordPage />;
    case '/otp':
    case '/verify-otp':
    case '/otp-verification':
      return <OTPPage />;
    case '/auth/success':
      return <AuthSuccessPage />;
    case '/auth/error':
      return <AuthErrorPage />;
    case '/profile':
      return <ProfileViewPage />;
    case '/profile/edit':
      return <ProfilePage />;
    case '/admin/dashboard':
    case '/admin':
      return <AdminDashboard />;
    case '/admin/tiktok':
      return <AdminTikTok />;
    case '/admin/youtube':
      return <AdminYouTube />;
    case '/superadmin/dashboard/google-ads':
      return <AdminGoogleAds />;
    case '/superadmin/dashboard':
    case '/superadmin':
      return <SuperAdminDashboard />;
    case '/writer/dashboard':
    case '/writer':
      return <WriterDashboard />;
    case '/user/dashboard':
      return <UserDashboard />;
    case '/writer/new':
    case '/tulis':
      return <ArticleWriterPage />;
    case '/polling':
      return <Polling />;
    case '/video-story':
      return <VideoStory />;
    case '/tentang-kami':
      return <AboutUs />;
    case '/help':
    case '/bantuan':
      return <Help />;
    case '/partnership':
    case '/kemitraan':
    case '/kerja-sama':
      return <Partnership />;
    case '/how-to-write':
    case '/cara-menulis':
      return <HowToWrite />;
    case '/index-berita':
      return <IndexBerita />;
    case '/pedoman-media-siber':
    case '/terms-of-service':
    case '/syarat-ketentuan':
      return <TermsOfService />;
    case '/privacy-policy-2':
    case '/privacy-policy':
    case '/kebijakan-privasi':
      return <PrivacyPolicy />;
    case '/':
      return <Home />;
    default:
      // Check if it's a post analytics route (/posts/:id/analytics)
      const analyticsMatch = path.match(/^\/posts\/(\d+)\/analytics$/);
      if (analyticsMatch) {
        return <PostAnalytics />;
      }

      // Check if it's an article detail route (/article/:id or /artikel/:slug)
      const articleIdMatch = path.match(/^\/article\/(\d+)$/);
      if (articleIdMatch) {
        const articleId = articleIdMatch[1];
        return <ArticleDetailPage articleId={articleId} />;
      }

      // Check if it's an article slug route (/artikel/:slug - Indonesian style like Kumparan)
      const articleSlugMatch = path.match(/^\/artikel\/([a-zA-Z0-9\-]+)$/);
      if (articleSlugMatch) {
        const articleSlug = articleSlugMatch[1];
        return <ArticleDetailPage articleSlug={articleSlug} />;
      }

      // Check if it's a category route (/kategori/:slug)
      const categoryMatch = path.match(/^\/kategori\/([a-zA-Z0-9\-]+)$/);
      if (categoryMatch) {
        // Valid category slugs (only allow main categories)
        const validCategories = [
          'narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola',
          'cerita-rasa', 'akal-budi', 'horison', 'jagat-kita',
          'budaya', 'pendidikan', 'teknologi'
        ];
        
        const categorySlug = categoryMatch[1];
        if (validCategories.includes(categorySlug)) {
          return <CategoryPage />;
        } else {
          // Invalid category, show 404
          return <NotFound />;
        }
      }
      
      // Check if it's a username route (/@username or /username)
      // Now uses database validation instead of blacklists
      // Allow dashes anywhere in username, more flexible pattern
      const usernameMatch = path.match(/^\/(@)?([a-zA-Z0-9][a-zA-Z0-9_.@-]{2,29})$/);
      if (usernameMatch) {
        const username = usernameMatch[2];
        // console.log('🔍 Username match found:', username);
        return <AsyncUsernameRoute username={username} />;
      }
      
      // For any other path, render 404 NotFound component
      return <NotFound />;
  }
};

export default SimpleRouter;