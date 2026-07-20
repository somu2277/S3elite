const mongoose = require('mongoose');

const rentRenewalSchema = new mongoose.Schema(
  {
    residentBed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bed',
      required: true
    },
    residentName: {
      type: String,
      required: true
    },
    bookingId: {
      type: String,
      required: true
    },
    phone: {
      type: String,
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
    monthlyRent: {
      type: Number,
      required: true
    },
    renewalDuration: {
      type: Number, // in months
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    previousPaidUntil: {
      type: String, // Kept as string to match existing date formats if necessary
      required: true
    },
    proposedNewPaidUntil: {
      type: String,
      required: true
    },
    utrNumber: {
      type: String,
      required: true
    },
    paymentScreenshot: {
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
      default: 'Pending'
    },
    paymentType: {
      type: String,
      default: 'PG Rent Renewal'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('RentRenewal', rentRenewalSchema);
