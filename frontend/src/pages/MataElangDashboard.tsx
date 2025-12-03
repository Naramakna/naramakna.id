import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../config/api';

interface Photo {
  id: number;
  image_url: string;
  caption: string;
  alt_text: string;
  photographer: string;
  sort_order: number;
  is_cover: boolean;
}

interface Gallery {
  id: number;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  photographer: string;
  location: string;
  story_date: string;
  status: 'draft' | 'published' | 'archived' | 'pending_approval' | 'rejected' | null;
  is_featured: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  author_name: string;
  created_by_role: string;
  rejection_reason?: string;
  photo_count: number;
  photos?: Photo[];
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export const MataElangDashboard: React.FC = () => {
  const { user } = useAuth();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Determine API endpoints based on user role
  const isPartnerFotografi = user?.user_role === 'partner_fotografi';
  const isAdmin = user?.user_role === 'admin' || user?.user_role === 'superadmin';

  const getApiEndpoint = (endpoint: string) => {
    if (isPartnerFotografi) {
      // Replace admin endpoints with partner endpoints
      if (endpoint.includes('mata-elang/admin/galleries')) {
        return endpoint.replace('mata-elang/admin/galleries', 'mata-elang/partner/galleries');
      }
      if (endpoint.includes('mata-elang/admin/photos')) {
        return endpoint.replace('mata-elang/admin/photos', 'mata-elang/partner/photos');
      }
      if (endpoint.includes('mata-elang/admin/upload-image')) {
        return endpoint.replace('mata-elang/admin/upload-image', 'mata-elang/partner/upload-image');
      }
    }
    return endpoint;
  };

  // Form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Photo preview state
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  // Rejection reason modal state
  const [showRejectionReasonModal, setShowRejectionReasonModal] = useState(false);
  const [selectedRejectedGallery, setSelectedRejectedGallery] = useState<Gallery | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    photographer: '',
    location: '',
    story_date: '',
    status: 'draft' as 'draft' | 'published' | 'archived' | null,
    is_featured: false
  });

  // Photo form data
  const [photoData, setPhotoData] = useState({
    image_url: '',
    caption: '',
    alt_text: '',
    photographer: '',
    is_cover: false
  });

  const [filters, setFilters] = useState({
    status: 'all'
  });

  const fetchGalleries = async (page: number = 1, status: string = 'all') => {
    try {
      setLoading(true);
      const endpoint = isPartnerFotografi
        ? `mata-elang/my-galleries?page=${page}&limit=20&status=${status}`
        : `mata-elang/admin/galleries?page=${page}&limit=20&status=${status}`;

      const response = await fetch(
        buildApiUrl(endpoint),
        {
          credentials: 'include'
        }
      );

      if (response.ok) {
        const data = await response.json();
        setGalleries(data.data.galleries);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching galleries:', error);
      setMessage({ type: 'error', text: 'Gagal memuat galeri' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries(1, filters.status);
  }, [filters.status]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      photographer: '',
      location: '',
      story_date: '',
      status: isAdmin ? 'draft' : 'pending_approval', // Partner fotografi always gets pending_approval
      is_featured: false
    });
  };

  const resetPhotoForm = () => {
    setPhotoData({
      image_url: '',
      caption: '',
      alt_text: '',
      photographer: '',
      is_cover: false
    });
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for submission
      const dataToSubmit = { ...formData };

      // For partner fotografi, don't set status initially
      if (isPartnerFotografi) {
        // Don't set status - gallery will be created without status
        delete dataToSubmit.status;
        dataToSubmit.is_featured = false;
      }

      const response = await fetch(buildApiUrl(getApiEndpoint('mata-elang/admin/galleries')), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataToSubmit)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: 'Galeri berhasil dibuat' });
        setShowCreateModal(false);
        resetForm();
        fetchGalleries(pagination.page, filters.status);

        // For partner fotografi, automatically open photo modal
        if (isPartnerFotografi && result.data) {
          setTimeout(() => {
            openPhotoModal(result.data);
          }, 500);
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal membuat galeri' });
      }
    } catch (error) {
      console.error('Error creating gallery:', error);
      setMessage({ type: 'error', text: 'Gagal membuat galeri' });
    }
  };

  const handleEditGallery = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGallery) return;

    try {
      // Prepare data for submission
      const dataToSubmit = { ...formData };

      // For partner fotografi, don't allow status and featured changes
      if (isPartnerFotografi) {
        // Keep original status and is_featured from the selected gallery
        dataToSubmit.status = selectedGallery.status;
        dataToSubmit.is_featured = selectedGallery.is_featured;
      }

      const response = await fetch(buildApiUrl(getApiEndpoint(`mata-elang/admin/galleries/${selectedGallery.id}`)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(dataToSubmit)
      });

      if (response.ok) {
        const result = await response.json();

        // Check if gallery status changed to pending_approval (for partner fotografi)
        if (isPartnerFotografi &&
            selectedGallery?.status === 'published' &&
            result.data?.status === 'pending_approval') {
          setMessage({
            type: 'warning',
            text: '⚠️ Galeri berhasil diupdate, namun memerlukan persetujuan admin ulang karena mengubah konten yang sudah dipublikasi'
          });
        } else {
          setMessage({ type: 'success', text: 'Galeri berhasil diupdate' });
        }

        setShowEditModal(false);
        setSelectedGallery(null);
        resetForm();
        fetchGalleries(pagination.page, filters.status);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal mengupdate galeri' });
      }
    } catch (error) {
      console.error('Error updating gallery:', error);
      setMessage({ type: 'error', text: 'Gagal mengupdate galeri' });
    }
  };

  const handleDeleteGallery = async (gallery: Gallery) => {
    if (!confirm(`Yakin ingin menghapus galeri "${gallery.title}"?`)) return;

    try {
      const response = await fetch(buildApiUrl(getApiEndpoint(`mata-elang/admin/galleries/${gallery.id}`)), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Galeri berhasil dihapus' });
        fetchGalleries(pagination.page, filters.status);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal menghapus galeri' });
      }
    } catch (error) {
      console.error('Error deleting gallery:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus galeri' });
    }
  };

  const handleApproveGallery = async (galleryId: number) => {
    if (!confirm('Yakin ingin approve galeri ini?')) return;

    try {
      const response = await fetch(buildApiUrl(`mata-elang/admin/galleries/${galleryId}/approve`), {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Galeri berhasil di-approve dan dipublikasikan' });
        fetchGalleries(pagination.page, filters.status);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal approve galeri' });
      }
    } catch (error) {
      console.error('Error approving gallery:', error);
      setMessage({ type: 'error', text: 'Gagal approve galeri' });
    }
  };

  const openRejectModal = (gallery: Gallery) => {
    setSelectedGallery(gallery);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectGallery = async () => {
    if (!selectedGallery || !rejectReason.trim()) {
      setMessage({ type: 'error', text: 'Alasan penolakan harus diisi' });
      return;
    }

    try {
      const response = await fetch(buildApiUrl(`mata-elang/admin/galleries/${selectedGallery.id}/reject`), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Galeri berhasil ditolak' });
        setShowRejectModal(false);
        setSelectedGallery(null);
        setRejectReason('');
        // Refresh galleries to get updated data with rejection reason
        await fetchGalleries(pagination.page, filters.status);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal menolak galeri' });
      }
    } catch (error) {
      console.error('Error rejecting gallery:', error);
      setMessage({ type: 'error', text: 'Gagal menolak galeri' });
    }
  };

  const handleSubmitForApproval = async (galleryId: number) => {
    if (!confirm('Yakin ingin submit galeri untuk persetujuan admin? Setelah disubmit, Anda tidak dapat mengedit galeri sampai admin memutuskan.')) return;

    try {
      const response = await fetch(buildApiUrl(getApiEndpoint(`mata-elang/partner/galleries/${galleryId}/submit-for-approval`)), {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Galeri berhasil disubmit untuk persetujuan admin' });
        fetchGalleries(pagination.page, filters.status);
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal submit galeri untuk approval' });
      }
    } catch (error) {
      console.error('Error submitting gallery for approval:', error);
      setMessage({ type: 'error', text: 'Gagal submit galeri untuk approval' });
    }
  };

  const openEditModal = (gallery: Gallery) => {
    setSelectedGallery(gallery);

    // Format story_date to YYYY-MM-DD for HTML date input
    let formattedDate = '';
    if (gallery.story_date) {
      const date = new Date(gallery.story_date);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }

    console.log('🗓️ Original story_date:', gallery.story_date, 'Formatted:', formattedDate);

    setFormData({
      title: gallery.title,
      description: gallery.description || '',
      photographer: gallery.photographer || '',
      location: gallery.location || '',
      story_date: formattedDate,
      status: gallery.status,
      is_featured: gallery.is_featured
    });
    setShowEditModal(true);
  };

  // Check if current user can edit this gallery
  const canEditGallery = (gallery: Gallery) => {
    // Partner fotografi can only edit their own content
    if (isPartnerFotografi) {
      return true; // Already filtered by backend
    }

    // Admin/superadmin can only edit admin-created content, view-only for partner content
    if (isAdmin) {
      // Allow editing only if created by admin/superadmin, not partner_fotografi
      return gallery.created_by_role !== 'partner_fotografi';
    }

    return false;
  };

  const openPhotoModal = async (gallery: Gallery) => {
    // Fetch gallery with photos using admin endpoint
    try {
      const endpoint = isPartnerFotografi ?
        `mata-elang/partner/galleries/${gallery.id}` :
        `mata-elang/admin/galleries/${gallery.id}`;

      const response = await fetch(buildApiUrl(endpoint), {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedGallery({ ...gallery, photos: data.data.photos || [] });
        setShowPhotoModal(true);
      } else {
        console.error('Failed to fetch gallery photos:', response.status);
        // Still open modal but without photos
        setSelectedGallery({ ...gallery, photos: [] });
        setShowPhotoModal(true);
      }
    } catch (error) {
      console.error('Error fetching gallery photos:', error);
      // Still open modal but without photos
      setSelectedGallery({ ...gallery, photos: [] });
      setShowPhotoModal(true);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(buildApiUrl(getApiEndpoint('mata-elang/admin/upload-image')), {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setPhotoData(prev => ({ ...prev, image_url: result.data.url }));
        setMessage({ type: 'success', text: 'Gambar berhasil diupload' });
      } else {
        setMessage({ type: 'error', text: 'Gagal mengupload gambar' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Gagal mengupload gambar' });
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGallery) return;

    try {
      const response = await fetch(buildApiUrl(getApiEndpoint(`mata-elang/admin/galleries/${selectedGallery.id}/photos`)), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(photoData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Foto berhasil ditambahkan' });
        resetPhotoForm();
        openPhotoModal(selectedGallery); // Refresh photos
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal menambah foto' });
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      setMessage({ type: 'error', text: 'Gagal menambah foto' });
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    if (!confirm('Yakin ingin menghapus foto ini?')) return;

    try {
      const response = await fetch(buildApiUrl(getApiEndpoint(`mata-elang/admin/photos/${photoId}`)), {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Foto berhasil dihapus' });
        if (selectedGallery) {
          openPhotoModal(selectedGallery); // Refresh photos
        }
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.message || 'Gagal menghapus foto' });
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus foto' });
    }
  };

  // Photo preview handlers
  const openPhotoPreview = (photo: Photo) => {
    console.log('Opening photo preview:', photo);
    setPreviewPhoto(photo);
    setShowPhotoPreview(true);
  };

  const closePhotoPreview = () => {
    setShowPhotoPreview(false);
    setPreviewPhoto(null);
  };

  // Rejection reason modal handlers
  const openRejectionReasonModal = (gallery: Gallery) => {
    console.log('🔍 Opening rejection reason modal for:', gallery);
    console.log('🔍 Gallery status:', gallery.status);
    console.log('🔍 Rejection reason:', gallery.rejection_reason);
    console.log('🔍 Gallery full object:', JSON.stringify(gallery, null, 2));
    setSelectedRejectedGallery(gallery);
    setShowRejectionReasonModal(true);
  };

  const closeRejectionReasonModal = () => {
    setShowRejectionReasonModal(false);
    setSelectedRejectedGallery(null);
  };

  // Add keyboard event listener for preview modal
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (showPhotoPreview && e.key === 'Escape') {
        closePhotoPreview();
      }
    };

    if (showPhotoPreview) {
      document.addEventListener('keydown', handleKeydown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [showPhotoPreview]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (gallery: Gallery) => {
    const status = gallery.status;
    const statusClasses = {
      null: 'bg-gray-100 text-gray-600',
      draft: 'bg-gray-100 text-gray-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
      rejected: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      null: 'Belum Submit',
      draft: 'Draft',
      pending_approval: 'Pending Approval',
      published: 'Published',
      archived: 'Archived',
      rejected: 'Draft - Ditolak'
    };

    const statusKey = status === null ? 'null' : status;

    const isClickable = status === 'rejected' && isPartnerFotografi;
    console.log('Status badge debug:', {
      status,
      isPartnerFotografi,
      rejection_reason: gallery.rejection_reason,
      isClickable
    });

    return (
      <span
        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[statusKey as keyof typeof statusClasses]} ${
          isClickable ? 'cursor-pointer hover:bg-red-200' : ''
        }`}
        onClick={() => {
          console.log('Status badge clicked:', { status, isPartnerFotografi, rejection_reason: gallery.rejection_reason });
          if (status === 'rejected' && isPartnerFotografi) {
            openRejectionReasonModal(gallery);
          }
        }}
        title={status === 'rejected' && isPartnerFotografi ? 'Klik untuk lihat alasan penolakan' : ''}
      >
        {statusLabels[statusKey as keyof typeof statusLabels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mata Elang Gallery</h1>
              <p className="text-gray-600">Kelola galeri foto berita dan dokumentasi visual</p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium"
            >
              Buat Galeri Baru
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
            <button
              onClick={() => setMessage(null)}
              className="ml-4 text-sm underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter Status:</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ status: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">Semua</option>
              <option value="draft">Draft</option>
              <option value="pending_approval">Pending Approval</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        )}

        {/* Galleries Table */}
        {!loading && (
          <div className="bg-white shadow overflow-x-auto sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 table-fixed" style={{minWidth: '1200px'}}>
              <colgroup>
                <col style={{width: '35%', minWidth: '250px'}} />
                <col style={{width: '12%', minWidth: '120px'}} />
                <col style={{width: '8%', minWidth: '80px'}} />
                <col style={{width: '8%', minWidth: '80px'}} />
                <col style={{width: '12%', minWidth: '120px'}} />
                <col style={{width: '25%', minWidth: '200px'}} />
              </colgroup>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Galeri
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Foto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {galleries.map((gallery) => (
                  <tr key={gallery.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img
                            className="h-16 w-16 rounded-lg object-cover"
                            src={gallery.cover_image || '/images/placeholder-gallery.jpg'}
                            alt={gallery.title}
                          />
                        </div>
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="text-sm font-medium text-gray-900">
                            <div
                              className="break-all leading-tight"
                              title={gallery.title}
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {gallery.title}
                            </div>
                            {gallery.is_featured && (
                              <span className="mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                          <div
                            className="text-sm text-gray-500 break-all mt-1"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                          >
                            {gallery.photographer} • {gallery.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(gallery)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gallery.photo_count} foto
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {gallery.view_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(gallery.published_at || gallery.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-wrap gap-1 min-w-0">
                        <button
                          onClick={() => openPhotoModal(gallery)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Kelola Foto"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(gallery)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                          title={canEditGallery(gallery) ? 'Edit' : 'Lihat Detail'}
                        >
                          {canEditGallery(gallery) ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>

                        {/* Approval buttons for admin when gallery is pending */}
                        {isAdmin && gallery.status === 'pending_approval' && (
                          <>
                            <button
                              onClick={() => handleApproveGallery(gallery.id)}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                              title="Approve"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openRejectModal(gallery)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Tolak"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}

                        {/* Submit for approval button for partner fotografi */}
                        {isPartnerFotografi && (gallery.status === 'draft' || gallery.status === null) && gallery.photo_count > 0 && (
                          <button
                            onClick={() => handleSubmitForApproval(gallery.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Submit for Approval"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </button>
                        )}

                        {user?.user_role === 'superadmin' && (
                          <button
                            onClick={() => handleDeleteGallery(gallery)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Hapus"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                        <a
                          href={`/mata-elang/${gallery.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Lihat"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => fetchGalleries(pagination.page - 1, filters.status)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sebelumnya
                  </button>
                  <button
                    onClick={() => fetchGalleries(pagination.page + 1, filters.status)}
                    disabled={pagination.page === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Selanjutnya
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> sampai{' '}
                      <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> dari{' '}
                      <span className="font-medium">{pagination.total}</span> hasil
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => fetchGalleries(page, filters.status)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Gallery Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Buat Galeri Baru</h3>
                <form onSubmit={handleCreateGallery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Judul</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fotografer</label>
                    <input
                      type="text"
                      value={formData.photographer}
                      onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Cerita</label>
                    <input
                      type="date"
                      value={formData.story_date}
                      onChange={(e) => setFormData({ ...formData, story_date: e.target.value })}
                      placeholder="dd/mm/yyyy"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>

                  {/* Admin-only fields */}
                  {isAdmin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="is_featured"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-900">
                          Featured Gallery
                        </label>
                      </div>
                    </>
                  )}

                  {/* Partner fotografi notice */}
                  {isPartnerFotografi && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Galeri akan dibuat sebagai draft. Upload foto terlebih dahulu, kemudian submit untuk persetujuan admin.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {isPartnerFotografi ? 'Masukan foto yang akan anda unggah' : 'Buat Galeri'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Gallery Modal */}
        {showEditModal && selectedGallery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {selectedGallery && canEditGallery(selectedGallery) ? 'Edit Galeri' : 'Lihat Detail Galeri'}
                </h3>
                <form onSubmit={handleEditGallery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Judul</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      readOnly={selectedGallery && !canEditGallery(selectedGallery)}
                      className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 ${
                        selectedGallery && !canEditGallery(selectedGallery) ? 'bg-gray-100' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      readOnly={selectedGallery && !canEditGallery(selectedGallery)}
                      rows={3}
                      className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 ${
                        selectedGallery && !canEditGallery(selectedGallery) ? 'bg-gray-100' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fotografer</label>
                    <input
                      type="text"
                      value={formData.photographer}
                      onChange={(e) => setFormData({ ...formData, photographer: e.target.value })}
                      readOnly={selectedGallery && !canEditGallery(selectedGallery)}
                      className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 ${
                        selectedGallery && !canEditGallery(selectedGallery) ? 'bg-gray-100' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      readOnly={selectedGallery && !canEditGallery(selectedGallery)}
                      className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 ${
                        selectedGallery && !canEditGallery(selectedGallery) ? 'bg-gray-100' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Cerita</label>
                    <input
                      type="date"
                      value={formData.story_date}
                      onChange={(e) => setFormData({ ...formData, story_date: e.target.value })}
                      readOnly={selectedGallery && !canEditGallery(selectedGallery)}
                      className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 ${
                        selectedGallery && !canEditGallery(selectedGallery) ? 'bg-gray-100' : ''
                      }`}
                    />
                  </div>

                  {/* Show uploader info for partner content */}
                  {selectedGallery && selectedGallery.created_by_role === 'partner_fotografi' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Diupload oleh</label>
                      <input
                        type="text"
                        value={selectedGallery.author_name}
                        readOnly
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                      />
                    </div>
                  )}

                  {/* Admin-only fields for edit */}
                  {isAdmin && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        >
                          <option value="draft">Draft</option>
                          <option value="pending_approval">Pending Approval</option>
                          <option value="published">Published</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="edit_is_featured"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label htmlFor="edit_is_featured" className="ml-2 block text-sm text-gray-900">
                          Featured Gallery
                        </label>
                      </div>
                    </>
                  )}

                  {/* Partner fotografi notice for edit */}
                  {isPartnerFotografi && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Anda hanya dapat mengedit detail galeri. Status dan fitur galeri dikelola oleh admin.
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedGallery(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      {selectedGallery && canEditGallery(selectedGallery) ? 'Batal' : 'Tutup'}
                    </button>
                    {selectedGallery && canEditGallery(selectedGallery) && (
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Update Galeri
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Photo Management Modal */}
        {showPhotoModal && selectedGallery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Kelola Foto - {selectedGallery.title}</h3>
                  <button
                    onClick={() => setShowPhotoModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Add Photo Form - Only show for editable galleries */}
                {canEditGallery(selectedGallery) && (
                  <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                    <h4 className="text-md font-medium text-gray-900 mb-3">Tambah Foto Baru</h4>
                    <form onSubmit={handleAddPhoto} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Gambar</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="mt-1 block w-full"
                        />
                        {photoData.image_url && (
                          <img src={photoData.image_url} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Caption</label>
                        <textarea
                          value={photoData.caption}
                          onChange={(e) => setPhotoData({ ...photoData, caption: e.target.value })}
                          rows={2}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                          <input
                            type="text"
                            value={photoData.alt_text}
                            onChange={(e) => setPhotoData({ ...photoData, alt_text: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Fotografer</label>
                          <input
                            type="text"
                            value={photoData.photographer}
                            onChange={(e) => setPhotoData({ ...photoData, photographer: e.target.value })}
                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          />
                        </div>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="photo_is_cover"
                          checked={photoData.is_cover}
                          onChange={(e) => setPhotoData({ ...photoData, is_cover: e.target.checked })}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label htmlFor="photo_is_cover" className="ml-2 block text-sm text-gray-900">
                          Set sebagai Cover
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={!photoData.image_url}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        Tambah Foto
                      </button>
                    </form>
                  </div>
                )}

                {/* Photos Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedGallery.photos?.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.image_url}
                        alt={photo.alt_text || photo.caption}
                        className={`w-full h-32 object-cover rounded-lg ${!canEditGallery(selectedGallery) ? 'cursor-pointer' : ''}`}
                        onClick={() => !canEditGallery(selectedGallery) && openPhotoPreview(photo)}
                      />
                      {photo.is_cover && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                          Cover
                        </div>
                      )}
                      {/* Action overlay */}
                      {canEditGallery(selectedGallery) ? (
                        // Delete button for editable galleries
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg">
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="bg-red-600 text-white p-1 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Preview indicator for view-only galleries
                        <div
                          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg cursor-pointer"
                          onClick={() => openPhotoPreview(photo)}
                        >
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {photo.caption && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{photo.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photo Preview Modal */}
        {showPhotoPreview && previewPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center p-4">
              {/* Close Button */}
              <button
                onClick={closePhotoPreview}
                className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-[110]"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Main Image */}
              <div className="flex flex-col items-center justify-center w-full h-full max-w-6xl">
                <img
                  src={previewPhoto.image_url}
                  alt={previewPhoto.alt_text || previewPhoto.caption || 'Foto'}
                  className="max-w-full max-h-[80vh] object-contain"
                />

                {/* Caption */}
                {previewPhoto.caption && (
                  <div className="bg-black bg-opacity-70 text-white p-4 mt-4 rounded-lg max-w-4xl">
                    <p className="text-center">
                      {previewPhoto.caption}
                    </p>
                    {previewPhoto.photographer && (
                      <p className="text-center text-sm text-gray-300 mt-2">
                        Fotografer: {previewPhoto.photographer}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedGallery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Tolak Galeri</h3>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Galeri: <strong>{selectedGallery.title}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Berikan alasan penolakan untuk membantu uploader memahami masalahnya:
                  </p>

                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Penolakan *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    rows={4}
                    placeholder="Jelaskan alasan mengapa galeri ini ditolak..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleRejectGallery}
                    disabled={!rejectReason.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tolak Galeri
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Rejection Reason Modal for Partner View */}
        {showRejectionReasonModal && selectedRejectedGallery && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Alasan Penolakan</h3>
                  <button
                    onClick={closeRejectionReasonModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Galeri: <strong>{selectedRejectedGallery.title}</strong>
                  </p>
                  <p className="text-sm text-red-600 mb-4">
                    Galeri Anda telah ditolak oleh admin dengan alasan berikut:
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">
                      {selectedRejectedGallery.rejection_reason || 'Tidak ada alasan yang diberikan.'}
                    </p>
                  </div>

                  <p className="text-xs text-gray-500 mt-4">
                    Silakan perbaiki masalah yang disebutkan di atas, lalu submit ulang galeri Anda untuk review.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={closeRejectionReasonModal}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Mengerti
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};