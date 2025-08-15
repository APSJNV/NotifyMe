require('dotenv').config();
const twilio = require('twilio');
const nodemailer = require('nodemailer');

// Twilio Client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email Transporter
const Transport = nodemailer.createTransport
({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, message) => {
  try {
    const info = await Transport.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text: message
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    console.log('SMS sent:', result.sid);
    return result;
  } catch (error) {
    console.error('SMS sending error:', error);
    throw error;
  }
};

const sendWhatsApp = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${to}`
    });
    console.log('WhatsApp sent:', result.sid);
    return result;
  } catch (error) {
    console.error('WhatsApp sending error:', error);
    throw error;
  }
};

const sendVerification = async (to, channel = 'sms') => {
  try {
    const verification = await client.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verifications.create({
        to,
        channel, // 'sms', 'call', or 'email'
      });

    console.log('Verification status:', verification.status);
    return verification;
  } catch (error) {
    console.error('Verification sending error:', error);
    throw error;
  }
};

const checkVerification = async (to, code) => {
  try {
    const result = await client.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to,
        code,
      });

    if (result.status === 'approved') {
      console.log('✅ User verified!');
    } else {
      console.log('❌ Verification failed.');
    }
    
    return result;
  } catch (error) {
    console.error('Verification check error:', error);
    throw error;
  }
};

module.exports = { 
  sendEmail, 
  sendSMS, 
  sendWhatsApp, 
  sendVerification, 
  checkVerification 
};