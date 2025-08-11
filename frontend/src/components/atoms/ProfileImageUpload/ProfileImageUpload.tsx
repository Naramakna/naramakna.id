import React from 'react';

interface ProfileImageUploadProps {
  profileImage: string | null;
  displayName: string;
  isUploading: boolean;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getImageUrl: (imagePath: string | null) => string | null;
}

export const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  profileImage,
  displayName,
  isUploading,
  onImageUpload,
  getImageUrl
}) => {
  return (
    <div className="text-center mb-8">
      <div className="relative inline-block">
        <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
          {profileImage ? (
            <img 
              src={getImageUrl(profileImage) || ''} 
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                console.log('Image failed to load:', profileImage);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            displayName?.charAt(0)?.toUpperCase() || 'N'
          )}
        </div>
        <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
          {isUploading ? (
            <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={onImageUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-sm text-gray-500">Unggah Foto Profil</p>
    </div>
  );
};
