const express = require('express');
const router = express.Router();
const Bed = require('../models/Bed');
const BookingRequest = require('../models/BookingRequest');
const RentRenewal = require('../models/RentRenewal');
const Payment = require('../models/Payment');

/**
 * Helper to broadcast Socket.IO events to all connected clients
 */
const emitSocketEvent = (req, eventType, payload) => {
  const io = req.app.get('io');
  if (io) {
    io.emit('ERP_EVENT', {
      type: eventType,
      payload,
      timestamp: Date.now()
    });
  }
};

/**
 * POST /api/rent-renewal/verify-resident
 * Verifies a resident by Phone and Booking ID (or Resident/Student ID)
 */
router.post('/verify-resident', async (req, res) => {
  try {
    const { name, phone, roomNumber, bedNumber } = req.body;

    if (!name || !phone || !roomNumber || !bedNumber) {
      return res.status(400).json({ success: false, message: 'All fields (Name, Phone, Room, Cot) are required' });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const phoneRegex = new RegExp(`${cleanPhone.slice(-10)}$`);

    // Find the occupied bed for this user matching ALL criteria (except name, to allow for nicknames/typos)
    let bed = await Bed.findOne({ 
      roomNumber: roomNumber, 
      bedNumber: Number(bedNumber), 
      occupied: true,
      phone: { $regex: phoneRegex }
    });

    if (!bed) {
      return res.status(404).json({ success: false, message: "We couldn't find an active stay matching these details. Please check your name, mobile number, room and cot." });
    }

    let foundBookingId = bed.studentId || bed.admissionNumber || 'N/A';

    // Determine the sharing type based on all beds in that room
    const allBedsInRoom = await Bed.find({ roomNumber: bed.roomNumber });
    const sharingType = `${allBedsInRoom.length} Sharing`;

    const residentData = {
      residentBed: bed._id,
      studentName: bed.studentName,
      phone: phone,
      bookingId: foundBookingId,
      roomNumber: bed.roomNumber,
      cot: `Cot ${bed.bedNumber}`,
      bedNumber: bed.bedNumber,
      sharing: sharingType,
      monthlyRent: bed.rentPerBed || 6000,
      lastPayment: bed.lastPaymentDate || 'Not Available',
      paidUntil: bed.nextDueDate || 'Not Available', // using nextDueDate as paidUntil
      nextDueDate: bed.nextDueDate || 'Not Available',
      paymentStatus: bed.paymentStatus || 'Paid'
    };

    return res.status(200).json({ success: true, data: residentData });

  } catch (err) {
    console.error('Verify Resident Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify resident' });
  }
});

/**
 * POST /api/rent-renewal/submit
 * Submits a new rent renewal request
 */
router.post('/submit', async (req, res) => {
  try {
    const { 
      residentBed, studentName, bookingId, phone, roomNumber, bedNumber, 
      monthlyRent, renewalDuration, amount, previousPaidUntil, proposedNewPaidUntil, 
      utrNumber, paymentScreenshot 
    } = req.body;

    if (!utrNumber || utrNumber.length !== 12 || !paymentScreenshot) {
      return res.status(400).json({ success: false, message: 'Valid 12-digit UTR Number and Payment Screenshot are required.' });
    }

    // Check if there is already a pending renewal for this bed
    const existingPending = await RentRenewal.findOne({
      residentBed: residentBed,
      verificationStatus: 'Pending Verification'
    });

    if (existingPending) {
      return res.status(400).json({ success: false, message: 'Your rent payment is already awaiting verification.' });
    }
    
    // Check for duplicate UTR across all renewals and payments
    const existingUTRinRenewals = await RentRenewal.findOne({ utrNumber });
    const existingUTRinPayments = await Payment.findOne({ utrNumber });
    if (existingUTRinRenewals || existingUTRinPayments) {
      return res.status(400).json({ success: false, message: 'This UTR Number has already been used.' });
    }

    const rentRenewal = await RentRenewal.create({
      residentBed: residentBed,
      residentName: studentName,
      bookingId,
      phone,
      roomNumber,
      bedNumber,
      monthlyRent,
      renewalDuration,
      amount,
      previousPaidUntil,
      proposedNewPaidUntil,
      utrNumber,
      paymentScreenshot,
      verificationStatus: 'Pending Verification',
      status: 'Pending',
      paymentType: 'PG Rent Renewal'
    });

    emitSocketEvent(req, 'RENT_RENEWAL_SUBMITTED', rentRenewal);

    return res.status(201).json({ success: true, message: 'Rent renewal submitted successfully.', data: rentRenewal });

  } catch (err) {
    console.error('Submit Rent Renewal Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit rent renewal.' });
  }
});

module.exports = router;
