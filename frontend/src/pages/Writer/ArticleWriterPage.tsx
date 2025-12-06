import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { useAuth } from '../../contexts/AuthContext/AuthContext';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import '../../styles/editor.css';
import ScheduleModal from '../../components/molecules/ScheduleModal';
import { schedulerAPI } from '../../services/api/scheduler';
import type { ScheduledPost, ScheduleRequest } from '../../services/api/scheduler';
import { buildApiUrl } from '../../config/api';
import { ImagePreview } from '../../components/molecules/ImagePreview';

// Helper function to format date to local datetime string for input
const formatLocalDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

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
  featured_image_caption?: string;
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
    channel: '',
    topic: '',
    keyword: '',
    publish_date: formatLocalDateTime(new Date()),
    location: '',
    mark_as_18_plus: false,
    status: 'draft',
    featured_image: '',
    featured_image_caption: ''
  });

  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  
  // Scheduling state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [currentPostForScheduling, setCurrentPostForScheduling] = useState<ScheduledPost | null>(null);
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
    defaultChannels: []
  });

  // Image captions state for editor images
  const [imageCaptions, setImageCaptions] = useState<Record<string, string>>({});
  const isAutoSaveEnabled = (import.meta.env.VITE_ENABLE_AUTOSAVE ?? 'false') === 'true';

  // Responsive state for toolbar
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Default to desktop
  });

  const quillRef = useRef<ReactQuill>(null);

  // Fetch popular tags on component mount
  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        const response = await fetch(buildApiUrl('category/popular-tags'));
        if (response.ok) {
          const data = await response.json();
          // Use only dynamic channels from database, no hardcoded defaults
          setPopularTags({
            ...data.data,
            defaultChannels: [] // No hardcoded defaults, all channels come from database
          });
        }
      } catch (error) {
        console.error('Failed to fetch popular tags:', error);
      }
    };


    fetchPopularTags();
  }, []);


  // Custom image upload handler - langsung insert tanpa modal
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
          const token = localStorage.getItem('token');
          const response = await fetch(buildApiUrl('writer/upload-image'), {
            method: 'POST',
            credentials: 'include',
            headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.url) {
              const quill = quillRef.current?.getEditor();
              if (quill) {
                const range = quill.getSelection();
                // Langsung insert gambar ke editor
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

      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('writer/upload-image'), {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
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

  // Handle image caption changes
  const handleImageCaptionChange = (imageSrc: string, caption: string) => {
    console.log('📸 [FRONTEND] Image caption changed:', imageSrc, 'Caption:', caption);
    setImageCaptions(prev => {
      const updated = {
        ...prev,
        [imageSrc]: caption
      };
      console.log('📸 [FRONTEND] Updated imageCaptions state:', updated);
      return updated;
    });
  };

  // Window resize handler for responsive toolbar
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Full toolbar configuration for all devices
  const getToolbarConfig = () => {
    const isMobile = windowWidth < 640; // sm breakpoint
    const isTablet = windowWidth < 1024; // lg breakpoint
    
    console.log('🔧 getToolbarConfig - windowWidth:', windowWidth, 'isMobile:', isMobile, 'isTablet:', isTablet);
    
    if (isMobile) {
      // Mobile - full toolbar with better mobile layout
      console.log('📱 Using mobile toolbar config (full features)');
      return [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ];
    } else if (isTablet) {
      // Tablet - full toolbar same as desktop
      console.log('📟 Using tablet toolbar config (full features)');
      return [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ];
    } else {
      // Desktop - full toolbar
      console.log('💻 Using desktop toolbar config (full features)');
      return [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ];
    }
  };

  const modules = React.useMemo(() => ({
    toolbar: {
      container: getToolbarConfig(),
      handlers: {
        image: imageHandler
      }
    },
    clipboard: {
      matchVisual: false
    }
  }), [windowWidth, imageHandler]);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background',
    'align', 'code-block'
  ];

  // Auto-save function
  const autoSave = useCallback(async () => {
    if (!isAutoSaveEnabled) return;
    if (isSavingRef.current ||
        saveStatus === 'saving' ||
        !article.title.trim()) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      const url = isEditMode 
        ? buildApiUrl(`writer/articles/${editId}`)
        : buildApiUrl('writer/articles');
      
      const articleData = article;
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(articleData),
        // Add timeout for auto-save
        signal: AbortSignal.timeout(15000) // 15 seconds timeout
      });

      if (response.ok) {
        const _result = await response.json();
        setSaveStatus('saved');
      } else {
        const errorText = await response.text();
        console.error('❌ Auto-save error:', response.status, errorText);
        setSaveStatus('unsaved');
      }
    } catch (error: any) {
      console.error('Auto-save error:', error);
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        console.log('⏰ Auto-save timeout, will retry later');
      }
      setSaveStatus('unsaved');
    } finally {
      isSavingRef.current = false; // Reset saving flag
    }
  }, [article, isEditMode, editId, isAutoSaveEnabled]);

  // Save Draft function
  const handleSaveDraft = async (): Promise<string | null> => {
    if (isSavingRef.current) {
      return null;
    }
    
    // Basic validation for draft
    if (!article.title.trim()) {
      showNotification('Judul artikel wajib diisi untuk menyimpan draft.', 'error');
      return null;
    }
    
    if (!article.channel.trim()) {
      showNotification('Rubrikasi harus dipilih untuk menyimpan artikel.', 'error');
      return null;
    }
    
    try {
      isSavingRef.current = true;
      setSaveStatus('saving');
      
      const draftData = {
        ...article,
        status: 'draft' as const,
        image_captions: imageCaptions
      };

      console.log('📸 [FRONTEND] Saving draft with imageCaptions:', imageCaptions);
      
      const url = isEditMode 
        ? buildApiUrl(`writer/articles/${editId}`)
        : buildApiUrl('writer/articles');
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(draftData),
        // Add timeout for draft save
        signal: AbortSignal.timeout(20000) // 20 seconds timeout
      });

      if (response.ok) {
        const result = await response.json();
        
        if (isEditMode) {
          showNotification('Draft berhasil disimpan!', 'success');
          setArticle(prev => ({ ...prev, status: 'draft' }));
          setSaveStatus('saved');
          return editId;
        } else {
          const newId = result.data?.id || result.data?.ID || result.id || result.ID;
          showNotification(`Draft berhasil disimpan! ID: ${newId}`, 'success');
          // Update to edit mode with the new ID
          setIsEditMode(true);
          setEditId(newId);
          setArticle(prev => ({ ...prev, status: 'draft' }));
          setSaveStatus('saved');
          return newId;
        }
      } else {
        const errorData = await response.text();
        console.error('🔧 Debug Frontend handleSaveDraft - error response:', response.status, errorData);
        if (response.status === 408) {
          alert('⏰ Permintaan timeout. Silakan coba lagi dalam beberapa saat.');
        } else {
          alert('❌ Gagal menyimpan draft. Silakan coba lagi.');
        }
        setSaveStatus('error');
        return null;
      }
    } catch (error: any) {
      console.error('🔧 Debug Frontend handleSaveDraft - error:', error);
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        alert('⏰ Koneksi timeout. Silakan coba lagi.');
      } else {
        alert('❌ Terjadi kesalahan saat menyimpan draft.');
      }
      setSaveStatus('error');
      return null;
    } finally {
      isSavingRef.current = false;
    }
  };

  // Schedule function
  const handleSchedule = async () => {
    // Basic validation before scheduling
    if (!article.title.trim()) {
      showNotification('Judul artikel wajib diisi sebelum dijadwalkan.', 'error');
      return;
    }
    
    if (!article.content.trim() || article.content.trim() === '<p><br></p>') {
      showNotification('Isi artikel wajib diisi sebelum dijadwalkan.', 'error');
      return;
    }
    
    try {
      let postId = editId;
      
      // If no editId (new article), save as draft first to get an ID
      if (!postId) {
        console.log('🔧 Debug: No editId, saving draft first to get post ID');
        console.log('📸 [SCHEDULE] imageCaptions state before saving draft:', imageCaptions);
        const savedId = await handleSaveDraft();
        
        // Use the returned ID from handleSaveDraft
        postId = savedId || editId;
        
        if (!postId) {
          alert('❌ Gagal menyimpan artikel. Silakan coba lagi.');
          return;
        }
      }
      
      console.log('🔧 Debug: Using postId for scheduling:', postId);
      
      // Create a ScheduledPost object for the modal
      const postForScheduling: ScheduledPost = {
        ID: parseInt(postId),
        post_title: article.title,
        post_content: article.content,
        post_status: 'draft',
        post_date: new Date().toISOString(),
        scheduled_publish_date: null,
        scheduled_by: null,
        scheduling_notes: null,
        original_status: 'draft',
        featured_image: article.featured_image,
        featured_image_caption: article.featured_image_caption,
        author: {
          ID: user?.ID || 0,
          display_name: user?.display_name || '',
          user_login: user?.user_login || ''
        }
      };
      
      setCurrentPostForScheduling(postForScheduling);
      setIsScheduleModalOpen(true);
    } catch (error) {
      console.error('Error preparing schedule:', error);
      alert('❌ Error saat menyiapkan penjadwalan. Silakan coba lagi.');
    }
  };

  const handleScheduleSubmit = async (postId: number, scheduleData: ScheduleRequest) => {
    // Validate before scheduling
    const validation = validateArticleForPublish();
    if (!validation.isValid) {
      const errorMessage = `Artikel belum siap dijadwalkan:\n\n${validation.errors.join('\n')}\n\nSilakan lengkapi data yang diperlukan terlebih dahulu.`;
      alert(errorMessage);
      return;
    }
    
    try {
      await schedulerAPI.schedulePost(postId, scheduleData);
      showNotification('Artikel berhasil dijadwalkan!', 'success');
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      if (error.message?.includes('timeout') || error.name === 'AbortError') {
        showNotification('Koneksi timeout. Silakan coba lagi dalam beberapa saat.', 'error');
      } else {
        showNotification('Error saat menjadwalkan artikel. Silakan coba lagi.', 'error');
      }
    }
  };

  // Validation function
  const validateArticleForPublish = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!article.title.trim()) {
      errors.push('Judul artikel wajib diisi');
    }
    
    if (!article.channel.trim()) {
      errors.push('Rubrikasi harus dipilih');
    }
    
    if (!article.content.trim() || article.content.trim() === '<p><br></p>') {
      errors.push('Isi artikel wajib diisi');
    }
    
    if (!article.description.trim()) {
      errors.push('Deskripsi artikel wajib diisi untuk publikasi');
    }
    
    if (!article.summary_social.trim()) {
      errors.push('Summary Social wajib diisi untuk publikasi');
    }
    
    
    // Check minimum content length
    const contentText = article.content.replace(/<[^>]*>/g, '').trim();
    if (contentText.length < 100) {
      errors.push('Isi artikel terlalu pendek, minimal 100 karakter');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Show validation errors in Indonesian
  const showValidationErrors = (errors: string[]) => {
    const errorMessage = `Artikel belum siap dipublikasi:\n\n• ${errors.join('\n• ')}\n\nSilakan lengkapi data yang diperlukan terlebih dahulu.`;
    showNotification(errorMessage, 'error');
  };

  // Show notification function
  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-3 sm:p-4 rounded-lg shadow-lg z-50 max-w-xs sm:max-w-md transition-all duration-300 ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-start space-x-2 sm:space-x-3">
        <div class="flex-shrink-0">
          ${type === 'success' ? 
            '<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>' :
            type === 'error' ?
            '<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>' :
            '<svg class="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>'
          }
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium whitespace-pre-line">${message.replace(/\n/g, '<br>')}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 ml-1 sm:ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded">
          <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 6 seconds (longer for mobile users to read)
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
      }
    }, 6000);
  };

  // Publish function
  const handlePublish = async () => {
    if (isSavingRef.current) {
      return;
    }
    
    // Validate before publish
    const validation = validateArticleForPublish();
    if (!validation.isValid) {
      showValidationErrors(validation.errors);
      return;
    }
    
    try {
      isSavingRef.current = true;
      setSaveStatus('saving');
      
      const publishData = { 
        ...article, 
        status: 'published' as const,
        image_captions: imageCaptions
      };
      
      const url = isEditMode 
        ? buildApiUrl(`writer/articles/${editId}`)
        : buildApiUrl('writer/articles');
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(publishData),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });

      if (response.ok) {
        const result = await response.json();
        const userRole = user?.user_role;
        
        if (isEditMode) {
          if (userRole === 'admin' || userRole === 'superadmin') {
            showNotification('Artikel berhasil diupdate dan dipublikasi langsung!', 'success');
          } else {
            showNotification('Artikel berhasil diupdate dan akan direview oleh admin!', 'success');
          }
          setArticle(prev => ({ ...prev, status: 'published' }));
        } else {
          const articleId = result.data?.id || result.data?.ID || 'Unknown';
          if (userRole === 'admin' || userRole === 'superadmin') {
            showNotification(`Artikel berhasil dipublikasi langsung! ID: ${articleId}`, 'success');
          } else {
            showNotification(`Artikel berhasil dikirim untuk review! ID: ${articleId}\n\nArtikel akan dipublikasi setelah disetujui admin.`, 'success');
          }
          
          // Reset form only for new articles
          setArticle({
            title: '',
            content: '',
            description: '',
            summary_social: '',
            channel: 'news',
            topic: '',
            keyword: '',
            publish_date: formatLocalDateTime(new Date()),
            location: '',
            mark_as_18_plus: false,
            status: 'draft',
            featured_image: '',
            featured_image_caption: ''
          });
          setFeaturedImagePreview('');
        }
        setSaveStatus('saved');
      } else {
        const errorText = await response.text();
        console.error('❌ Publish error:', response.status, errorText);
        
        // Handle specific error messages in Indonesian
        if (response.status === 408) {
          showNotification('Permintaan timeout. Server sedang sibuk, silakan coba lagi dalam beberapa saat.', 'error');
        } else if (response.status === 400) {
          try {
            const error = JSON.parse(errorText);
            const message = error.message || errorText;
            if (message.includes('required')) {
              showNotification(`⚠️ Data tidak lengkap: ${message}\n\nPastikan semua field wajib sudah diisi.`, 'error');
            } else {
              showNotification(`❌ Gagal mempublikasi artikel: ${message}`, 'error');
            }
          } catch {
            showNotification('❌ Gagal mempublikasi artikel. Periksa kembali data yang diisi.', 'error');
          }
        } else if (response.status === 500) {
          alert('🔧 Terjadi kesalahan server. Silakan coba lagi atau hubungi admin.');
        } else {
          try {
            const error = JSON.parse(errorText);
            alert(`❌ Gagal mempublikasi artikel: ${error.message}`);
          } catch {
            alert(`❌ Gagal mempublikasi artikel (Error ${response.status})`);
          }
        }
        setSaveStatus('error');
      }
    } catch (error: any) {
      console.error('❌ Publish error:', error);
      if (error.name === 'AbortError' || error.message?.includes('timeout')) {
        alert('⏰ Koneksi timeout. Silakan periksa koneksi internet dan coba lagi.');
      } else {
        alert('❌ Gagal mempublikasi artikel. Periksa koneksi internet Anda.');
      }
      setSaveStatus('error');
    } finally {
      isSavingRef.current = false;
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
  // Auto-save effect - debounced to prevent excessive calls
  useEffect(() => {
    if (!isAutoSaveEnabled) return;
    const timer = setTimeout(() => {
      if (isSavingRef.current ||
          saveStatus === 'saving' ||
          !article.title.trim()) {
        return;
      }
      autoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [autoSave, isAutoSaveEnabled]);

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
        const token = localStorage.getItem('token');
        const response = await fetch(buildApiUrl(`writer/articles/${editId}`), {
          credentials: 'include',
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
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
                ? formatLocalDateTime(new Date(articleData.publish_date))
                : new Date().toISOString().slice(0, 16),
              location: articleData.location || '',
              mark_as_18_plus: articleData.mark_as_18_plus || false,
              status: (articleData.status === 'publish' ? 'published' : articleData.status === 'pending' ? 'pending' : 'draft') as 'draft' | 'published' | 'pending',
              featured_image: articleData.featured_image || '',
              featured_image_caption: articleData.featured_image_caption || ''
            };
            
            // Set featured image preview if exists
            if (articleData.featured_image) {
              setFeaturedImagePreview(articleData.featured_image);
            }
            
            // Load existing image captions if they exist
            if (articleData.image_captions) {
              setImageCaptions(articleData.image_captions);
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
      {/* Custom CSS for responsive editor */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .prose-editor .ql-editor {
            padding: 20px !important;
            line-height: 1.6 !important;
            font-size: 16px !important;
          }
          
          .prose-editor .ql-editor.ql-blank::before {
            left: 20px !important;
            right: 20px !important;
            color: #9ca3af !important;
            font-style: italic !important;
          }
          
          .prose-editor .ql-toolbar {
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-bottom: 1px solid #e5e7eb;
            padding: 8px 12px !important;
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .prose-editor .ql-container {
            border-bottom: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-top: none;
          }
          
          .prose-editor .ql-toolbar .ql-formats {
            margin-right: 8px !important;
            margin-bottom: 4px !important;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
          }
          
          .prose-editor .ql-toolbar button {
            width: 32px !important;
            height: 32px !important;
            padding: 6px !important;
            margin: 0 1px !important;
            border-radius: 4px !important;
          }
          
          .prose-editor .ql-toolbar button:hover {
            background-color: #f3f4f6 !important;
          }
          
          .prose-editor .ql-toolbar button.ql-active {
            background-color: #dbeafe !important;
            color: #2563eb !important;
          }
          
          .prose-editor .ql-toolbar .ql-picker {
            margin: 0 2px !important;
          }
          
          .prose-editor .ql-toolbar .ql-picker-label {
            padding: 6px 8px !important;
            border-radius: 4px !important;
            font-size: 14px !important;
            min-width: auto !important;
          }
          
          .prose-editor .ql-toolbar .ql-picker-label:hover {
            background-color: #f3f4f6 !important;
          }
          
          /* Mobile specific styles - full toolbar with compact layout */
          @media (max-width: 639px) {
            .prose-editor .ql-toolbar {
              padding: 8px 6px !important;
              gap: 3px;
              flex-wrap: wrap;
              justify-content: flex-start;
            }
            
            .prose-editor .ql-toolbar .ql-formats {
              margin-right: 4px !important;
              margin-bottom: 4px !important;
              flex-shrink: 0;
            }
            
            .prose-editor .ql-toolbar button {
              width: 26px !important;
              height: 26px !important;
              padding: 3px !important;
              margin: 0 !important;
              flex-shrink: 0;
            }
            
            .prose-editor .ql-toolbar button svg {
              width: 13px !important;
              height: 13px !important;
            }
            
            .prose-editor .ql-toolbar .ql-picker {
              flex-shrink: 0;
            }
            
            .prose-editor .ql-toolbar .ql-picker-label {
              padding: 3px 5px !important;
              font-size: 11px !important;
              min-width: 30px !important;
              text-align: center;
            }
            
            .prose-editor .ql-toolbar .ql-picker-options {
              font-size: 12px !important;
            }
            
            .prose-editor .ql-editor {
              padding: 15px !important;
              font-size: 14px !important;
            }
            
            /* Ensure toolbar wraps nicely on mobile */
            .prose-editor .ql-toolbar .ql-formats:last-child {
              margin-right: 0 !important;
            }
          }
          
          /* Tablet specific styles */
          @media (min-width: 640px) and (max-width: 1023px) {
            .prose-editor .ql-toolbar {
              padding: 7px 10px !important;
            }
            
            .prose-editor .ql-toolbar button {
              width: 30px !important;
              height: 30px !important;
              padding: 5px !important;
            }
            
            .prose-editor .ql-toolbar button svg {
              width: 16px !important;
              height: 16px !important;
            }
            
            .prose-editor .ql-toolbar .ql-picker-label {
              padding: 5px 7px !important;
              font-size: 13px !important;
            }
            
            .prose-editor .ql-editor {
              padding: 18px !important;
              font-size: 15px !important;
            }
          }
          
          /* Desktop styles */
          @media (min-width: 1024px) {
            .prose-editor .ql-toolbar button svg {
              width: 18px !important;
              height: 18px !important;
            }
          }
          
          /* Date & Location responsive styles */
          input[type="datetime-local"] {
            -webkit-appearance: none;
            -moz-appearance: none;
            appearance: none;
            background-color: white;
            color: #374151;
          }
          
          input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
            background-repeat: no-repeat;
            background-position: center;
            background-size: 16px 16px;
            cursor: pointer;
            opacity: 0.7;
          }
          
          input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }
          
          @media (max-width: 639px) {
            input[type="datetime-local"] {
              font-size: 14px !important;
              padding: 8px !important;
              min-height: 40px !important;
            }
            
            input[type="datetime-local"]::-webkit-calendar-picker-indicator {
              background-size: 14px 14px;
            }
          }
          
          @media (min-width: 640px) and (max-width: 1023px) {
            input[type="datetime-local"] {
              font-size: 14px !important;
              padding: 10px !important;
              min-height: 42px !important;
            }
          }
        `
      }} />

      <Navbar />
      
      {/* Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-12">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left side - Title and Status */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                {isEditMode ? 'Edit Artikel' : 'Tulis Artikel'}
              </h1>
              <div className="hidden sm:flex items-center">
                <span className={`px-2 py-1 rounded text-xs whitespace-nowrap ${
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
            
            {/* Right side - Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
              <button
                onClick={handleSaveDraft}
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <span className="hidden sm:inline">Simpan Draft</span>
                <span className="sm:hidden">Draft</span>
              </button>
              
              {/* Schedule button - only for admin/superadmin */}
              {user && ['admin', 'superadmin'].includes(user.user_role) && (
                <button
                  onClick={handleSchedule}
                  disabled={!article.title.trim()}
                  className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-blue-500 border border-transparent rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 sm:space-x-2"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Jadwalkan</span>
                </button>
              )}
              
              <button
                onClick={handlePublish}
                className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-white bg-yellow-500 border border-transparent rounded-md hover:bg-yellow-600"
              >
                <span className="hidden sm:inline">
                  {(() => {
                    const userRole = user?.user_role;
                    
                    // Admin/SuperAdmin editing pending post
                    if (userRole && ['admin', 'superadmin'].includes(userRole) && isEditMode && article.status === 'pending') {
                      return `Publikasikan "${article.title.slice(0, 20)}${article.title.length > 20 ? '...' : ''}"`;
                    }
                    
                    // Different text based on user role
                    if (userRole === 'admin' || userRole === 'superadmin') {
                      return isEditMode ? 'Publikasikan Sekarang' : 'Publikasikan Langsung';
                    } else {
                      return isEditMode ? 'Kirim untuk Review' : 'Kirim untuk Review';
                    }
                  })()}
                </span>
                <span className="sm:hidden">
                  {(() => {
                    const userRole = user?.user_role;
                    return (userRole === 'admin' || userRole === 'superadmin') ? 'Publish' : 'Review';
                  })()}
                </span>
              </button>
            </div>
          </div>
          
          {/* Mobile Status Bar - Show on mobile only */}
          <div className="sm:hidden pb-2">
            <span className={`inline-block px-2 py-1 rounded text-xs ${
              saveStatus === 'saved' ? 'text-green-600 bg-green-50' :
              saveStatus === 'saving' ? 'text-yellow-600 bg-yellow-50' :
              saveStatus === 'error' ? 'text-red-600 bg-red-50' :
              'text-gray-600 bg-gray-50'
            }`}>
              {saveStatus === 'saved' ? 'Tersimpan sebagai Draft' :
               saveStatus === 'saving' ? 'Menyimpan...' :
               saveStatus === 'error' ? 'Error saat menyimpan' :
               'Belum disimpan'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
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
            <div className={`prose-editor ${
              (!article.content.trim() || article.content.trim() === '<p><br></p>') ? 'ring-1 ring-gray-200' : ''
            }`}>
              <ReactQuill
                key={`quill-${windowWidth < 640 ? 'mobile' : windowWidth < 1024 ? 'tablet' : 'desktop'}`}
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
                <span>
                  {charCount.content} karakter
                  {charCount.content < 100 && charCount.content > 0 && (
                    <span className="text-red-500 ml-2">⚠️ Minimal 100 karakter</span>
                  )}
                </span>
                <span>
                  {wordCount} kata
                </span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-1">(Wajib untuk publikasi)</span>
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
                Summary Social <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 font-normal ml-1">(Wajib untuk publikasi)</span>
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
                      setArticle(prev => ({ ...prev, featured_image: '', featured_image_caption: '' }));
                    }}
                    className="mt-1 text-xs text-red-600 hover:text-red-800"
                  >
                    Hapus gambar
                  </button>
                </div>
              )}
              
              {/* Featured Image Caption */}
              {featuredImagePreview && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption Gambar
                  </label>
                  <input
                    type="text"
                    value={article.featured_image_caption || ''}
                    onChange={(e) => {
                      setArticle(prev => ({ ...prev, featured_image_caption: e.target.value }));
                      setSaveStatus('unsaved');
                    }}
                    placeholder="Masukkan caption untuk featured image..."
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Rubrikasi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rubrikasi
              </label>
              
              {/* Popular Channels */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Channel Populer:</p>
                <div className="flex flex-wrap gap-2">
                  
                  {/* Popular channels from database */}
                  {popularTags.popularChannels.map((channel) => (
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
                  placeholder="Atau tulis rubrikasi baru..."
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
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tanggal Publikasi</label>
                  <input
                    type="datetime-local"
                    value={article.publish_date}
                    onChange={(e) => setArticle(prev => ({ ...prev, publish_date: e.target.value }))}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      fontSize: '14px',
                      minHeight: '40px'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Lokasi</label>
                  <input
                    type="text"
                    placeholder="Masukkan lokasi..."
                    value={article.location}
                    onChange={(e) => setArticle(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      fontSize: '14px',
                      minHeight: '40px'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Image Preview and Caption Manager */}
            <ImagePreview
              content={article.content}
              imageCaptions={imageCaptions}
              onCaptionChange={handleImageCaptionChange}
            />

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
      
      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        post={currentPostForScheduling}
        onSchedule={handleScheduleSubmit}
        mode="schedule"
        isLoading={false}
      />
      
    </div>
  );
};

export default ArticleWriterPage;
