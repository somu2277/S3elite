const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'Smart Elite PG & Hostel'
    },
    address: {
      type: String,
      default: '15.772438, 78.059087'
    },
    ownerName: {
      type: String,
      default: 'Shiva'
    },
    ownerPhone: {
      type: String,
      default: '9494211015'
    },
    totalRooms: {
      type: Number,
      default: 0
    },
    totalCapacity: {
      type: Number,
      default: 0
    },
    amenities: [
      {
        type: String
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Hostel', hostelSchema);
