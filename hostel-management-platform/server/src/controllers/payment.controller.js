const Payment = require('../models/Payment');
const Student = require('../models/Student');

// @desc    Record a new payment
// @route   POST /api/payments
// @access  Private
const makePayment = async (req, res) => {
  try {
    const { amount, paymentMethod, upiApp, monthYear } = req.body;

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student allocation record not found' });
    }

    const receiptNumber = 'RCPT-' + Math.floor(100000 + Math.random() * 900000);
    const transactionId = 'TXN-' + Date.now();

    const payment = await Payment.create({
      student: student._id,
      user: req.user._id,
      amount: amount || student.rentAmount,
      paymentMethod: paymentMethod || 'UPI',
      upiApp: upiApp || 'Google Pay',
      status: 'Successful',
      transactionId,
      monthYear: monthYear || new Date().toLocaleString('default', { month: 'short', year: 'numeric' }),
      receiptNumber
    });

    student.paymentStatus = 'Paid';
    await student.save();

    res.status(201).json({
      message: 'Payment successfully processed',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments (for Owner) or my payments (for Student)
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.user = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  makePayment,
  getPayments
};
