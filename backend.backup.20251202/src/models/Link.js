const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Link = sequelize.define('Link', {
  link_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  link_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  link_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  link_image: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  link_target: {
    type: DataTypes.STRING(25),
    allowNull: false,
    defaultValue: ''
  },
  link_description: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  link_visible: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Y'
  },
  link_owner: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 1,
    references: {
      model: 'users',
      key: 'ID'
    }
  },
  link_rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  link_updated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  link_rel: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  },
  link_notes: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  link_rss: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: ''
  }
}, {
  tableName: 'links',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'link_visible',
      fields: ['link_visible']
    }
  ]
});

module.exports = Link;