const mongoose = require('mongoose');

const bookingRequestSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true, sparse: true },
  utrNumber: { type: String },
  paymentScreenshot: { type: String },
  paymentStatus: { 
    type: String, 
    enum: ['Pending Verification', 'Verified', 'Rejected'], 
    default: 'Pending Verification' 
  },
  verificationRemark: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  whatsappNumber: { type: String },
  fatherName: { type: String },
  emergencyContact: { type: String },
  currentAddress: { type: String },
  collegeCompany: { type: String },
  occupation: { type: String, default: 'Student' },
  gender: { type: String, default: 'Male' },
  expectedJoiningDate: { type: Date },
  stayDuration: { type: String, required: true },
  notes: { type: String },
  aadhaar: { type: String },
  preferredRoom: { type: String, required: true },
  preferredBed: { type: Number, required: true },
  roomRent: { type: Number },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

bookingRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
