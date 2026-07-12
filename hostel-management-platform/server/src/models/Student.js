const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room'
    },
    roomNumber: {
      type: String,
      default: 'Unassigned'
    },
    bedNumber: {
      type: Number,
      default: 1
    },
    emergencyContact: {
      type: String,
      default: ''
    },
    rentAmount: {
      type: Number,
      default: 5500
    },
    rentDueDate: {
      type: Date,
      default: () => {
        const d = new Date();
        return new Date(d.getFullYear(), d.getMonth() + 1, 5); // 5th of next month
      }
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Pending'
    },
    messEnabled: {
      type: Boolean,
      default: false
    },
    messCharge: {
      type: Number,
      default: 2500
    },
    messStatus: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Inactive'
    },
    messStartDate: {
      type: Date
    },
    messEndDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Student', studentSchema);
