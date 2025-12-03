const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostViews = sequelize.define('PostViews', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  type: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  period: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  count: {
    type: DataTypes.BIGINT,
    allowNull: false
  }
}, {
  tableName: 'post_views',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'type',
      fields: ['type']
    },
    {
      name: 'period',
      fields: ['period']
    },
    {
      name: 'type_period',
      unique: true,
      fields: ['type', 'period']
    }
  ]
});

module.exports = PostViews;