const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  follower_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'ID of the user who is following'
  },
  following_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    comment: 'ID of the user being followed'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'When the follow relationship was created'
  }
}, {
  tableName: 'follows',
  timestamps: false, // Using custom created_at
  indexes: [
    {
      unique: true,
      fields: ['follower_id', 'following_id'] // Prevent duplicate follows
    },
    {
      fields: ['follower_id'] // For finding who someone follows
    },
    {
      fields: ['following_id'] // For finding followers of someone
    }
  ]
});

module.exports = Follow;