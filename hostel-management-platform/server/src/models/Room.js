const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: true
    },
    floor: {
      type: Number,
      default: 1
    },
    capacity: {
      type: Number,
      required: true,
      default: 3 // e.g. 3 beds per room
    },
    occupiedBeds: {
      type: Number,
      default: 0
    },
    rentPerBed: {
      type: Number,
      required: true,
      default: 5500
    },
    type: {
      type: String,
      enum: ['AC', 'Non-AC'],
      default: 'Non-AC'
    },
    status: {
      type: String,
      enum: ['Available', 'Full', 'Maintenance'],
      default: 'Available'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Room', roomSchema);
