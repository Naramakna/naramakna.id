const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostLikes = sequelize.define('PostLikes', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  post_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'ID'
    }
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'ID'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'post_likes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'user_id']
    },
    {
      fields: ['post_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = PostLikes;