const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");

// Get functions from msgs.js
const { sendEmail, sendSMS } = require("../utils/notifications");


const router = express.Router();

// ===== Rate Limiting =====
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: "Too many registration attempts, try again later" }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many login attempts, try again later" }
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many verification attempts, try again later" }
});

const resendLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,
  message: { error: "Too many resend attempts, try again later" }
});

// ===== Input Validation =====
const validateRegistration = (req, res, next) => {
  const { email, phone, password } = req.body;
  
  if (!email || !phone || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ""))) {
    return res.status(400).json({ error: "Invalid phone format" });
  }
  
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { identifier, password } = req.body;
  
  if (!identifier || !password) {
    return res.status(400).json({ error: "Please provide email/phone and password" });
  }
  
  next();
};

// ===== JWT Verification =====
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided" });
  }
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    res.status(401).json({ error: "Invalid token" });
  }
};

// ===== Helpers =====
const generateVerificationCode = () => crypto.randomInt(100000, 999999).toString();

const createToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ===== Routes =====
router.post("/register", registerLimiter, validateRegistration, async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(409).json({ error: "Email already registered" });
      }
      if (existingUser.phone === phone) {
        return res.status(409).json({ error: "Phone number already registered" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const emailCode = generateVerificationCode();
    const phoneCode = generateVerificationCode();

    const user = new User({
      email: email.toLowerCase().trim(),
      phone: phone.replace(/\s/g, ""),
      password: hashedPassword,
      emailVerificationCode: emailCode,
      phoneVerificationCode: phoneCode,
      isVerified: false
    });

    await user.save();

    // Send verification codes
    try {
      await Promise.all([
        sendEmail(email, "Verification Code", `Your verification code is ${emailCode}`),
        sendSMS(phone, `Your verification code is ${phoneCode}`)
      ]);
    } catch (error) {
      console.error("Failed to send verification codes:", error);
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ error: "Failed to send verification codes" });
    }

    res.status(201).json({
      message: "Registration successful. Verification codes sent to email and phone.",
      email
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/verify", verifyLimiter, async (req, res) => {
  try {
    const { email, emailCode, phoneCode } = req.body;
    
    if (!email || !emailCode || !phoneCode) {
      return res.status(400).json({ error: "Email and both verification codes are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), isVerified: false });
    if (!user) {
      return res.status(404).json({ error: "User not found or already verified" });
    }

    if (user.emailVerificationCode === emailCode && user.phoneVerificationCode === phoneCode) {
      user.isVerified = true;
      user.emailVerificationCode = undefined;
      user.phoneVerificationCode = undefined;
      await user.save();

      const token = createToken(user._id, user.email);
      return res.json({
        message: "Account verified successfully",
        token,
        user: { id: user._id, email: user.email, phone: user.phone }
      });
    }

    res.status(400).json({ error: "Invalid verification codes" });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/resend-codes", resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim(), isVerified: false });
    if (!user) return res.status(404).json({ error: "User not found or already verified" });

    const emailCode = generateVerificationCode();
    const phoneCode = generateVerificationCode();
    
    user.emailVerificationCode = emailCode;
    user.phoneVerificationCode = phoneCode;
    await user.save();

    try {
      await Promise.all([
        sendEmail(user.email, "New Verification Code", `Your new verification code is ${emailCode}`),
        sendSMS(user.phone, `Your new verification code is ${phoneCode}`)
      ]);
    } catch (error) {
      console.error("Failed to resend verification codes:", error);
      return res.status(500).json({ error: "Failed to send verification codes" });
    }

    res.json({ message: "Verification codes resent successfully" });
  } catch (err) {
    console.error("Resend codes error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", loginLimiter, validateLogin, async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.replace(/\s/g, "") }
      ]
    });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Account not verified. Please verify your email and phone number first.",
        needsVerification: true,
        email: user.email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = createToken(user._id, user.email);
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, phone: user.phone }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("-password -emailVerificationCode -phoneVerificationCode");
    
    if (!user) return res.status(404).json({ error: "User not found" });
    
    res.json({ user });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout", verifyToken, (req, res) => {
  res.json({ message: "Logged out successfully" });
});

module.exports = { router, verifyToken };