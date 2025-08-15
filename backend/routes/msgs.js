require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const Notification = require('../models/Notification');
const { verifyToken } = require('../middleware/auth');

// Import notification senders from the utility
const { sendEmail, sendSMS, sendWhatsApp, checkVerification, sendVerification } = require('../utils/notifications');

const jobs = new Map();

const scheduleJob = async (notification) => {
  const scheduledTime = new Date(notification.scheduledTime);
  if (scheduledTime <= new Date()) {
    throw new Error('Scheduled time must be in the future');
  }

  const jobId = `${notification.type}_${notification._id}_${Date.now()}`;
  const job = cron.schedule('* * * * *', async () => {
    if (new Date() >= scheduledTime) {
      try {
        if (notification.type === 'email') {
          await sendEmail(notification.recipient, notification.subject, notification.message);
        } else if (notification.type === 'sms') {
          await sendSMS(notification.recipient, notification.message);
        } else if (notification.type === 'whatsapp') {
          await sendWhatsApp(notification.recipient, notification.message);
        }

        await Notification.findByIdAndUpdate(notification._id, {
          status: 'sent',
          sentAt: new Date()
        });

        console.log(`${notification.type} sent successfully for notification ${notification._id}`);
      } catch (error) {
        console.error(`Failed to send ${notification.type}:`, error);
        await Notification.findByIdAndUpdate(notification._id, {
          status: 'failed',
          errorMessage: error.message
        });
      }
      job.stop();
      jobs.delete(jobId);
    }
  }, { scheduled: false });

  jobs.set(jobId, job);
  job.start();
  return jobId;
};

const cancelJob = (jobId) => {
  const job = jobs.get(jobId);
  if (job) {
    job.stop();
    jobs.delete(jobId);
    return true;
  }
  return false;
};

const initializeScheduledJobs = async () => {
  try {
    const pendingNotifications = await Notification.find({
      status: 'scheduled',
      scheduledTime: { $gt: new Date() }
    });

    for (const notification of pendingNotifications) {
      try {
        const jobId = await scheduleJob(notification);
        await Notification.findByIdAndUpdate(notification._id, { jobId });
      } catch (error) {
        console.error(`Failed to reschedule notification ${notification._id}:`, error);
      }
    }
    console.log(`Rescheduled ${pendingNotifications.length} notifications`);
  } catch (error) {
    console.error('Error initializing scheduled jobs:', error);
  }
};

const router = express.Router();

