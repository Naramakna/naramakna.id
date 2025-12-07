import React, { useState, useEffect } from 'react';
import { DataTable } from '../DataTable';
import { FilterPanel } from '../FilterPanel';
import { Pagination } from '../../molecules/Pagination';

interface Post {
  ID?: number;
  id?: number;
  title?: string;
  post_title?: string;
  excerpt?: string;
  post_excerpt?: string;
  status?: string;
  post_status?: string;
  date?: string;
  post_date?: string;
  post_author?: number;
  author_login?: string;
  author?: {
    ID: number;
    display_name: string;
    user_login: string;
    user_email: string;
  };
  view_count?: number;
  views?: number;
  featured_image?: string;
}

interface FilterState {
  author: string;
  status: string;
  year: string;
  month: string;
  minViews: string;
  maxViews: string;
  sortBy: string;
  sortOrder: string;
  startDate?: string;
  endDate?: string;
  title?: string;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface User {
  ID: number;
  display_name: string;
  user_login: string;
  user_email?: string;
}

interface PostsManagementProps {
  posts: Post[];
  loading: boolean;
  filters: FilterState;
  showFilters: boolean;
  pagination: PaginationState;
  users?: User[];
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  onToggleFilters: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  onDeletePost?: (postId: number) => void;
  onBulkDeletePosts?: (postIds: number[]) => void;
  currentUserRole?: string;
}

export const PostsManagement: React.FC<PostsManagementProps> = ({
  posts,
  loading,
  filters,
  showFilters,
  pagination,
  users = [],
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  onToggleFilters,
  onPageChange,
  onItemsPerPageChange,
  onDeletePost,
  onBulkDeletePosts,
  currentUserRole
}) => {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Clear selections when posts data changes
  useEffect(() => {
    setSelectedPosts([]);
    setSelectAll(false);
  }, [posts]);

  // Update selectAll state based on selected posts
  useEffect(() => {
    if (posts.length > 0) {
      const allPostIds = posts.map(post => post.id || post.ID).filter(Boolean) as number[];
      const allSelected = allPostIds.length > 0 && allPostIds.every(id => selectedPosts.includes(id));
      setSelectAll(allSelected);
    }
  }, [selectedPosts, posts]);

  // Handle individual post selection
  const handlePostSelection = (postId: number, checked: boolean) => {
    if (checked) {
      setSelectedPosts(prev => [...prev, postId]);
    } else {
      setSelectedPosts(prev => prev.filter(id => id !== postId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allPostIds = posts.map(post => post.id || post.ID).filter(Boolean) as number[];
      setSelectedPosts(allPostIds);
    } else {
      setSelectedPosts([]);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedPosts.length === 0) {
      alert('Please select posts to delete.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedPosts.length} selected posts? This action cannot be undone!`
    );

    if (confirmed && onBulkDeletePosts) {
      onBulkDeletePosts(selectedPosts);
      setSelectedPosts([]);
    }
  };
  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectAll}
          onChange={(e) => handleSelectAll(e.target.checked)}
          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
      ),
      render: (_: any, post: Post) => (
        <input
          type="checkbox"
          checked={selectedPosts.includes(post.id || post.ID || 0)}
          onChange={(e) => handlePostSelection(post.id || post.ID || 0, e.target.checked)}
          className="rounded border-gray-300 text-red-600 focus:ring-red-500"
        />
      )
    },
    {
      key: 'image',
      label: 'Image',
      render: (_: any, post: Post) => (
        <div className="h-12 w-20">
          {post.featured_image ? (
            <img
              src={post.featured_image}
              alt={post.title || post.post_title || 'Thumbnail'}
              className="h-full w-full object-cover rounded border border-gray-200"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gray-100 border border-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
              No Image
            </div>
          )}
        </div>
      )
    },
    {
      key: 'title',
      label: 'Title',
      render: (_: any, post: Post) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{post.title || post.post_title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt || post.post_excerpt}</div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (_: any, post: Post) => (
        <span className="text-sm text-gray-900">
          {post.author?.display_name || post.author?.user_login || post.author_login || `User ${post.post_author || post.author?.ID}`}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (_: any, post: Post) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          (post.status || post.post_status) === 'publish' ? 'bg-green-100 text-green-800' :
          (post.status || post.post_status) === 'draft' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {post.status || post.post_status}
        </span>
      )
    },
    {
      key: 'date',
      label: 'Date',
      render: (_: any, post: Post) => (
        <span className="text-sm text-gray-500">
          {new Date(post.date || post.post_date || new Date()).toLocaleDateString('id-ID')}
        </span>
      )
    },
    {
      key: 'views',
      label: 'Views',
      render: (_: any, post: Post) => (
        <span className="text-sm text-gray-500">
          {post.view_count || post.views || 0}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, post: Post) => (
        <div className="text-sm font-medium space-x-2 flex flex-wrap gap-1">
          <a
            href={`/tulis?edit=${post.id || post.ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Edit
          </a>
          <a
            href={`/posts/${post.id || post.ID}/analytics`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Analytics
          </a>
          {onDeletePost && (currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
            <button
              onClick={() => {
                const postTitle = post.title || post.post_title || 'Untitled';
                const authorName = post.author?.display_name || post.author_login || 'Unknown';
                if (window.confirm(`Are you sure you want to DELETE the article "${postTitle}" by ${authorName}? This action CANNOT be undone!`)) {
                  onDeletePost(post.id || post.ID || 0);
                }
              }}
              className="inline-flex items-center px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
              title="Permanently delete this article"
            >
              Delete
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium text-gray-900">Posts Management</h2>
          {selectedPosts.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedPosts.length} selected
              </span>
              {onBulkDeletePosts && (currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected
                </button>
              )}
              <button
                onClick={() => {
                  setSelectedPosts([]);
                }}
                className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onToggleFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <FilterPanel
        filters={filters}
        users={users}
        onFilterChange={onFilterChange}
        onResetFilters={onResetFilters}
        onApplyFilters={onApplyFilters}
        onClose={() => onToggleFilters()}
        isVisible={showFilters}
      />

      <DataTable
        columns={columns}
        data={posts}
        loading={loading}
        emptyMessage="No posts found."
      />

      {!loading && posts.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
};
