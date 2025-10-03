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
  desired_role: string;
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
  isCriticalFieldDisabled: (fieldName: string) => boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  loading,
  user,
  isCriticalFieldDisabled
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Informasi Profil</h2>
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

      {/* Role Selection - Only for users with 'user' role */}
      {user.user_role === 'user' && (
        <ProfileFormField
          label="Peran yang Diinginkan"
          name="desired_role"
          type="radio"
          value={formData.desired_role}
          onChange={onFormDataChange}
          options={[
            { value: 'user', label: 'Pembaca (tetap sebagai user biasa)' },
            { value: 'writer', label: 'Penulis Artikel' },
            { value: 'partner_fotografi', label: 'Partner Fotografi' }
          ]}
          helperText="Pilih peran yang sesuai dengan kontribusi yang ingin Anda berikan"
        />
      )}

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

      </form>
    </div>
  );
};
