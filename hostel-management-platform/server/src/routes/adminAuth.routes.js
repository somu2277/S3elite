const express = require('express');
const jwt = require('jsonwebtoken');
const AdminOTP = require('../models/AdminOTP');
const AdminAuditLog = require('../models/AdminAuditLog');
const { generate6DigitOTP, hashOTP, sendAdminOTP, ADMIN_PHONE_NUMBER } = require('../services/whatsapp.service');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise_super_secret_jwt_key_2026';

// Store dev-demo OTP in memory for local testing while maintaining security principles
let lastGeneratedDevOTP = null;

/**
 * Single-Step Admin Login
 * POST /api/admin/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const browser = req.headers['user-agent'] || 'Unknown Browser';

    // Authorized corporate admin check
    const validEmails = ['shiva@s3elite.in', 'shiva@smartpg.com', 'admin@s3elite.in'];
    if (!email || !validEmails.includes(email.toLowerCase()) || !password) {
      await AdminAuditLog.create({
        adminEmail: email || 'unknown',
        action: 'LOGIN_FAILED',
        status: 'FAILURE',
        failureReason: 'Invalid Credentials',
        ipAddress,
        browser
      });
      return res.status(401).json({ success: false, message: 'Invalid Credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: 'admin_shiva_01',
        email: email.toLowerCase(),
        role: 'owner',
        name: 'Shiva (Enterprise Admin)'
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Record Audit Log
    await AdminAuditLog.create({
      adminEmail: email.toLowerCase(),
      action: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress,
      browser
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        name: 'Shiva',
        email: email.toLowerCase(),
        role: 'owner',
        phone: ADMIN_PHONE_NUMBER
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Resend Admin WhatsApp OTP (Available after 30s timer)
 * POST /api/admin/auth/resend-otp
 */
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const browser = req.headers['user-agent'] || 'Unknown Browser';

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email required.' });
    }

    const existingRecord = await AdminOTP.findOne({ adminEmail: email.toLowerCase() });

    // Check resend limit (Max 5)
    if (existingRecord && existingRecord.resendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Maximum resend attempts reached. Please wait 10 minutes before trying again.'
      });
    }

    const otp = generate6DigitOTP();
    const otpHash = hashOTP(otp);
    lastGeneratedDevOTP = otp;
    const expiresAt = new Date(Date.now() + 30 * 1000);

    const resendCount = (existingRecord?.resendCount || 0) + 1;

    await AdminOTP.deleteMany({ adminEmail: email.toLowerCase() });
    await AdminOTP.create({
      adminEmail: email.toLowerCase(),
      otpHash,
      expiresAt,
      attempts: 0,
      resendCount,
      verified: false,
      ipAddress,
      browser
    });

    await sendAdminOTP(ADMIN_PHONE_NUMBER, otp);

    await AdminAuditLog.create({
      adminEmail: email.toLowerCase(),
      action: 'RESEND_OTP',
      status: 'SUCCESS',
      ipAddress,
      browser
    });

    return res.status(200).json({
      success: true,
      message: 'New 6-digit WhatsApp OTP sent.',
      expirySeconds: 30,
      devDemoOtpHint: process.env.NODE_ENV !== 'production' ? otp : undefined
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
