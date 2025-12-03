import React from 'react';
import { ProfileFormField } from '../../atoms/ProfileFormField';
import { Button } from '../../atoms/Button';

interface FormData {
  display_name: string;
  user_email: string;
  bio: string;
  birth_date: string;
  gender: string;
  phone_number: string;
  city: string;
  profession: string;
}

interface User {
  user_role: string;
}

interface ProfileFormProps {
  formData: FormData;
  onFormDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  user: User;
  canApplyWriter: boolean;
  onApplyWriter: () => void;
  isApplyingWriter: boolean;
  isCriticalFieldDisabled: (fieldName: string) => boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  loading,
  user,
  canApplyWriter,
  onApplyWriter,
  isApplyingWriter,
  isCriticalFieldDisabled
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Name Field */}
      <ProfileFormField
        label="Nama"
        name="display_name"
        value={formData.display_name}
        onChange={onFormDataChange}
        required
        maxLength={50}
        placeholder="Masukkan nama Anda"
      />

      {/* Bio Field */}
      <ProfileFormField
        label="Biography"
        name="bio"
        type="textarea"
        value={formData.bio}
        onChange={onFormDataChange}
        required
        maxLength={250}
        placeholder="Silakan isi sesuai dengan kegiatan serta profesi anda saat ini"
      />

      {/* Email Field (readonly) */}
      <ProfileFormField
        label="Email"
        name="user_email"
        type="email"
        value={formData.user_email}
        onChange={onFormDataChange}
        readOnly
        helperText="Email tidak dapat diubah"
      />

      {/* Birth Date */}
      <ProfileFormField
        label="Tanggal Lahir"
        name="birth_date"
        type="date"
        value={formData.birth_date}
        onChange={onFormDataChange}
        disabled={isCriticalFieldDisabled('birth_date')}
        showCheckmark={isCriticalFieldDisabled('birth_date')}
        helperText={isCriticalFieldDisabled('birth_date') ? 'Tanggal lahir sudah diisi dan tidak dapat diubah' : undefined}
      />

      {/* Gender */}
      <ProfileFormField
        label="Jenis Kelamin"
        name="gender"
        type="radio"
        value={formData.gender}
        onChange={onFormDataChange}
        options={[
          { value: 'male', label: 'Laki-laki' },
          { value: 'female', label: 'Perempuan' }
        ]}
        disabled={isCriticalFieldDisabled('gender')}
        isDisabled={isCriticalFieldDisabled('gender')}
        showCheckmark={isCriticalFieldDisabled('gender')}
        helperText={isCriticalFieldDisabled('gender') ? 'Jenis kelamin sudah diisi dan tidak dapat diubah' : undefined}
      />

      {/* Phone Number */}
      <ProfileFormField
        label="Nomor Telepon"
        name="phone_number"
        type="tel"
        value={formData.phone_number}
        onChange={onFormDataChange}
        disabled={isCriticalFieldDisabled('phone_number')}
        showCheckmark={isCriticalFieldDisabled('phone_number')}
        placeholder="08xxxxxxxxxx"
        helperText={isCriticalFieldDisabled('phone_number') ? 'Nomor telepon sudah diisi dan tidak dapat diubah' : undefined}
      />

      {/* City */}
      <ProfileFormField
        label="Kota"
        name="city"
        value={formData.city}
        onChange={onFormDataChange}
        placeholder="Jakarta, Bandung, Surabaya, dll"
      />

      {/* Profession */}
      <ProfileFormField
        label="Profesi"
        name="profession"
        value={formData.profession}
        onChange={onFormDataChange}
        placeholder="Profesi atau pekerjaan Anda"
      />

      {/* Submit Button */}
      <div className="pt-6">
        <Button
          type="submit"
          variant="primary"
          size="full"
          disabled={loading}
        >
          {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </div>

      {/* Apply Writer Button */}
      {user.user_role === 'user' && canApplyWriter && (
        <div className="pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="success"
            size="full"
            onClick={onApplyWriter}
            disabled={isApplyingWriter}
          >
            {isApplyingWriter ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengajukan...
              </>
            ) : (
              'Daftar Jadi Penulis'
            )}
          </Button>
        </div>
      )}
    </form>
  );
};
