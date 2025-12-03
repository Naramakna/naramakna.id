const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CommentMeta = sequelize.define('CommentMeta', {
  meta_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  comment_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    references: {
      model: 'comments',
      key: 'comment_ID'
    }
  },
  meta_key: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  meta_value: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'commentmeta',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'comment_id',
      fields: ['comment_id']
    },
    {
      name: 'meta_key',
      fields: ['meta_key']
    }
  ]
});

module.exports = CommentMeta;