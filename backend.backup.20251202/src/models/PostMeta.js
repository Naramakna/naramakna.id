const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostMeta = sequelize.define('PostMeta', {
  meta_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  post_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    references: {
      model: 'posts',
      key: 'ID'
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
  tableName: 'postmeta',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'post_id',
      fields: ['post_id']
    },
    {
      name: 'meta_key',
      fields: ['meta_key']
    }
  ]
});

module.exports = PostMeta;