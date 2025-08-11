import React, { useState, useEffect } from 'react';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { LoadingSpinner } from '../../components/atoms/LoadingSpinner/LoadingSpinner';

interface PollOption {
  id?: string;
  text: string;
  order: number;
}

interface Poll {
  id: string;
  title: string;
  question: string;
  category: string;
  status: 'active' | 'closed' | 'draft';
  total_votes: number;
  created_at: string;
  expires_at?: string;
  image_url?: string;
  source_article_id?: string;
  options: PollOption[];
}

interface TrendingPost {
  ID: string;
  post_title: string;
  post_excerpt: string;
  trending_score: number;
  view_count: number;
  categories: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  status: string;
  view_count: number;
  author: {
    ID: number;
    display_name: string;
    user_login: string;
  };
}

export const AdminPolling: React.FC = () => {
  // State management
  const [polls, setPolls] = useState<Poll[]>([]);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTrendingGenerator, setShowTrendingGenerator] = useState(false);
  const [showArticleSelector, setShowArticleSelector] = useState(false);

  // Form state
  const [newPoll, setNewPoll] = useState({
    title: '',
    question: '',
    category: '',
    expires_at: '',
    source_article_id: ''
  });
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { text: '', order: 1 },
    { text: '', order: 2 }
  ]);

  // Fetch existing polls (for admin - all polls with full details)
  const fetchPolls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/polling/admin/all?limit=50', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPolls(data.data || []);
      } else {
        // Fallback to active polls if admin endpoint doesn't exist
        const fallbackResponse = await fetch('http://localhost:3001/api/polling/active?limit=50', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.success) {
          setPolls(fallbackData.data.polls || []);
        }
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  // Fetch trending posts for poll generation
  const fetchTrendingPosts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/polling/trending-candidates?limit=10', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTrendingPosts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    }
  };

  // Fetch recent articles for poll creation
  const fetchArticles = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/content/posts-with-views?limit=50&status=publish', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setArticles(data.data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPolls(), fetchTrendingPosts(), fetchArticles()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Add new poll option
  const addPollOption = () => {
    setPollOptions([...pollOptions, { text: '', order: pollOptions.length + 1 }]);
  };

  // Remove poll option
  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  // Update poll option text
  const updatePollOption = (index: number, text: string) => {
    const updated = [...pollOptions];
    updated[index].text = text;
    setPollOptions(updated);
  };

  // Create new poll
  const createPoll = async () => {
    if (!newPoll.title || !newPoll.question || pollOptions.some(opt => !opt.text.trim())) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('http://localhost:3001/api/polling/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...newPoll,
          options: pollOptions.map(opt => ({ option_text: opt.text, option_order: opt.order }))
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Poll created successfully!');
        setShowCreateForm(false);
        setNewPoll({ title: '', question: '', category: '', expires_at: '', source_article_id: '' });
        setPollOptions([{ text: '', order: 1 }, { text: '', order: 2 }]);
        await fetchPolls();
      } else {
        alert('Error creating poll: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Error creating poll');
    } finally {
      setCreating(false);
    }
  };

  // Generate poll from trending post
  const generatePollFromPost = async (post: TrendingPost) => {
    setCreating(true);
    try {
      const response = await fetch('http://localhost:3001/api/polling/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          source_article_id: post.ID,
          title: post.post_title || `Poll for Post #${post.ID}`,
          category: post.categories || 'General'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Poll generated successfully from trending post!');
        setShowTrendingGenerator(false);
        await fetchPolls();
      } else {
        alert('Error generating poll: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating poll:', error);
      alert('Error generating poll');
    } finally {
      setCreating(false);
    }
  };

  // Generate poll from selected article
  const generatePollFromArticle = async (article: Article) => {
    setCreating(true);
    try {
      const response = await fetch('http://localhost:3001/api/polling/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          source_article_id: article.id,
          title: `Polling: ${article.title}`,
          category: 'General'
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Poll generated successfully from article!');
        setShowArticleSelector(false);
        await fetchPolls();
      } else {
        alert('Error generating poll: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating poll:', error);
      alert('Error generating poll');
    } finally {
      setCreating(false);
    }
  };

  // Select article for manual poll creation
  const selectArticleForPoll = (article: Article) => {
    setNewPoll({
      title: `Polling: ${article.title}`,
      question: `Apa pendapat Anda tentang artikel: ${article.title}?`,
      category: 'General',
      expires_at: '',
      source_article_id: article.id.toString()
    });
    setShowArticleSelector(false);
    setShowCreateForm(true);
  };

  // Close poll
  const closePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to close this poll?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/polling/${pollId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Poll closed successfully!');
        await fetchPolls();
      } else {
        alert('Error closing poll: ' + data.message);
      }
    } catch (error) {
      console.error('Error closing poll:', error);
      alert('Error closing poll');
    }
  };

  // View poll results
  const viewPollResults = (pollId: string) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    
    const resultText = `
Poll: ${poll.title}
Total Votes: ${poll.total_votes || 0}

Results:
${poll.options.map((opt: any) => 
  `• ${opt.option_text || opt.text}: ${opt.vote_count || 0} votes (${opt.percentage || 0}%)`
).join('\n')}
    `;
    
    alert(resultText);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Polling Management</h1>
          <p className="text-gray-600">Create and manage polls for your audience</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowTrendingGenerator(!showTrendingGenerator)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <span>📈</span>
            <span>Generate from Trending</span>
          </Button>
          <Button
            onClick={() => setShowArticleSelector(!showArticleSelector)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <span>📰</span>
            <span>Select from Articles</span>
          </Button>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Create New Poll</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Polls</p>
              <p className="text-2xl font-bold">{polls.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Polls</p>
              <p className="text-2xl font-bold">{polls.filter(p => p.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🗳️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Votes</p>
              <p className="text-2xl font-bold">{polls.reduce((sum, poll) => sum + (Number(poll.total_votes) || 0), 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Article Selector */}
      {showArticleSelector && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Select Article for Poll</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {articles.map(article => {
              // Extract first image from content
              const imgMatch = article.content?.match(/<img[^>]+src="([^"]+)"/);
              const imageUrl = imgMatch ? imgMatch[1] : null;
              
              return (
                <div key={article.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div className="flex space-x-4 flex-1">
                    {/* Article Image Preview */}
                    {imageUrl && (
                      <div className="flex-shrink-0">
                        <img 
                          src={imageUrl} 
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Article Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{article.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">
                        {article.excerpt?.substring(0, 150) + '...' || 'No description available'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>🆔 ID: {article.id}</span>
                        <span>👁️ Views: {article.view_count || 0}</span>
                        <span>📅 {new Date(article.date).toLocaleDateString()}</span>
                        <span>✍️ {article.author.display_name}</span>
                        {imageUrl && <span>🖼️ Has Image</span>}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 ml-4">
                    <Button
                      onClick={() => generatePollFromArticle(article)}
                      disabled={creating}
                      size="sm"
                      variant="outline"
                    >
                      {creating ? '⏳' : '🔄'} Auto Generate
                    </Button>
                    <Button
                      onClick={() => selectArticleForPoll(article)}
                      size="sm"
                    >
                      📝 Create Custom
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trending Posts Generator */}
      {showTrendingGenerator && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Generate Poll from Trending Posts</h2>
          <div className="space-y-4">
            {trendingPosts.map(post => (
              <div key={post.ID} className="border rounded-lg p-4 flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {post.post_title || `Post #${post.ID}`}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    {post.post_excerpt || 'No description available'}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>📈 Trending Score: {post.trending_score}</span>
                    <span>👁️ Views: {post.view_count}</span>
                    <span>🏷️ {post.categories || 'No category'}</span>
                  </div>
                </div>
                <Button
                  onClick={() => generatePollFromPost(post)}
                  disabled={creating}
                  size="sm"
                  className="ml-4"
                >
                  {creating ? '⏳' : '🔄'} Generate Poll
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Poll Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Create New Poll</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poll Title *</label>
                <Input
                  value={newPoll.title}
                  onChange={(e) => setNewPoll({ ...newPoll, title: e.target.value })}
                  placeholder="Enter poll title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <Input
                  value={newPoll.category}
                  onChange={(e) => setNewPoll({ ...newPoll, category: e.target.value })}
                  placeholder="e.g., Politics, Sports, Tech"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Poll Question *</label>
              <textarea
                value={newPoll.question}
                onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                placeholder="What do you want to ask your audience?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {newPoll.source_article_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Linked Article</label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-600">
                    📰 Article ID: {newPoll.source_article_id}
                    <button
                      type="button"
                      onClick={() => setNewPoll({ ...newPoll, source_article_id: '', title: '', question: '' })}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ✕ Unlink
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={newPoll.expires_at}
                  onChange={(e) => setNewPoll({ ...newPoll, expires_at: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Poll Options *</label>
                <Button onClick={addPollOption} size="sm" variant="outline">
                  ➕ Add Option
                </Button>
              </div>
              {pollOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-500 w-8">{index + 1}.</span>
                  <Input
                    value={option.text}
                    onChange={(e) => updatePollOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1"
                  />
                  {pollOptions.length > 2 && (
                    <Button
                      onClick={() => removePollOption(index)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                    >
                      🗑️
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={createPoll}
                disabled={creating}
              >
                {creating ? '⏳ Creating...' : '✅ Create Poll'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Existing Polls Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Existing Polls</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poll
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Votes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {polls.map((poll) => (
                <tr key={poll.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {/* Poll Image */}
                      {poll.image_url && (
                        <div className="flex-shrink-0">
                          <img 
                            src={poll.image_url} 
                            alt={poll.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Poll Info */}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{poll.title}</div>
                        <div className="text-sm text-gray-500">{poll.question}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {poll.options.length} options
                          {poll.source_article_id && (
                            <span className="ml-2">📰 Article #{poll.source_article_id}</span>
                          )}
                          {poll.image_url && (
                            <span className="ml-2">🖼️ Has Image</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {poll.category || 'General'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      poll.status === 'active' ? 'bg-green-100 text-green-800' :
                      poll.status === 'closed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {poll.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {poll.total_votes}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {poll.status === 'active' && (
                        <button
                          onClick={() => closePoll(poll.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Close
                        </button>
                      )}
                      <button 
                        onClick={() => viewPollResults(poll.id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Results
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
