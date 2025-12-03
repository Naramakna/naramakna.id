// src/components/layouts/ArticleLayout/index.tsx
import React from 'react';
import MainLayout from '../MainLayout';

interface ArticleLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

const ArticleLayout: React.FC<ArticleLayoutProps> = ({ 
  children, 
  sidebar 
}) => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {children}
          </div>
          
          {/* Sidebar */}
          {sidebar && (
            <div className="lg:col-span-1">
              <aside className="sticky top-24">
                {sidebar}
              </aside>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ArticleLayout;