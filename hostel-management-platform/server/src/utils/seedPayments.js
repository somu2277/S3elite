require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Bed = require('../models/Bed');

const seedPayments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_hostel_db');
    console.log('Connected to DB');

    // Clear existing payments
    await Payment.deleteMany({});
    console.log('Cleared existing payments.');

    // Find the occupied bed
    const bed = await Bed.findOne({ occupied: true });

    if (bed) {
      const dummyStudentId = new mongoose.Types.ObjectId();
      const dummyUserId = new mongoose.Types.ObjectId();

      const newPayments = [
        {
          student: dummyStudentId,
          user: dummyUserId,
          amount: bed.rentPerBed || 6500,
          roomNumber: bed.roomNumber,
          bedNumber: bed.bedNumber,
          paymentMethod: 'UPI',
          upiApp: 'PhonePe',
          utrNumber: 'UTR9384729384',
          verificationStatus: 'Pending Verification',
          status: 'Successful',
          transactionId: 'TXN-839284758',
          monthYear: 'Jul 2026',
          receiptNumber: 'RCPT-1001'
        },
        {
          student: dummyStudentId,
          user: dummyUserId,
          amount: bed.rentPerBed || 6500,
          roomNumber: bed.roomNumber,
          bedNumber: bed.bedNumber,
          paymentMethod: 'UPI',
          upiApp: 'Google Pay',
          utrNumber: 'UTR5847362748',
          verificationStatus: 'Verified',
          status: 'Successful',
          transactionId: 'TXN-938475839',
          monthYear: 'Jun 2026',
          receiptNumber: 'RCPT-1000'
        }
      ];

      await Payment.insertMany(newPayments);
      console.log('Successfully seeded 2 mock payments for the occupied bed.');
    } else {
      console.log('No occupied bed found to seed payments for.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedPayments();
