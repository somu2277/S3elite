const mongoose = require('mongoose');

const adminOTPSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      required: true,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    attempts: {
      type: Number,
      default: 0
    },
    resendCount: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    ipAddress: {
      type: String
    },
    browser: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// TTL index to clean up OTP records automatically after 10 minutes
adminOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('AdminOTP', adminOTPSchema);