// Schedule notification
router.post('/notifications', verifyToken, async (req, res) => {
  try {
    const { type, recipient, subject, message, scheduledTime } = req.body;
    const userId = req.user.userId;

    if (!type || !recipient || !message || !scheduledTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (type === 'email' && !subject) {
      return res.status(400).json({ error: 'Subject is required for email' });
    }
    if (!['email', 'sms', 'whatsapp'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const scheduledDate = new Date(scheduledTime);
    if (scheduledDate <= new Date()) {
      return res.status(400).json({ error: 'Scheduled time must be in the future' });
    }

    const notification = new Notification({
      userId,
      type,
      recipient,
      subject,
      message,
      scheduledTime: scheduledDate,
      status: 'scheduled'
    });

    await notification.save();

    const jobId = await scheduleJob(notification);
    notification.jobId = jobId;
    await notification.save();

    res.status(201).json({ message: `${type} scheduled successfully`, notification });
  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to schedule notification' });
  }
});

// Send immediate notification
router.post('/send-immediate', verifyToken, async (req, res) => {
  try {
    const { type, recipient, subject, message } = req.body;
    const userId = req.user.userId;

    if (!type || !recipient || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (type === 'email' && !subject) {
      return res.status(400).json({ error: 'Subject is required for email' });
    }
    if (!['email', 'sms', 'whatsapp'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type' });
    }

    // Send immediately
    if (type === 'email') {
      await sendEmail(recipient, subject, message);
    } else if (type === 'sms') {
      await sendSMS(recipient, message);
    } else if (type === 'whatsapp') {
      await sendWhatsApp(recipient, message);
    }

    // Save record
    const notification = new Notification({
      userId,
      type,
      recipient,
      subject,
      message,
      status: 'sent',
      sentAt: new Date()
    });

    await notification.save();

    res.status(200).json({ message: `${type} sent successfully`, notification });
  } catch (error) {
    console.error('Send immediate error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send verification (creates a Notification record)
router.post('/verify/send', verifyToken, async (req, res) => {
  try {
    const { to, channel = 'sms' } = req.body;
    const userId = req.user.userId;

    if (!to) {
      return res.status(400).json({ error: 'Missing "to" (recipient) in request body' });
    }

    // Call utility to send verification (Twilio Verify or similar)
    const sendResult = await sendVerification(to, channel);

    // Create an audit Notification record for this verification attempt
    const notif = new Notification({
      userId,
      type: 'verification',
      recipient: to,
      subject: null,
      message: `Sent ${channel} verification`,
      status: sendResult && sendResult.status ? sendResult.status : 'pending',
      meta: sendResult
    });

    await notif.save();

    res.status(200).json({
      message: 'Verification sent',
      sendResult,
      notification: notif
    });
  } catch (error) {
    console.error('Error sending verification:', error);
    res.status(500).json({ error: 'Failed to send verification', details: error.message });
  }
});

// Get all notifications for a user
router.get('/notifications', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Check verification code and update notification status
router.post('/verify/check', verifyToken, async (req, res) => {
  try {
    const { to, code } = req.body;
    const userId = req.user.userId;

    if (!to || !code) {
      return res.status(400).json({ error: 'Missing "to" or "code" in request body' });
    }

    // Call utility to verify the code
    const checkResult = await checkVerification(to, code);

    // Normalize status
    const isApproved = checkResult && (checkResult.status === 'approved');
    const newStatus = isApproved ? 'verified' : 'failed';

    // Update the most recent verification notification for this user+recipient
    const notif = await Notification.findOneAndUpdate(
      { userId, recipient: to, type: 'verification' },
      {
        status: newStatus,
        verifiedAt: isApproved ? new Date() : undefined,
        metaCheck: checkResult
      },
      { sort: { createdAt: -1 }, new: true }
    );

    res.status(200).json({
      message: isApproved ? 'Verification successful' : 'Verification failed',
      checkResult,
      notification: notif
    });
  } catch (error) {
    console.error('Error checking verification:', error);
    res.status(500).json({ error: 'Failed to check verification', details: error.message });
  }
});

// Update notification
router.put('/notifications/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, recipient, subject, message, scheduledTime } = req.body;
    const userId = req.user.userId;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.status === 'sent') {
      return res.status(400).json({ error: 'Cannot update sent notification' });
    }

    // Cancel existing job if it exists
    if (notification.jobId) {
      cancelJob(notification.jobId);
    }

    // Update notification
    notification.type = type || notification.type;
    notification.recipient = recipient || notification.recipient;
    notification.subject = subject || notification.subject;
    notification.message = message || notification.message;
    
    if (scheduledTime) {
      const scheduledDate = new Date(scheduledTime);
      if (scheduledDate <= new Date()) {
        return res.status(400).json({ error: 'Scheduled time must be in the future' });
      }
      notification.scheduledTime = scheduledDate;
    }

    await notification.save();

    // Reschedule if it's a scheduled notification
    if (notification.status === 'scheduled' && notification.scheduledTime) {
      const jobId = await scheduleJob(notification);
      notification.jobId = jobId;
      await notification.save();
    }

    res.status(200).json({ message: 'Notification updated successfully', notification });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Delete/Cancel notification
router.delete('/notifications/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Cancel job if it exists
    if (notification.jobId) {
      cancelJob(notification.jobId);
    }

    // Delete the notification
    await Notification.findByIdAndDelete(id);

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

module.exports = {
  scheduleJob,
  cancelJob,
  initializeScheduledJobs,
  router
};
