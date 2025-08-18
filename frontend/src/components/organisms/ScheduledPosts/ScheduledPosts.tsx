import React, { useState, useEffect } from 'react';
import { schedulerAPI } from '../../../services/api/scheduler';

interface ScheduledPost {
  ID: number;
  post_title: string;
  post_content: string;
  post_status: string;
  scheduled_publish_date: string;
  scheduling_notes: string | null;
  author: {
    ID: number;
    display_name: string;
    user_login: string;
  };
  schedule_info?: {
    scheduled_by_name?: string;
    notes?: string;
    created_at: string;
  };
}

interface ScheduledPostsProps {
  posts: ScheduledPost[];
  loading: boolean;
  onRefresh: () => void;
}

const ScheduledPosts: React.FC<ScheduledPostsProps> = ({ posts, loading, onRefresh }) => {
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<number, string> = {};
      
      posts.forEach(post => {
        const scheduledTime = new Date(post.scheduled_publish_date).getTime();
        const now = new Date().getTime();
        const diff = scheduledTime - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          if (days > 0) {
            newCountdowns[post.ID] = `${days}d ${hours}h ${minutes}m ${seconds}s`;
          } else if (hours > 0) {
            newCountdowns[post.ID] = `${hours}h ${minutes}m ${seconds}s`;
          } else if (minutes > 0) {
            newCountdowns[post.ID] = `${minutes}m ${seconds}s`;
          } else {
            newCountdowns[post.ID] = `${seconds}s`;
          }
        } else {
          newCountdowns[post.ID] = 'Ready to publish!';
        }
      });
      
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    
    return () => clearInterval(interval);
  }, [posts]);

  const handleForcePublish = async (postId: number) => {
    const post = posts.find(p => p.ID === postId);
    const postTitle = post?.post_title || `Post ID ${postId}`;
    
    if (confirm(`Are you sure you want to force publish "${postTitle}" immediately?`)) {
      try {
        console.log(`🚀 Force publishing post ${postId}...`);
        const result = await schedulerAPI.forcePublishPost(postId);
        
        if (result.success) {
          alert(`✅ "${postTitle}" has been published successfully!`);
          console.log('✅ Force publish successful:', result);
          onRefresh();
        } else {
          throw new Error(result.message || 'Unknown error');
        }
      } catch (error: any) {
        console.error('❌ Error force publishing:', error);
        alert(`❌ Error publishing "${postTitle}": ${error.message || 'Please try again.'}`);
      }
    }
  };

  const handleCancelSchedule = async (postId: number) => {
    if (confirm('Are you sure you want to cancel the schedule for this post?')) {
      try {
        await schedulerAPI.cancelSchedule(postId, 'Cancelled by admin');
        alert('Schedule cancelled successfully!');
        onRefresh();
      } catch (error) {
        console.error('Error cancelling schedule:', error);
        alert('Error cancelling schedule. Please try again.');
      }
    }
  };

  const formatScheduleDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading scheduled posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Scheduled Posts</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Posts</h3>
          <p className="text-gray-500">All posts are published or there are no scheduled posts yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post.ID} className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {post.post_title}
                    </h3>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <span className="mr-1">👤</span>
                          {post.author.display_name}
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">📅</span>
                          {formatScheduleDate(post.scheduled_publish_date)}
                        </span>
                      </div>
                      
                      {post.scheduling_notes && (
                        <div className="flex items-start">
                          <span className="mr-1 mt-0.5">📝</span>
                          <span className="italic">{post.scheduling_notes}</span>
                        </div>
                      )}
                      
                      {post.schedule_info?.scheduled_by_name && (
                        <div className="flex items-center">
                          <span className="mr-1">👨‍💼</span>
                          <span>Scheduled by: {post.schedule_info.scheduled_by_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end space-y-3">
                    {/* Countdown */}
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Time until publish:</div>
                      <div className={`text-lg font-mono font-bold px-3 py-1 rounded-lg ${
                        countdowns[post.ID] === 'Ready to publish!' 
                          ? 'bg-green-100 text-green-800 animate-pulse' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {countdowns[post.ID] || 'Calculating...'}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleForcePublish(post.ID)}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                        title="Force publish now"
                      >
                        🚀 Publish Now
                      </button>
                      
                      <button
                        onClick={() => handleCancelSchedule(post.ID)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded transition-colors"
                        title="Cancel schedule"
                      >
                        ❌ Cancel
                      </button>
                      
                      <a
                        href={`/tulis?edit=${post.ID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                        title="Edit post"
                      >
                        ✏️ Edit
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* Post excerpt */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 line-clamp-3">
                    {post.post_content.replace(/<[^>]*>/g, '').substring(0, 200)}...
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">🐛 Debug Info</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div>Total scheduled posts: {posts.length}</div>
          <div>Last updated: {new Date().toLocaleString()}</div>
          <button
            onClick={() => schedulerAPI.publishNow().then(() => alert('Manual publish trigger sent!'))}
            className="mt-2 px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded"
          >
            🔧 Trigger Manual Publish Check
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduledPosts;