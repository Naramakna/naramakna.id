import React from 'react';
import { Home } from '../pages/Home/Home';
import LoginPage from '../../pages/Login/LoginPage';
import RegisterPage from '../../pages/Register/RegisterPage';
import ForgotPasswordPage from '../../pages/ForgotPassword/ForgotPasswordPage';
import ProfilePage from '../../pages/Profile/ProfilePage';
import ProfileViewPage from '../../pages/Profile/ProfileViewPage';
import AdminDashboard from '../../pages/Admin/AdminDashboard';
import SuperAdminDashboard from '../../pages/Admin/SuperAdminDashboard';
import WriterDashboard from '../../pages/Writer/WriterDashboard';
import UserDashboard from '../../pages/User/UserDashboard';
import PostAnalytics from '../../pages/Admin/PostAnalytics';
import ArticleDetailPage from '../../pages/ArticleDetail/ArticleDetailPage';
import ArticleWriterPage from '../../pages/Writer/ArticleWriterPage';
import CategoryPage from '../../pages/Category/CategoryPage';



const SimpleRouter: React.FC = () => {
  const path = window.location.pathname;

  // Simple route matching
  switch (path) {
    case '/login':
      return <LoginPage />;
    case '/register':
      return <RegisterPage />;
    case '/forgot-password':
      return <ForgotPasswordPage />;
    case '/profile':
      return <ProfileViewPage />;
    case '/profile/edit':
      return <ProfilePage />;
    case '/admin/dashboard':
      return <AdminDashboard />;
    case '/superadmin/dashboard':
      return <SuperAdminDashboard />;
    case '/writer/dashboard':
      return <WriterDashboard />;
    case '/user/dashboard':
      return <UserDashboard />;
    case '/writer/new':
    case '/tulis':
      return <ArticleWriterPage />;
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
        return <CategoryPage />;
      }
      
      // Check if it's a username route (/@username or /username)
      // Support both regular usernames and email addresses
      const usernameMatch = path.match(/^\/(@)?([a-zA-Z0-9_.@-]+)$/);
      if (usernameMatch) {
        const username = usernameMatch[2];
        return <ProfileViewPage username={username} />;
      }
      // For any other path, render Home component
      return <Home />;
  }
};

export default SimpleRouter;