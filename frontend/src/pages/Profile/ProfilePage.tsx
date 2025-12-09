import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/organisms/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl, buildBackendUrl } from '../../config/api';
import { ProfileImageUpload } from '../../components/atoms/ProfileImageUpload';
import { AlertMessage } from '../../components/atoms/AlertMessage';
import { ProfileInfoDisplay } from '../../components/molecules/ProfileInfoDisplay';
import { ProfileForm } from '../../components/organisms/ProfileForm';

// Helper function to get full image URL
const getImageUrl = (imagePath: string | null) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it's a relative path starting with /uploads, use buildBackendUrl
  if (imagePath.startsWith('/uploads/')) {
    return buildBackendUrl(imagePath);
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  return buildBackendUrl(`uploads/${imagePath}`);
};

const ProfilePage: React.FC = () => {
  const { user, updateUser, checkProfileCompletion, canApplyForWriter, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    display_name: '',
    user_email: '',
    bio: '',
    birth_date: '',
    gender: '',
    phone_number: '',
    city: '',
    profession: '',
    desired_role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isApplyingWriter, setIsApplyingWriter] = useState(false);
  const [isApplyingPhotographer, setIsApplyingPhotographer] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Check if this is a writer application flow or profile incomplete redirect
  const urlParams = new URLSearchParams(window.location.search);
  const isWriterApplication = urlParams.get('apply') === 'writer';
  const isPhotographerApplication = urlParams.get('apply') === 'photographer';
  const isIncompleteProfile = urlParams.get('incomplete') === 'true';

  // Handle authentication and user data
  useEffect(() => {
    // Debug log removed for production
    
    // Don't redirect while still loading
    if (isLoading) {
      return;
    }
    
    // Redirect if not authenticated after loading is complete
    if (!isAuthenticated) {
      // Redirecting to login
      window.location.href = '/login';
      return;
    }

    // Update form data when user is available
    if (user) {
      // Setting form data for user
      setFormData(prev => ({
        ...prev,
        display_name: user.display_name || '',
        user_email: user.user_email || '',
        bio: user.bio || '',
        birth_date: user.profile?.birth_date || '',
        gender: user.profile?.gender || '',
        phone_number: user.profile?.phone_number || '',
        city: user.profile?.city || '',
        profession: user.profile?.profession || '',
        desired_role: user.user_role
      }));
    }
  }, [user, isAuthenticated, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Check if critical fields are filled and should be disabled
  const isCriticalFieldDisabled = (fieldName: string) => {
    if (!user?.profile) return false;
    
    const criticalFields = ['birth_date', 'gender', 'phone_number'];
    if (!criticalFields.includes(fieldName)) return false;
    
    const currentValue = user.profile[fieldName as keyof typeof user.profile];
    return currentValue !== null && currentValue !== '' && currentValue !== undefined;
  };

  // Check if profile data should be displayed (only show if filled)
  const shouldDisplayField = (fieldName: string) => {
    if (!user?.profile) return false;
    const value = user.profile[fieldName as keyof typeof user.profile];
    return value !== null && value !== '' && value !== undefined;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Prepare update data
      const updateData = {
        display_name: formData.display_name.trim(),
        user_email: formData.user_email.trim(),
        bio: formData.bio.trim(),
        birth_date: formData.birth_date || null,
        gender: formData.gender || null,
        phone_number: formData.phone_number.trim() || null,
        city: formData.city.trim() || null,
        profession: formData.profession.trim() || null,
        desired_role: formData.desired_role
      };

      // Use profile API instead of auth API
      const token = localStorage.getItem('token');
      const response = await fetch(buildApiUrl('profile'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal memperbarui profil');
      }

      const result = await response.json();

      if (result.success && result.data) {
        updateUser(result.data.user);

        // Check if role was changed
        const oldRole = user?.user_role;
        const newRole = result.data.user.user_role;

        if (oldRole !== newRole) {
          setSuccess(`Role berhasil diubah menjadi ${newRole === 'writer' ? 'Penulis' : newRole === 'partner_fotografi' ? 'Partner Fotografi' : newRole}!`);
          // Refresh user data and redirect to appropriate dashboard
          setTimeout(() => {
            window.location.href = newRole === 'writer' ? '/writer/dashboard' :
                                 newRole === 'partner_fotografi' ? '/partner-fotografi/dashboard' :
                                 '/user/dashboard';
          }, 2000);
        } else {
          setSuccess('Profil berhasil diperbarui!');
        }

        // If this was a writer application and profile is now complete
        if (isWriterApplication && checkProfileCompletion()) {
          setSuccess('Profile lengkap! Anda sekarang dapat mengajukan menjadi writer.');
          setTimeout(() => {
            setIsApplyingWriter(true);
          }, 2000);
        }

        // If this was a photographer application and profile is now complete
        if (isPhotographerApplication && checkProfileCompletion()) {
          setSuccess('Profile lengkap! Anda sekarang dapat mengajukan menjadi partner fotografi.');
          setTimeout(() => {
            setIsApplyingPhotographer(true);
          }, 2000);
        }
      } else {
        setError(result.message || 'Gagal memperbarui profil');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyWriter = async () => {
    if (!canApplyForWriter()) {
      setError('Profile belum lengkap untuk mengajukan sebagai writer');
      return;
    }

    setIsApplyingWriter(true);
    setError('');

    try {
      // Note: This would typically call a backend endpoint to request writer role
      // For now, we'll show a success message
      setTimeout(() => {
        setSuccess('Permohonan writer telah diajukan! Admin akan meninjau aplikasi Anda.');
        setIsApplyingWriter(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Gagal mengajukan permohonan writer');
      setIsApplyingWriter(false);
    }
  };

  const handleApplyPhotographer = async () => {
    if (!canApplyForWriter()) {
      setError('Profile belum lengkap untuk mengajukan sebagai partner fotografi');
      return;
    }

    setIsApplyingPhotographer(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl('profile/apply-photographer'), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Permohonan partner fotografi telah diajukan! Admin akan meninjau aplikasi Anda.');
      } else {
        setError(result.message || 'Gagal mengajukan permohonan partner fotografi');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal mengajukan permohonan partner fotografi');
    } finally {
      setIsApplyingPhotographer(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Hanya file gambar yang diperbolehkan');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploadingImage(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profile_image', file);

      const response = await fetch(buildApiUrl('profile/upload-image'), {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal upload gambar');
      }

      const result = await response.json();
      
      if (result.success) {
        // Update user profile image in context
        updateUser({ profile_image: result.data.profile_image });
        setSuccess('Foto profil berhasil diupload!');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat upload');
    } finally {
      setIsUploadingImage(false);
      // Reset input
      event.target.value = '';
    }
  };

  // Show loading state while checking authentication
  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {isLoading ? 'Memuat data pengguna...' : 'Menyiapkan profil...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isProfileComplete = checkProfileCompletion();
  const canApplyWriter = canApplyForWriter();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Pengaturan Profil</h1>
            <p className="text-yellow-100">
              Kelola informasi profil dan pengaturan akun Anda
            </p>
          </div>
          
          <div className="p-6 sm:p-8 lg:p-10">

          {/* Profile Image Upload */}
          <ProfileImageUpload
            profileImage={user.profile_image || null}
            displayName={user.display_name || ''}
            isUploading={isUploadingImage}
            onImageUpload={handleImageUpload}
            getImageUrl={getImageUrl}
          />
          
          {/* User Role Status */}
          <div className="text-center mb-8">
            {user.user_role === 'user' && !isProfileComplete && (
              <p className="text-xs text-yellow-600 mt-2">Lengkapi data profil untuk menjadi penulis</p>
            )}
            {user.user_role === 'writer' && (
              <p className="text-xs text-green-600 mt-2">✓ Anda adalah penulis aktif</p>
            )}
            {user.user_role === 'partner_fotografi' && (
              <div className="text-center">
                <p className="text-xs text-green-600 mt-2">✓ Anda adalah Partner Fotografi aktif</p>
                <a
                  href="/partner-fotografi/dashboard"
                  className="inline-block mt-2 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-medium py-1 px-3 rounded-md transition-colors"
                >
                  Buka Dashboard Partner Fotografi
                </a>
              </div>
            )}
          </div>

          {/* Profile Data Display */}
          <ProfileInfoDisplay
            profile={user.profile || null}
            shouldDisplayField={shouldDisplayField}
            isCriticalFieldDisabled={isCriticalFieldDisabled}
          />

            <div className="space-y-8 mt-8">{/* Form Container */}

              {/* Profile Incomplete Warning */}
              {isIncompleteProfile && !checkProfileCompletion() && (
                <AlertMessage 
                  type="info" 
                  message="Profil Anda belum lengkap. Lengkapi profil (Nama tampil, Email, dan Bio) untuk dapat mengakses fitur lainnya."
                />
              )}

            {/* Profile Complete - Ready to Continue */}
            {isIncompleteProfile && checkProfileCompletion() && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-green-800">
                      Profil Anda sudah lengkap! Anda dapat melanjutkan ke halaman yang diinginkan.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => {
                        const redirectPath = localStorage.getItem('redirect_after_profile') || '/user/dashboard';
                        localStorage.removeItem('redirect_after_profile');
                        window.location.href = redirectPath;
                      }}
                      className="bg-green-100 hover:bg-green-200 text-green-800 text-xs font-medium py-1 px-3 rounded-md transition-colors"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {success && (
              <AlertMessage 
                type="success" 
                message={success} 
                onClose={() => setSuccess('')}
              />
            )}

            {error && (
              <AlertMessage 
                type="error" 
                message={error} 
                onClose={() => setError('')}
              />
            )}

            {/* Profile Form */}
              <ProfileForm
                formData={formData}
                onFormDataChange={handleChange}
                onSubmit={handleUpdateProfile}
                loading={loading}
                user={user}
                isCriticalFieldDisabled={isCriticalFieldDisabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
