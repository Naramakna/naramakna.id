const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  comment_ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  },
  comment_post_ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  comment_author: {
    type: DataTypes.TEXT('tiny'),
    allowNull: false
  },
  comment_author_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  comment_author_url: {
    type: DataTypes.STRING(200),
    allowNull: false,
    defaultValue: ''
  },
  comment_author_IP: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: ''
  },
  comment_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  comment_date_gmt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  comment_content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  comment_karma: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  comment_approved: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '1'
  },
  comment_agent: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  comment_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'comment'
  },
  comment_parent: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'comments',
  timestamps: false
});

module.exports = Comment;