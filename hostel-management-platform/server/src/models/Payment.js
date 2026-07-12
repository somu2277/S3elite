const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roomRent: {
      type: Number,
      required: true
    },
    messCharge: {
      type: Number,
      default: 0
    },
    otherCharges: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    roomNumber: {
      type: String,
      required: true
    },
    bedNumber: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Card', 'NetBanking', 'Cash'],
      default: 'UPI'
    },
    upiApp: {
      type: String,
      enum: ['Google Pay', 'PhonePe', 'BHIM', 'Paytm', 'Other'],
      default: 'Google Pay'
    },
    utrNumber: {
      type: String,
      required: true
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending Verification', 'Rejected'],
      default: 'Pending Verification'
    },
    status: {
      type: String,
      enum: ['Successful', 'Pending', 'Failed'],
      default: 'Successful'
    },
    transactionId: {
      type: String,
      required: true
    },
    monthYear: {
      type: String,
      required: true
    },
    receiptNumber: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
