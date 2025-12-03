import React, { useState } from 'react';
import { buildApiUrl } from '../../../config/api';

interface ProfileActionButtonsProps {
  isOwnProfile: boolean;
  userId?: number;
  isFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
  isOwnProfile,
  userId,
  isFollowing = false,
  onFollowChange
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!userId || loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Silakan login untuk mengikuti pengguna');
        return;
      }

      const response = await fetch(buildApiUrl(`users/${userId}/follow`), {
        method: following ? 'DELETE' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        const newFollowState = !following;
        setFollowing(newFollowState);
        onFollowChange?.(newFollowState);
      } else {
        alert(result.message || 'Gagal mengubah status follow');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2 mb-6">
      {isOwnProfile ? (
        <>
          <button className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
            Statistik Konten
          </button>
          <a 
            href="/profile/edit"
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Ubah Profil
          </a>
        </>
      ) : (
        <button 
          onClick={handleFollowToggle}
          disabled={loading}
          className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            following
              ? 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Loading...' : following ? 'Mengikuti' : 'Ikuti'}
        </button>
      )}
    </div>
  );
};
