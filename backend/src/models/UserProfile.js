const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserProfile = sequelize.define('UserProfile', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'ID'
    }
  },
  profile_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Path to profile image'
  },
  birth_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Tanggal lahir user'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female'),
    allowNull: true,
    comment: 'Jenis kelamin - Laki-laki atau Perempuan'
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
    comment: 'Nomor telepon'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Alamat lengkap'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Kota'
  },
  province: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Provinsi'
  },
  postal_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Kode pos'
  },
  country: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Indonesia',
    comment: 'Negara'
  },
  profession: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Profesi/pekerjaan'
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Nama perusahaan'
  },
  education: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Pendidikan terakhir'
  },
  facebook_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Link Facebook'
  },
  twitter_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Link Twitter/X'
  },
  instagram_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Link Instagram'
  },
  linkedin_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Link LinkedIn'
  },
  tiktok_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Link TikTok'
  },
  youtube_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Link YouTube'
  },
  writer_category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Kategori spesialisasi penulis'
  },
  writing_experience: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Pengalaman menulis'
  },
  portfolio_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Link portfolio'
  },
  show_email: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Tampilkan email di profil publik'
  },
  show_phone: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Tampilkan phone di profil publik'
  },
  show_address: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Tampilkan alamat di profil publik'
  },
  show_birth_date: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    comment: 'Tampilkan tanggal lahir di profil publik'
  }
}, {
  tableName: 'user_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'unique_user_profile',
      unique: true,
      fields: ['user_id']
    },
    {
      name: 'idx_user_profiles_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_user_profiles_city',
      fields: ['city']
    },
    {
      name: 'idx_user_profiles_profession',
      fields: ['profession']
    },
    {
      name: 'idx_user_profiles_writer_category',
      fields: ['writer_category']
    }
  ]
});

module.exports = UserProfile;