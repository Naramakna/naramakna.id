const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  content_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'ID'
    },
    comment: 'References posts.ID for all content types'
  },
  content_type: {
    type: DataTypes.ENUM('post', 'youtube_video', 'tiktok_video', 'page'),
    allowNull: false,
    comment: 'Type of content being tracked'
  },
  event_type: {
    type: DataTypes.ENUM('view', 'like', 'share', 'comment', 'click', 'download'),
    allowNull: false,
    comment: 'Type of user interaction'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'users',
      key: 'ID'
    },
    comment: 'NULL for anonymous users'
  },
  user_ip: {
    type: DataTypes.STRING(45),
    allowNull: true,
    comment: 'IPv4 or IPv6 address'
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Browser/device information'
  },
  referrer: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Source URL'
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Unknown',
    comment: 'Country based on IP geolocation'
  },
  region: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Unknown', 
    comment: 'Region/state based on IP geolocation'
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Unknown',
    comment: 'City based on IP geolocation'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Latitude coordinate'
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'Longitude coordinate'
  },
  timezone: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Asia/Jakarta',
    comment: 'User timezone'
  },
  device_type: {
    type: DataTypes.ENUM('desktop', 'mobile', 'tablet'),
    allowNull: true
  },
  session_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'For session tracking'
  },
  additional_data: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Flexible JSON field for extra tracking data'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'analytics',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'content_tracking',
      fields: ['content_id', 'content_type', 'event_type']
    },
    {
      name: 'timestamp_idx',
      fields: ['timestamp']
    },
    {
      name: 'user_tracking',
      fields: ['user_id', 'timestamp']
    },
    {
      name: 'ip_tracking',
      fields: ['user_ip', 'timestamp']
    },
    {
      name: 'content_type_idx',
      fields: ['content_type']
    },
    {
      name: 'event_type_idx', 
      fields: ['event_type']
    }
  ]
});

module.exports = Analytics;