const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    adminEmail: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: ['OTP_GENERATED', 'OTP_VERIFIED', 'OTP_EXPIRED', 'OTP_FAILED', 'RESEND_OTP', 'LOGIN_SUCCESS', 'LOGOUT'],
      required: true
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    },
    failureReason: {
      type: String
    },
    ipAddress: {
      type: String
    },
    browser: {
      type: String
    },
    device: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
