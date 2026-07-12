const express = require('express');
const router = express.Router();
const { makePayment, getPayments } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, makePayment);
router.get('/', protect, getPayments);

module.exports = router;
