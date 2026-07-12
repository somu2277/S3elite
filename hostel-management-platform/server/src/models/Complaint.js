const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roomNumber: {
      type: String,
      default: 'General'
    },
    category: {
      type: String,
      enum: ['Electrical', 'Plumbing', 'Cleanliness', 'Internet', 'Furniture', 'Food', 'Other'],
      default: 'Other'
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    aiPriority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
