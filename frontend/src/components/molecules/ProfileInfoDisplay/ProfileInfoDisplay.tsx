import React from 'react';

interface ProfileData {
  birth_date?: string;
  gender?: string;
  phone_number?: string;
  city?: string;
  profession?: string;
}

interface ProfileInfoDisplayProps {
  profile: ProfileData | null;
  shouldDisplayField: (fieldName: string) => boolean;
  isCriticalFieldDisabled: (fieldName: string) => boolean;
}

export const ProfileInfoDisplay: React.FC<ProfileInfoDisplayProps> = ({
  profile,
  shouldDisplayField,
  isCriticalFieldDisabled
}) => {
  const hasAnyData = shouldDisplayField('birth_date') || 
                     shouldDisplayField('gender') || 
                     shouldDisplayField('phone_number') || 
                     shouldDisplayField('city') || 
                     shouldDisplayField('profession');

  if (!hasAnyData) {
    return null;
  }

  return (
    <div className="bg-blue-50 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Profil</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shouldDisplayField('birth_date') && (
          <div>
            <span className="text-sm font-medium text-gray-600">Tanggal Lahir:</span>
            <p className="text-gray-900">{new Date(profile?.birth_date || '').toLocaleDateString('id-ID')}</p>
          </div>
        )}
        {shouldDisplayField('gender') && (
          <div>
            <span className="text-sm font-medium text-gray-600">Jenis Kelamin:</span>
            <p className="text-gray-900">{profile?.gender === 'male' ? 'Laki-laki' : 'Perempuan'}</p>
          </div>
        )}
        {shouldDisplayField('phone_number') && (
          <div>
            <span className="text-sm font-medium text-gray-600">Nomor Telepon:</span>
            <p className="text-gray-900">{profile?.phone_number}</p>
          </div>
        )}
        {shouldDisplayField('city') && (
          <div>
            <span className="text-sm font-medium text-gray-600">Kota:</span>
            <p className="text-gray-900">{profile?.city}</p>
          </div>
        )}
        {shouldDisplayField('profession') && (
          <div>
            <span className="text-sm font-medium text-gray-600">Profesi:</span>
            <p className="text-gray-900">{profile?.profession}</p>
          </div>
        )}
      </div>
      {isCriticalFieldDisabled('birth_date') && 
       isCriticalFieldDisabled('gender') && 
       isCriticalFieldDisabled('phone_number') && (
        <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Catatan:</strong> Tanggal lahir, jenis kelamin, dan nomor telepon tidak dapat diubah setelah diisi.
          </p>
        </div>
      )}
    </div>
  );
};
