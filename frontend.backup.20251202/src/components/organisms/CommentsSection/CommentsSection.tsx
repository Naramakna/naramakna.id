import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext/AuthContext';

interface Comment {
  id: number;
  content: string;
  author: {
    name: string;
    email: string;
    user: {
      id: number;
      display_name: string;
      user_login: string;
      profile_image: string | null;
    } | null;
  };
  date: string;
  parent_id: number;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: string | number;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://dev.naramakna.id/api/comments/post/${postId}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setComments(result.data.comments || []);
          }
        } else {
          console.error('Failed to fetch comments');
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCommentContent.trim()) return;
    if (!isAuthenticated) {
      alert('Anda harus login untuk berkomentar');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://dev.naramakna.id/api/comments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId: postId,
          content: newCommentContent.trim()
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Add new comment to the list
          setComments(prev => [...prev, result.data]);
          setNewCommentContent('');
        }
      } else {
        alert('Gagal mengirim komentar');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Gagal mengirim komentar');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId: number) => {
    if (!replyContent.trim()) return;
    if (!isAuthenticated) {
      alert('Anda harus login untuk membalas');
      return;
    }

    try {
      const response = await fetch('http://dev.naramakna.id/api/comments', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postId: postId,
          content: replyContent.trim(),
          parentId: parentId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Add reply to the parent comment
          setComments(prev => prev.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...(comment.replies || []), result.data]
              };
            }
            return comment;
          }));
          setReplyContent('');
          setReplyingTo(null);
        }
      } else {
        alert('Gagal mengirim balasan');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Gagal mengirim balasan');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} jam yang lalu`;
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    return date.toLocaleDateString('id-ID');
  };

  // Render single comment
  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`comment ${isReply ? 'ml-8 mt-4' : 'mb-6'} p-4 border border-gray-200 rounded-lg bg-white text-left`}>
      <div className="comment-header flex items-center space-x-3 mb-3">
        <div className="avatar w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
          {comment.author.user?.profile_image ? (
            <img 
              src={comment.author.user.profile_image} 
              alt={comment.author.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.warn('Comment profile image failed to load:', comment.author.user.profile_image);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-white font-bold">
              {comment.author.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <div className="font-medium text-gray-900">{comment.author.name}</div>
          <div className="text-sm text-gray-500">{formatDate(comment.date)}</div>
        </div>
      </div>
      <div className="comment-content text-gray-700 mb-3 leading-relaxed">
        {comment.content}
      </div>
      
      {!isReply && (
        <div className="comment-actions">
          <button 
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {replyingTo === comment.id ? 'Batal' : 'Balas'}
          </button>
        </div>
      )}

      {/* Reply form */}
      {replyingTo === comment.id && (
        <div className="reply-form mt-4 p-3 bg-gray-50 rounded-lg">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg resize-none text-sm"
            rows={2}
            placeholder="Tulis balasan Anda..."
          />
          <div className="flex justify-end mt-2 space-x-2">
            <button 
              onClick={() => {
                setReplyingTo(null);
                setReplyContent('');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Batal
            </button>
            <button 
              onClick={() => handleSubmitReply(comment.id)}
              disabled={!replyContent.trim()}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kirim
            </button>
          </div>
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="replies mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="border-t border-gray-200 pt-8 mt-12 text-left">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          {comments.length} Komentar
        </h3>
      </div>
      
      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.profile_image ? (
                  <img 
                    src={user.profile_image.startsWith('/') ? `http://dev.naramakna.id${user.profile_image}` : user.profile_image} 
                    alt={user.display_name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.warn('Profile image failed to load:', user.profile_image);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-white font-bold">
                    {user?.display_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newCommentContent}
                onChange={(e) => setNewCommentContent(e.target.value)}
                placeholder="Tulis komentar..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={isSubmitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newCommentContent.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Mengirim...</span>
                    </span>
                  ) : (
                    'Kirim'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-3">Anda harus login untuk berkomentar</p>
          <a 
            href="/login" 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </a>
        </div>
      )}

      {/* Comments list */}
      <div className="comments-list">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          /* Empty State - matching Kumparan's cute illustration */
          <div className="text-center py-16">
            <div className="mx-auto w-64 h-48 mb-6">
              {/* Cute illustration like Kumparan */}
              <div className="relative">
                {/* Background cards */}
                <div className="absolute top-0 left-8 w-48 h-16 bg-teal-200 rounded-lg opacity-60"></div>
                <div className="absolute bottom-0 left-8 w-48 h-16 bg-teal-200 rounded-lg opacity-60"></div>
                
                {/* Main character */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 bg-blue-100 rounded-2xl relative overflow-hidden">
                    {/* Person illustration */}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                      <div className="w-16 h-16 bg-yellow-300 rounded-full relative">
                        {/* Hair */}
                        <div className="absolute top-2 left-3 w-10 h-8 bg-yellow-400 rounded-t-full"></div>
                        {/* Face */}
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-10 bg-yellow-200 rounded-full">
                          {/* Eyes */}
                          <div className="absolute top-2 left-2 w-2 h-1 bg-gray-700 rounded-full"></div>
                          <div className="absolute top-2 right-2 w-2 h-1 bg-gray-700 rounded-full"></div>
                          {/* Mouth */}
                          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-3 h-1 bg-gray-700 rounded-full"></div>
                        </div>
                      </div>
                      {/* Body */}
                      <div className="w-12 h-12 bg-teal-400 rounded-t-lg mt-1"></div>
                      {/* Arms holding the frame */}
                      <div className="absolute top-8 -left-2 w-3 h-8 bg-yellow-300 rounded-full rotate-12"></div>
                      <div className="absolute top-8 -right-2 w-3 h-8 bg-yellow-300 rounded-full -rotate-12"></div>
                    </div>
                    
                    {/* Small decorative elements */}
                    <div className="absolute top-4 right-4 w-2 h-2 bg-red-400 rounded-full"></div>
                    <div className="absolute top-8 left-4 w-1 h-1 bg-yellow-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Belum ada komentar</h4>
            <p className="text-gray-500">Jadilah yang pertama memberikan komentar pada artikel ini!</p>
          </div>
        )}
      </div>
    </div>
  );
};