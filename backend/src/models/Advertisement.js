const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Advertisement = sequelize.define('Advertisement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  advertiser_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'users',
      key: 'ID'
    }
  },
  campaign_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  placement_type: {
    type: DataTypes.ENUM('header', 'sidebar', 'inline', 'footer', 'popup', 'regular'),
    allowNull: false,
    defaultValue: 'regular'
  },
  media_type: {
    type: DataTypes.ENUM('image', 'gif', 'video', 'html', 'google_ads'),
    allowNull: false,
    defaultValue: 'image'
  },
  media_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'URL for image, gif, video, or other media'
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Legacy field, use media_url instead'
  },
  target_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  ad_content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'HTML content for text-based ads or Google Ads code'
  },
  google_ads_code: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Google AdSense or AdWords embed code'
  },
  budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Budget in IDR'
  },
  clicks: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  impressions: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  payment_proof_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'active', 'paused', 'finished', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'advertisements',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'advertiser_id',
      fields: ['advertiser_id']
    },
    {
      name: 'status',
      fields: ['status']
    },
    {
      name: 'placement_type',
      fields: ['placement_type']
    },
    {
      name: 'date_range',
      fields: ['start_date', 'end_date']
    }
  ]
});

module.exports = Advertisement;