const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TermMeta = sequelize.define('TermMeta', {
  meta_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  term_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    references: {
      model: 'terms',
      key: 'term_id'
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
  tableName: 'termmeta',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'term_id',
      fields: ['term_id']
    },
    {
      name: 'meta_key',
      fields: ['meta_key']
    }
  ]
});

module.exports = TermMeta;