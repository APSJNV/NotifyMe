const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    required: function() {
      return !this.isVerified;
    }
  },
  phoneVerificationCode: {
    type: String,
    required: function() {
      return !this.isVerified;
    }
  },
  emailVerificationCodeExpires: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
  },
  phoneVerificationCodeExpires: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    }
  },
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationCode;
      delete ret.phoneVerificationCode;
      delete ret.emailVerificationCodeExpires;
      delete ret.phoneVerificationCodeExpires;
      return ret;
    }
  }
});

// Index for better query performance
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ isVerified: 1 });

// Pre-save middleware to clean phone number
UserSchema.pre('save', function(next) {
  if (this.phone) {
    this.phone = this.phone.replace(/\s/g, '');
  }
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Instance method to check if verification codes are expired
UserSchema.methods.isVerificationCodeExpired = function(type) {
  if (type === 'email') {
    return new Date() > this.emailVerificationCodeExpires;
  } else if (type === 'phone') {
    return new Date() > this.phoneVerificationCodeExpires;
  }
  return false;
};

// Instance method to update last login
UserSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model("User", UserSchema);