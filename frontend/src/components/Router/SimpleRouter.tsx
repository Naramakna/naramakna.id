import React, { useState, useEffect, Suspense, lazy } from 'react';
import { trackPageView } from '../../utils/analytics';
import { Home } from '../pages/Home/Home';
import LoginPage from '../../pages/Login/LoginPage';
import RegisterPage from '../../pages/Register/RegisterPage';
import ForgotPasswordPage from '../../pages/ForgotPassword/ForgotPasswordPage';
import ResetPasswordPage from '../../pages/ResetPassword/ResetPasswordPage';
import ProfilePage from '../../pages/Profile/ProfilePage';
import ProfileViewPage from '../../pages/Profile/ProfileViewPage';
import { AdminTikTok } from '../../pages/Admin/AdminTikTok';
import { AdminGoogleAds } from '../../pages/Admin/AdminGoogleAds';
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
import { MataElangPage, GalleryDetailPage } from '../../pages/MataElang';
import PartnerFotografiDashboard from '../../pages/PartnerFotografi/PartnerFotografiDashboard';
import { MataElangDashboard } from '../../pages/MataElangDashboard';

// Lazy load admin pages
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'));
const SuperAdminDashboard = lazy(() => import('../../pages/Admin/SuperAdminDashboard'));
const WriterDashboard = lazy(() => import('../../pages/Writer/WriterDashboard'));
const UserDashboard = lazy(() => import('../../pages/User/UserDashboard'));

// Loading component for lazy loaded pages
const LoadingFallback = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
      <p className="text-gray-600">Memuat...</p>
    </div>
  </div>
);

// Component for async username validation
const AsyncUsernameRoute: React.FC<{ username: string }> = ({ username }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [userExists, setUserExists] = useState(false);

  useEffect(() => {
    const validateUsername = async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('AsyncUsernameRoute: Validating username:', username);
        }

        if (!username || username.length < 3 || username.length > 30) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Basic validation failed for username:', username);
          }
          setUserExists(false);
          setIsValidating(false);
          return;
        }

        const url = '/api/users/check/' + encodeURIComponent(username);
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetching:', url);
        }
        const response = await fetch(url);
        const data = await response.json();
        if (process.env.NODE_ENV === 'development') {
          console.log('Response:', data);
        }

        if (data.success) {
          setUserExists(data.data.exists);
          if (process.env.NODE_ENV === 'development') {
            console.log('User exists: ' + data.data.exists);
          }
        } else {
          setUserExists(false);
          if (process.env.NODE_ENV === 'development') {
            console.log('API returned error');
          }
        }
      } catch (error) {
        console.error('Error validating username:', error);
        // On network error, optimistically render profile page and let it decide
        setUserExists(true);
      } finally {
        setIsValidating(false);
      }
    };

    validateUsername();
  }, [username]);

  if (isValidating) {
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

  useEffect(() => {
    trackPageView(path);
  }, [path]);

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
      return <Suspense fallback={<LoadingFallback />}><AdminDashboard /></Suspense>;
    case '/admin/tiktok':
      return <AdminTikTok />;
    case '/superadmin/dashboard/google-ads':
      return <AdminGoogleAds />;
    case '/superadmin/dashboard':
    case '/superadmin':
      return <Suspense fallback={<LoadingFallback />}><SuperAdminDashboard /></Suspense>;
    case '/writer/dashboard':
    case '/writer':
      return <Suspense fallback={<LoadingFallback />}><WriterDashboard /></Suspense>;
    case '/partner-fotografi/dashboard':
    case '/partner-fotografi':
      return <PartnerFotografiDashboard />;
    case '/mata-elang/dashboard':
      return <MataElangDashboard />;
    case '/user/dashboard':
      return <Suspense fallback={<LoadingFallback />}><UserDashboard /></Suspense>;
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
      const articleIdMatch = path.match(/^\/article\/(\d+)$/);
      if (articleIdMatch) {
        const articleId = articleIdMatch[1];
        return <ArticleDetailPage articleId={articleId} />;
      }

      const articleSlugMatch = path.match(/^\/artikel\/([a-zA-Z0-9\-]+)$/);
      if (articleSlugMatch) {
        const articleSlug = articleSlugMatch[1];
        return <ArticleDetailPage articleSlug={articleSlug} />;
      }

      const categoryMatch = path.match(/^\/kategori\/([a-zA-Z0-9\-]+)$/);
      if (categoryMatch) {
        const validCategories = [
          'narapandang', 'pelakon', 'laga-gaya', 'wahana', 'olah-bola',
          'cerita-rasa', 'mata-elang', 'horison', 'jagat-kita',
          'budaya', 'pendidikan', 'teknologi', 'data-bicara', 'liputan-khusus'
        ];

        const categorySlug = categoryMatch[1];
        if (process.env.NODE_ENV === 'development') {
          console.log('Category routing - path:', path, 'slug:', categorySlug, 'valid:', validCategories.includes(categorySlug));
        }

        if (validCategories.includes(categorySlug)) {
          if (categorySlug === 'mata-elang') {
            return <MataElangPage />;
          }
          return <CategoryPage />;
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('Invalid category slug:', categorySlug);
          }
          return <NotFound />;
        }
      }

      const mataElangMatch = path.match(/^\/mata-elang\/([a-zA-Z0-9\-]+)$/);
      if (mataElangMatch) {
        return <GalleryDetailPage />;
      }

      const writerProfileMatch = path.match(/^\/penulis\/(\@)?([a-zA-Z0-9][a-zA-Z0-9_.@-]{2,29})$/);
      if (writerProfileMatch) {
        const username = writerProfileMatch[2];
        return <AsyncUsernameRoute username={username} />;
      }

      // Alias route: /author/:username -> same as /penulis/:username
      const authorProfileMatch = path.match(/^\/author\/(\@)?([a-zA-Z0-9][a-zA-Z0-9_.@-]{2,29})$/);
      if (authorProfileMatch) {
        const username = authorProfileMatch[2];
        return <AsyncUsernameRoute username={username} />;
      }

      const usernameMatch = path.match(/^\/(@)?([a-zA-Z0-9][a-zA-Z0-9_.@-]{2,29})$/);
      if (usernameMatch) {
        const username = usernameMatch[2];
        if (typeof window !== 'undefined') {
          window.location.replace(`/penulis/${username}`);
        }
        return <LoadingFallback />;
      }

      return <NotFound />;
  }
};

export default SimpleRouter;
