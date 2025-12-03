import React from 'react';

interface ProfileActionButtonsProps {
  isOwnProfile: boolean;
}

export const ProfileActionButtons: React.FC<ProfileActionButtonsProps> = ({
  isOwnProfile
}) => {
  return (
    <div className="flex space-x-2 mb-6">
      {isOwnProfile ? (
        <>
          <button className="flex-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
            📊 Statistik Konten
          </button>
          <a 
            href="/profile/edit"
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ✏️ Ubah Profil
          </a>
        </>
      ) : (
        <>
          <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
            Ikuti
          </button>
          <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            Pesan
          </button>
        </>
      )}
    </div>
  );
};
