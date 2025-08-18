const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordReset = sequelize.define('PasswordReset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Email for password reset'
  },
  otp_code: {
    type: DataTypes.STRING(6),
    allowNull: false,
    comment: '6-digit OTP code'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'OTP expiration time'
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether OTP has been used'
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Number of verification attempts'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'password_resets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_email',
      fields: ['email']
    },
    {
      name: 'idx_otp_code',
      fields: ['otp_code']
    },
    {
      name: 'idx_expires_at',
      fields: ['expires_at']
    }
  ]
});

// Instance methods
PasswordReset.prototype.isExpired = function() {
  return new Date() > this.expires_at;
};

PasswordReset.prototype.isValid = function() {
  return !this.is_used && !this.isExpired() && this.attempts < 5;
};

// Static methods
PasswordReset.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

PasswordReset.createOTP = async function(email) {
  const otpCode = this.generateOTP();
  const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN || 300000)); // 5 minutes

  // Invalidate any existing OTPs for this email
  await this.update(
    { is_used: true },
    { where: { email, is_used: false } }
  );

  // Create new OTP
  const passwordReset = await this.create({
    email,
    otp_code: otpCode,
    expires_at: expiresAt
  });

  return passwordReset;
};

PasswordReset.verifyOTP = async function(email, otpCode) {
  const passwordReset = await this.findOne({
    where: {
      email,
      otp_code: otpCode,
      is_used: false
    },
    order: [['created_at', 'DESC']]
  });

  if (!passwordReset) {
    return { success: false, message: 'Kode OTP tidak valid' };
  }

  // Increment attempts
  await passwordReset.increment('attempts');
  await passwordReset.reload();

  if (passwordReset.attempts > 5) {
    return { success: false, message: 'Terlalu banyak percobaan. Minta OTP baru.' };
  }

  if (passwordReset.isExpired()) {
    return { success: false, message: 'Kode OTP sudah expired' };
  }

  if (!passwordReset.isValid()) {
    return { success: false, message: 'Kode OTP tidak valid' };
  }

  // Mark as used
  await passwordReset.update({ is_used: true });

  return { success: true, message: 'Kode OTP valid' };
};

module.exports = PasswordReset;