const mongoose = require('mongoose');

const messSubscriberSchema = new mongoose.Schema({
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
  address: { type: String },
  collegeCompany: { type: String },
  occupation: { type: String, default: 'Student' },
  mealPreference: { type: String, enum: ['Veg', 'Non-Veg'], default: 'Veg' },
  startDate: { type: Date, required: true },
  plan: { type: String, default: 'Standard Monthly (₹2500)' },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Active', 'Inactive'], 
    default: 'Pending' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

messSubscriberSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MessSubscriber', messSubscriberSchema);
