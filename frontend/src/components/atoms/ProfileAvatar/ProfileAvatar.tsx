import React from 'react';

interface ProfileAvatarProps {
  profileImage: string | null;
  displayName: string;
  size?: 'sm' | 'md' | 'lg';
  getImageUrl: (imagePath: string | null) => string | null;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profileImage,
  displayName,
  size = 'md',
  getImageUrl
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-20 h-20 text-2xl',
    lg: 'w-24 h-24 text-2xl'
  };

  return (
    <div className={`bg-purple-500 rounded-full flex items-center justify-center text-white font-bold ${sizeClasses[size]}`}>
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
        displayName?.charAt(0)?.toUpperCase() || 'n'
      )}
    </div>
  );
};
