const { DataTypes, Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  ID: {
    type: DataTypes.BIGINT.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  user_login: {
    type: DataTypes.STRING(60),
    allowNull: false,
    unique: true,
    comment: 'Username for login'
  },
  user_pass: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Hashed password'
  },
  user_nicename: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '',
    comment: 'URL-friendly username'
  },
  user_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    comment: 'User email address'
  },
  user_url: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: '',
    comment: 'User website URL'
  },
  user_registered: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Registration date'
  },
  user_activation_key: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: '',
    comment: 'Account activation key'
  },
  user_status: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '0=pending, 1=active, 2=suspended, 3=banned'
  },
  display_name: {
    type: DataTypes.STRING(250),
    allowNull: false,
    defaultValue: '',
    comment: 'Display name for user'
  },
  // Authentication columns (added via migrations)
  user_role: {
    type: DataTypes.ENUM('superadmin', 'admin', 'writer', 'user'),
    allowNull: false,
    defaultValue: 'user',
    comment: 'User role in the system'
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether email is verified'
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Last login timestamp'
  },
  failed_login_attempts: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Number of failed login attempts'
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Account lock expiration timestamp'
  },
  profile_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Profile image path'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'User biography'
  }
}, {
  tableName: 'users',
  timestamps: false, // WordPress style doesn't use standard timestamps
  charset: 'utf8mb4',
  collate: 'utf8mb4_unicode_520_ci',
  indexes: [
    {
      name: 'user_login_key',
      unique: true,
      fields: ['user_login']
    },
    {
      name: 'user_email',
      unique: true,
      fields: ['user_email']
    },
    {
      name: 'user_nicename',
      fields: ['user_nicename']
    },
    {
      name: 'idx_user_role',
      fields: ['user_role']
    },
    {
      name: 'idx_user_status',
      fields: ['user_status']
    },
    {
      name: 'idx_email_verified',
      fields: ['email_verified']
    },
    {
      name: 'idx_last_login',
      fields: ['last_login']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      // Hash password before creating user
      if (user.user_pass && !user.user_pass.startsWith('$2a$')) {
        user.user_pass = await bcrypt.hash(user.user_pass, 12);
      }
      
      // Set user_nicename if not provided
      if (!user.user_nicename && user.user_login) {
        user.user_nicename = user.user_login.toLowerCase().replace(/[^a-z0-9]/g, '');
      }
    },
    beforeUpdate: async (user) => {
      // Hash password if it's being updated and not already hashed
      if (user.changed('user_pass') && user.user_pass && !user.user_pass.startsWith('$2a$')) {
        user.user_pass = await bcrypt.hash(user.user_pass, 12);
      }
    }
  }
});

// Instance methods
User.prototype.isActive = function() {
  return this.user_status === 1 && this.email_verified === true;
};

User.prototype.isLocked = function() {
  if (!this.locked_until) return false;
  return new Date() < new Date(this.locked_until);
};

User.prototype.generateToken = function() {
  return jwt.sign(
    { 
      id: this.ID,
      email: this.user_email,
      role: this.user_role
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
    }
  );
};

User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.user_pass);
};

User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.user_pass);
};

User.prototype.toSafeJSON = function() {
  const values = { ...this.dataValues };
  delete values.user_pass;
  delete values.user_activation_key;
  return values;
};

User.prototype.canEditPost = function(post) {
  // SuperAdmin dan Admin bisa edit semua post
  if (this.user_role === 'superadmin' || this.user_role === 'admin') {
    return true;
  }
  
  // Writer hanya bisa edit post mereka sendiri
  if (this.user_role === 'writer') {
    return post.post_author === this.ID;
  }
  
  // User biasa tidak bisa edit post
  return false;
};

// Class/Static methods
User.findByEmailOrLogin = async function(identifier) {
  return await this.findOne({
    where: {
      [Op.or]: [
        { user_email: identifier.toLowerCase() },
        { user_login: identifier.toLowerCase() }
      ]
    }
  });
};

User.incrementFailedAttempts = async function(userId) {
  const user = await this.findByPk(userId);
  if (!user) return;

  const newAttempts = (user.failed_login_attempts || 0) + 1;
  const updates = { failed_login_attempts: newAttempts };

  // Lock account after 5 failed attempts for 15 minutes
  if (newAttempts >= 5) {
    updates.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  }

  await user.update(updates);
};

User.resetFailedAttempts = async function(userId) {
  const user = await this.findByPk(userId);
  if (!user) return;

  await user.update({
    failed_login_attempts: 0,
    locked_until: null
  });
};

module.exports = User;
