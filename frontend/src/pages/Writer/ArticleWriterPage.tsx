import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import '../../styles/editor.css';

interface ArticleData {
  title: string;
  content: string;
  description: string;
  summary_social: string;
  channel: string;
  topic: string;
  keyword: string;
  publish_date: string;
  location: string;
  mark_as_18_plus: boolean;
  status: 'draft' | 'published' | 'pending';
  featured_image?: string;
}

const ArticleWriterPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  // Check if in edit mode
  const urlParams = new URLSearchParams(window.location.search);
  const [editId, setEditId] = useState<string | null>(urlParams.get('edit'));
  const [isEditMode, setIsEditMode] = useState<boolean>(!!editId);
  
  // Debug: Enable these logs if needed for debugging
  // console.log('🔧 Debug: URL params:', window.location.search);
  // console.log('🔧 Debug: editId:', editId);
  // console.log('🔧 Debug: isEditMode:', isEditMode);
  // console.log('🔧 Debug: User auth status:', { isAuthenticated, user: user?.user_login });
  
  // State management
  const [article, setArticle] = useState<ArticleData>({
    title: '',
    content: '',
    description: '',
    summary_social: '',
    channel: 'news',
    topic: '',
    keyword: '',
    publish_date: new Date().toISOString().slice(0, 16),
    location: '',
    mark_as_18_plus: false,
    status: 'draft',
    featured_image: ''
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [isLoadingArticle, setIsLoadingArticle] = useState(true); // Always start as loading in edit mode
  const isSavingRef = useRef(false); // Prevent multiple simultaneous saves
  const [charCount, setCharCount] = useState({
    title: 0,
    description: 0,
    summary_social: 0,
    content: 0
  });
  
  // Featured image state
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
  const [wordCount, setWordCount] = useState(0);
  
  // Popular tags state
  const [popularTags, setPopularTags] = useState<{
    popularChannels: any[];
    popularTags: any[];
    defaultChannels: string[];
  }>({
    popularChannels: [],
    popularTags: [],
    defaultChannels: ['News', 'Entertainment', 'Tekno & Sains', 'Bisnis', 'Bola & Sports', 'Otomotif', 'Woman', 'Food & Travel', 'Mom', 'Bolanita']
  });

  const quillRef = useRef<ReactQuill>(null);

  // Fetch popular tags on component mount
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/category/popular-tags');
        if (response.ok) {
          const data = await response.json();
          setPopularTags(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch popular tags:', error);
      }
    };

    fetchPopularTags();
  }, []);

  // Custom image upload handler
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
          const response = await fetch('http://localhost:3001/api/writer/upload-image', {
            method: 'POST',
            credentials: 'include',
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.url) {
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const range = quill.getSelection();
                quill.insertEmbed(range?.index || 0, 'image', result.data.url);
              }
            }
          } else {
            alert('Gagal mengupload gambar');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          alert('Gagal mengupload gambar');
        }
      }
    };
  }, []);

  // Featured image upload handler
  const handleFeaturedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://localhost:3001/api/writer/upload-image', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFeaturedImagePreview(result.data.url);
          setArticle(prev => ({ ...prev, featured_image: result.data.url }));
          setSaveStatus('unsaved');
        }
      } else {
        alert('Gagal mengupload featured image');
      }
    } catch (error) {
      console.error('Error uploading featured image:', error);
      alert('Gagal mengupload featured image');
    }
  };

  // Quill configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background',
    'align', 'code-block'
  ];

  // Auto-save function
  const autoSave = useCallback(async () => {
    console.log('🔧 Debug: Auto-save called with article:', { title: article.title, contentLength: article.content.length });
    
    if (isSavingRef.current ||
        saveStatus === 'saving' ||
        !article.title.trim()) {
      console.log('🔧 Debug: Auto-save skipped - validation failed or already saving');
      return;
    }

    // console.log('🔧 Debug: Auto-save starting with saveStatus:', saveStatus);
    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      // console.log('🔧 Debug: Auto-save called with:', { isEditMode, editId });
      
      const url = isEditMode 
        ? `http://localhost:3001/api/writer/articles/${editId}`
        : 'http://localhost:3001/api/writer/articles';
      
      // console.log('🔧 Debug: Auto-save URL:', url);
      // console.log('🔧 Debug: Auto-save method:', isEditMode ? 'PUT' : 'POST');
      
      // Debug log untuk melihat apakah featured_image ada
      console.log('🔧 Debug Frontend autoSave - article.featured_image:', article.featured_image);
      console.log('🔧 Debug Frontend autoSave - full article:', article);
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      });

      console.log('🔧 Debug Frontend autoSave - response status:', response.status);
      console.log('🔧 Debug Frontend autoSave - response ok:', response.ok);
      
      if (response.ok) {
        const result = await response.json();
        console.log('🔧 Debug Frontend autoSave - result:', result);
        setSaveStatus('saved');
      } else {
        const errorText = await response.text();
        console.error('❌ Frontend autoSave - error response:', response.status, errorText);
        setSaveStatus('unsaved');
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      setSaveStatus('unsaved');
    } finally {
      isSavingRef.current = false; // Reset saving flag
    }
  }, [article, saveStatus]);

  // Save Draft function
  const handleSaveDraft = async () => {
    if (isSavingRef.current) {
      console.log('🔧 Debug: Save draft skipped - save in progress');
      return;
    }
    
    try {
      console.log('🔧 Debug: Save draft called');
      isSavingRef.current = true;
      setSaveStatus('saving');
      
      const draftData = { ...article, status: 'draft' as const };
      
      console.log('🔧 Debug Frontend handleSaveDraft - draftData:', draftData);
      
      const url = isEditMode 
        ? `http://localhost:3001/api/writer/articles/${editId}`
        : 'http://localhost:3001/api/writer/articles';
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(draftData)
      });

      console.log('🔧 Debug Frontend handleSaveDraft - response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('🔧 Debug Frontend handleSaveDraft - result:', result);
        
        if (isEditMode) {
          alert('Draft berhasil disimpan!');
          setArticle(prev => ({ ...prev, status: 'draft' }));
        } else {
          alert(`Draft berhasil disimpan! ID: ${result.data.id}`);
          // Update to edit mode with the new ID
          setIsEditMode(true);
          setEditId(result.data.id);
          setArticle(prev => ({ ...prev, status: 'draft' }));
        }
        setSaveStatus('saved');
      } else {
        const errorData = await response.text();
        console.error('🔧 Debug Frontend handleSaveDraft - error response:', response.status, errorData);
        alert('Gagal menyimpan draft. Silakan coba lagi.');
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('🔧 Debug Frontend handleSaveDraft - error:', error);
      alert('Terjadi kesalahan saat menyimpan draft.');
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  };

  // Publish function
  const handlePublish = async () => {
    if (isSavingRef.current) {
      // console.log('🔧 Debug: Publish skipped - save in progress');
      return;
    }
    
    try {
      // console.log('🔧 Debug: Publish called with:', { isEditMode, editId });
      isSavingRef.current = true;
      
      const publishData = { ...article, status: 'published' as const };
      
      // Debug log untuk melihat apakah featured_image ada di publish
      console.log('🔧 Debug Frontend handlePublish - publishData.featured_image:', publishData.featured_image);
      console.log('🔧 Debug Frontend handlePublish - full publishData:', publishData);
      
      const url = isEditMode 
        ? `http://localhost:3001/api/writer/articles/${editId}`
        : 'http://localhost:3001/api/writer/articles';
      
      // console.log('🔧 Debug: Publish URL:', url);
      // console.log('🔧 Debug: Publish method:', isEditMode ? 'PUT' : 'POST');
      
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publishData)
      });

      console.log('🔧 Debug Frontend handlePublish - response status:', response.status);
      console.log('🔧 Debug Frontend handlePublish - response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('🔧 Debug Frontend handlePublish - result:', result);
        if (isEditMode) {
          alert(`Artikel berhasil diupdate dan dipublikasi!`);
          // Don't reset form in edit mode, just update status
          setArticle(prev => ({ ...prev, status: 'published' }));
        } else {
          alert(`Artikel berhasil dipublikasi! ID: ${result.data.id}`);
          // Reset form only for new articles
          setArticle({
            title: '',
            content: '',
            description: '',
            summary_social: '',
            channel: 'news',
            topic: '',
            keyword: '',
            publish_date: new Date().toISOString().slice(0, 16),
            location: '',
            mark_as_18_plus: false,
            status: 'draft',
            featured_image: ''
          });
          setFeaturedImagePreview('');
        }
        setSaveStatus('saved');
      } else {
        const errorText = await response.text();
        console.error('❌ Frontend handlePublish - error response:', response.status, errorText);
        try {
          const error = JSON.parse(errorText);
          alert(`Gagal mempublikasi artikel: ${error.message}`);
        } catch {
          alert(`Gagal mempublikasi artikel: ${response.status} ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Gagal mempublikasi artikel');
    } finally {
      isSavingRef.current = false; // Reset saving flag
    }
  };

  // Character counting
  useEffect(() => {
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };

    const contentText = stripHtml(article.content);
    const words = contentText.trim().split(/\s+/).filter(word => word.length > 0);

    setCharCount({
      title: article.title.length,
      description: article.description.length,
      summary_social: article.summary_social.length,
      content: contentText.length
    });
    setWordCount(words.length);
  }, [article]);

  // Auto-save trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      autoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [article, autoSave]);

  // Auth check
  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      alert('Anda harus login terlebih dahulu');
      window.location.href = '/login';
      return;
    }

    if (user && !['writer', 'admin', 'superadmin'].includes(user.user_role)) {
      alert('Anda tidak memiliki akses ke halaman ini');
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated, user, isLoading]);

  // Load article for editing
  useEffect(() => {
    // Debug: Enable these logs if needed for debugging
    console.log('🔧 Debug: useEffect triggered with:', { isEditMode, editId, isLoadingArticle });
    if (!isEditMode || !editId) {
      setIsLoadingArticle(false);
      return;
    }

    const loadArticle = async () => {
      try {
        console.log('🔧 Debug: Starting to load article for edit, editId:', editId);
        setIsLoadingArticle(true);
        const response = await fetch(`http://localhost:3001/api/writer/articles/${editId}`, {
          credentials: 'include'
        });
        
        console.log('🔧 Debug: Response status:', response.status, response.ok);
        
        if (response.ok) {
          const result = await response.json();
          console.log('🔧 Debug: Response data:', result);
          if (result.success && result.data) {
            const articleData = result.data;
            console.log('🔧 Debug: Article data extracted:', {
              title: articleData.title,
              content: articleData.content,
              excerpt: articleData.excerpt,
              status: articleData.status
            });
            
            const newArticle = {
              title: articleData.title || '',
              content: articleData.content || '',
              description: articleData.excerpt || '',
              summary_social: articleData.summary_social || '',
              channel: articleData.channel || 'news',
              topic: articleData.topic || '',
              keyword: articleData.keyword || '',
              publish_date: articleData.publish_date 
                ? new Date(articleData.publish_date).toISOString().slice(0, 16)
                : new Date().toISOString().slice(0, 16),
              location: articleData.location || '',
              mark_as_18_plus: articleData.mark_as_18_plus || false,
              status: (articleData.status === 'publish' ? 'published' : articleData.status === 'pending' ? 'pending' : 'draft') as 'draft' | 'published' | 'pending',
              featured_image: articleData.featured_image || ''
            };
            
            // Set featured image preview if exists
            if (articleData.featured_image) {
              setFeaturedImagePreview(articleData.featured_image);
            }
            
            // Check if writer is trying to edit pending post
            if (user?.user_role === 'writer' && articleData.status === 'pending') {
              alert('Artikel sedang dalam proses review dan tidak dapat diedit. Silakan tunggu hasil review dari admin.');
              window.location.href = '/profile';
              return;
            }
            
            console.log('🔧 Debug: Setting article to:', newArticle);
            setArticle(newArticle);
            setSaveStatus('saved');
          }
        } else {
          console.log('🔧 Debug: Response not OK:', response.status, response.statusText);
          const errorData = await response.text();
          console.log('🔧 Debug: Error response:', errorData);
          alert('Artikel tidak ditemukan atau Anda tidak memiliki akses');
          window.location.href = '/tulis';
        }
      } catch (error) {
        console.error('🔧 Debug: Error loading article:', error);
        alert('Gagal memuat artikel');
        window.location.href = '/tulis';
      } finally {
        setIsLoadingArticle(false);
      }
    };

    loadArticle();
  }, [isEditMode, editId]); // Remove isLoadingArticle from dependencies to avoid infinite loop

  // Loading state
  if (isLoading || isLoadingArticle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoading ? 'Memuat...' : 'Memuat artikel...'}
          </p>
        </div>
      </div>
    );
  }

  // Unauthorized access
  if (!isAuthenticated || (user && !['writer', 'admin', 'superadmin'].includes(user.user_role))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Artikel' : 'Tulis Artikel'}
              </h1>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs ${
                  saveStatus === 'saved' ? 'text-green-600 bg-green-50' :
                  saveStatus === 'saving' ? 'text-yellow-600 bg-yellow-50' :
                  saveStatus === 'error' ? 'text-red-600 bg-red-50' :
                  'text-gray-600 bg-gray-50'
                }`}>
                  {saveStatus === 'saved' ? 'Saved as DRAFT' :
                   saveStatus === 'saving' ? 'Menyimpan...' :
                   saveStatus === 'error' ? 'Error saat menyimpan' :
                   'Belum disimpan'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Simpan Draft
              </button>
              <button
                onClick={handlePublish}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-md hover:bg-yellow-600"
              >
                {(() => {
                  // Admin/SuperAdmin editing pending post
                  if (user && ['admin', 'superadmin'].includes(user.user_role) && isEditMode && article.status === 'pending') {
                    return `Publikasikan "${article.title.slice(0, 30)}${article.title.length > 30 ? '...' : ''}"`;
                  }
                  // Regular publish
                  return 'Publikasikan';
                })()}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Judul artikel..."
                value={article.title}
                onChange={(e) => setArticle(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-2xl font-bold border-none outline-none placeholder-gray-400 resize-none bg-transparent"
                style={{ fontSize: '32px', lineHeight: '1.2' }}
              />
              <div className="text-xs text-gray-500 mt-1">
                {charCount.title}/100 karakter
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="prose-editor">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={article.content}
                onChange={(content) => {
                  console.log('🔧 ReactQuill onChange triggered with content:', content);
                  setArticle(prev => ({ ...prev, content }));
                }}
                modules={modules}
                formats={formats}
                placeholder="Mulai menulis artikel Anda..."
                style={{ minHeight: '400px' }}
              />
              <div className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>{charCount.content} karakter</span>
                <span>{wordCount} kata</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Deskripsi singkat artikel..."
                value={article.description}
                onChange={(e) => setArticle(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                {charCount.description}/160 karakter
              </div>
            </div>

            {/* Summary Social */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary Social
              </label>
              <textarea
                placeholder="Ringkasan untuk media sosial..."
                value={article.summary_social}
                onChange={(e) => setArticle(prev => ({ ...prev, summary_social: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none"
                rows={3}
              />
              <div className="text-xs text-gray-500 mt-1">
                {charCount.summary_social}/160 karakter
              </div>
            </div>

            {/* Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Featured Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                className="w-full p-3 border border-gray-300 rounded-md text-sm"
              />
              {featuredImagePreview && (
                <div className="mt-2">
                  <img 
                    src={featuredImagePreview} 
                    alt="Featured preview" 
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFeaturedImagePreview('');
                      setArticle(prev => ({ ...prev, featured_image: '' }));
                    }}
                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                  >
                    Hapus gambar
                  </button>
                </div>
              )}
            </div>

            {/* Channel & Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channel & Tags
              </label>
              
              {/* Popular Channels */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Channel Populer:</p>
                <div className="flex flex-wrap gap-2">
                  {/* Default channels */}
                  {popularTags.defaultChannels.map((channel) => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => {
                        const channelTag = channel.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
                        if (article.channel === channelTag) {
                          setArticle(prev => ({ ...prev, channel: '' }));
                        } else {
                          setArticle(prev => ({ ...prev, channel: channelTag }));
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        article.channel === channel.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                  
                  {/* Popular channels from database (first 10) */}
                  {popularTags.popularChannels.slice(0, 10).map((channel) => (
                    <button
                      key={channel.slug}
                      type="button"
                      onClick={() => {
                        if (article.channel === channel.slug) {
                          setArticle(prev => ({ ...prev, channel: '' }));
                        } else {
                          setArticle(prev => ({ ...prev, channel: channel.slug }));
                        }
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        article.channel === channel.slug
                          ? 'bg-green-500 text-white border-green-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {channel.name} ({channel.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Channel Input */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Atau tulis channel baru..."
                  value={article.channel}
                  onChange={(e) => setArticle(prev => ({ ...prev, channel: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm"
                />
              </div>

              {/* Tags (Topic + Keywords combined) */}
              <div>
                <p className="text-xs text-gray-500 mb-2">Tags (topic, keywords, dll):</p>
                
                {/* Popular tags suggestions */}
                {popularTags.popularTags.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-400 mb-1">Tags populer (klik untuk tambahkan):</p>
                    <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                      {popularTags.popularTags.slice(0, 20).map((tag) => (
                        <button
                          key={tag.slug}
                          type="button"
                          onClick={() => {
                            const currentTags = `${article.topic ? article.topic : ''}${article.topic && article.keyword ? ', ' : ''}${article.keyword ? article.keyword : ''}`;
                            const newTags = currentTags ? `${currentTags}, ${tag.name}` : tag.name;
                            
                            const tags = newTags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
                            const topic = tags.length > 0 ? tags[0] : '';
                            const keywords = tags.length > 1 ? tags.slice(1).join(', ') : '';
                            
                            setArticle(prev => ({ 
                              ...prev, 
                              topic: topic,
                              keyword: keywords
                            }));
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        >
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <textarea
                  placeholder="Tulis tags dipisahkan dengan koma. Contoh: garut, budaya lokal, pariwisata, kuliner, pendidikan, dll..."
                  value={`${article.topic ? article.topic : ''}${article.topic && article.keyword ? ', ' : ''}${article.keyword ? article.keyword : ''}`}
                  onChange={(e) => {
                    // Split tags and put first one as topic, rest as keywords
                    const tags = e.target.value.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag);
                    const topic = tags.length > 0 ? tags[0] : '';
                    const keywords = tags.length > 1 ? tags.slice(1).join(', ') : '';
                    
                    setArticle(prev => ({ 
                      ...prev, 
                      topic: topic,
                      keyword: keywords
                    }));
                  }}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Tag pertama akan jadi topic utama, sisanya jadi keywords
                </p>
              </div>
            </div>

            {/* Date & Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Location
              </label>
              <input
                type="datetime-local"
                value={article.publish_date}
                onChange={(e) => setArticle(prev => ({ ...prev, publish_date: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md text-sm mb-3"
              />
              <input
                type="text"
                placeholder="Lokasi..."
                value={article.location}
                onChange={(e) => setArticle(prev => ({ ...prev, location: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-md text-sm"
              />
            </div>

            {/* Mark As 18+ */}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={article.mark_as_18_plus}
                  onChange={(e) => setArticle(prev => ({ ...prev, mark_as_18_plus: e.target.checked }))}
                  className="rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">Mark As 18+</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleWriterPage;