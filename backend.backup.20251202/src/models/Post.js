const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  ID: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  post_author: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    references: {
      model: 'users',
      key: 'ID'
    }
  },
  post_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  post_date_gmt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  post_content: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  post_title: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  post_excerpt: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  post_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'publish'
  },
  comment_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'open'
  },
  ping_status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'open'
  },
  post_password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  post_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  to_ping: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  pinged: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  post_modified: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  post_modified_gmt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  post_content_filtered: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  post_parent: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  guid: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  menu_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  post_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'post'
  },
  post_mime_type: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  comment_count: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'posts',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'post_name',
      fields: ['post_name']
    },
    {
      name: 'type_status_date',
      fields: ['post_type', 'post_status', 'post_date', 'ID']
    },
    {
      name: 'post_parent',
      fields: ['post_parent']
    },
    {
      name: 'post_author',
      fields: ['post_author']
    }
  ]
});

module.exports = Post;