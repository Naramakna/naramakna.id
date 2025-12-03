const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Option = sequelize.define('Option', {
  option_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  option_name: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
    defaultValue: ''
  },
  option_value: {
    type: DataTypes.TEXT('long'),
    allowNull: false
  },
  autoload: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'yes'
  }
}, {
  tableName: 'options',
  timestamps: false,
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'option_name',
      unique: true,
      fields: ['option_name']
    },
    {
      name: 'autoload',
      fields: ['autoload']
    }
  ]
});

module.exports = Option;