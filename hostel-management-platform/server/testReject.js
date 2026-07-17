const mongoose = require('mongoose');
const BookingRequest = require('./src/models/BookingRequest');
const Bed = require('./src/models/Bed');
const dotenv = require('dotenv');

dotenv.config();

async function testReject() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/s3elite');
  try {
    const id = '6a5a2e4d85d36fc7fd6df0b9';
    const request = await BookingRequest.findById(id);
    if (!request) {
      console.log('Request not found');
      return;
    }
    console.log('Found request:', request);
    request.paymentStatus = 'Rejected';
    request.verificationRemark = 'Test reason';
    request.status = 'Rejected';
    await request.save();
    console.log('Saved successfully');
  } catch (e) {
    console.error('ERROR OCCURRED:', e);
  } finally {
    mongoose.disconnect();
  }
}
testReject();
