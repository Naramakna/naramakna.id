const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserMeta = sequelize.define('UserMeta', {
  umeta_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0,
    references: {
      model: 'users',
      key: 'ID'
    }
  },
  meta_key: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null
  },
  meta_value: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'usermeta',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'user_id',
      fields: ['user_id']
    },
    {
      name: 'meta_key',
      fields: ['meta_key']
    }
  ]
});

module.exports = UserMeta;