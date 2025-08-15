const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'whatsapp'],
    required: [true, 'Notification type is required']
  },
  recipient: {
    type: String,
    required: [true, 'Recipient is required'],
    trim: true,
    validate: {
      validator: function(value) {
        if (this.type === 'email') {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        } else if (this.type === 'sms' || this.type === 'whatsapp') {
          return /^\+?[\d\s\-\(\)]{10,15}$/.test(value);
        }
        return true;
      },
      message: 'Invalid recipient format for the specified type'
    }
  },
  subject: {
    type: String,
    required: function () {
      return this.type === 'email';
    },
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1600, 'Message cannot exceed 1600 characters for SMS/WhatsApp'],
    validate: {
      validator: function(value) {
        if ((this.type === 'sms' || this.type === 'whatsapp') && value.length > 1600) {
          return false;
        }
        return true;
      },
      message: 'Message too long for SMS/WhatsApp'
    }
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    index: true,
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Scheduled time must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'sent', 'failed', 'cancelled'],
    default: 'scheduled',
    index: true
  },
  jobId: {
    type: String,
    sparse: true
  },
  sentAt: {
    type: Date
  },
  errorMessage: {
    type: String,
    trim: true
  },
  retryCount: {
    type: Number,
    default: 0,
    max: 3
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  template: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, status: 1 });
notificationSchema.index({ scheduledTime: 1, status: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledTime: 1 });
notificationSchema.index({ userId: 1, type: 1, status: 1 });

// Pre-save middleware to format recipient
notificationSchema.pre('save', function(next) {
  if (this.recipient) {
    if (this.type === 'email') {
      this.recipient = this.recipient.toLowerCase().trim();
    } else if (this.type === 'sms' || this.type === 'whatsapp') {
      this.recipient = this.recipient.replace(/\s/g, '');
    }
  }
  next();
});

// Instance method to mark as sent
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

// Instance method to mark as failed
notificationSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.retryCount += 1;
  return this.save();
};

// Instance method to mark as cancelled
notificationSchema.methods.markAsCancelled = function() {
  this.status = 'cancelled';
  return this.save();
};

// Instance method to check if can retry
notificationSchema.methods.canRetry = function() {
  return this.status === 'failed' && this.retryCount < 3;
};

// Instance method to reset for retry
notificationSchema.methods.resetForRetry = function() {
  if (this.canRetry()) {
    this.status = 'scheduled';
    this.errorMessage = undefined;
    return this.save();
  }
  return this;
};

// Static method to find pending notifications
notificationSchema.statics.findPending = function() {
  return this.find({
    status: 'scheduled',
    scheduledTime: { $lte: new Date() }
  }).sort({ priority: -1, scheduledTime: 1 });
};

// Static method to find by user with filters
notificationSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.status) {
    query.status = filters.status;
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) {
      query.createdAt.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      query.createdAt.$lte = new Date(filters.dateTo);
    }
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Static method to get user statistics
notificationSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        emailCount: { $sum: { $cond: [{ $eq: ['$type', 'email'] }, 1, 0] } },
        smsCount: { $sum: { $cond: [{ $eq: ['$type', 'sms'] }, 1, 0] } },
        whatsappCount: { $sum: { $cond: [{ $eq: ['$type', 'whatsapp'] }, 1, 0] } }
      }
    }
  ]);
};

// Virtual for time until scheduled
notificationSchema.virtual('timeUntilScheduled').get(function() {
  if (this.status !== 'scheduled') return null;
  const now = new Date();
  const scheduled = new Date(this.scheduledTime);
  return scheduled.getTime() - now.getTime();
});

// Virtual for formatted scheduled time
notificationSchema.virtual('formattedScheduledTime').get(function() {
  return this.scheduledTime.toLocaleString();
});

module.exports = mongoose.model('Notification', notificationSchema);