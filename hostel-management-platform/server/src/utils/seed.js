require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smart_hostel_db');
    console.log('Connected to MongoDB for seeding...');
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();

  await User.deleteMany();
  await Hostel.deleteMany();
  await Room.deleteMany();
  await Student.deleteMany();
  await Payment.deleteMany();
  await Complaint.deleteMany();

  console.log('Old records cleared.');

  // Create Owner Shiva
  const ownerUser = await User.create({
    name: 'Shiva',
    email: 'shiva@smartpg.com',
    password: 'password123',
    role: 'owner',
    phone: '9494211015'
  });

  // Create Sample Student
  const studentUser = await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@gmail.com',
    password: 'password123',
    role: 'student',
    phone: '9876543210'
  });

  // Create Hostel Record
  const hostel = await Hostel.create({
    name: 'Smart AI Elite PG & Hostel',
    address: '15.7724378865698, 78.05908726789515',
    ownerName: 'Shiva',
    ownerPhone: '9494211015',
    totalRooms: 6,
    totalCapacity: 18,
    amenities: ['High-Speed WiFi', '24/7 Power Backup', 'Bio-Metric Security', 'Hygienic Food', 'CCTV Monitoring']
  });

  // Create Sample Rooms
  const roomsData = [
    { roomNumber: '101', floor: 1, capacity: 3, occupiedBeds: 2, rentPerBed: 6000, type: 'AC', status: 'Available' },
    { roomNumber: '102', floor: 1, capacity: 3, occupiedBeds: 3, rentPerBed: 5000, type: 'Non-AC', status: 'Full' },
    { roomNumber: '103', floor: 1, capacity: 3, occupiedBeds: 1, rentPerBed: 6000, type: 'AC', status: 'Available' },
    { roomNumber: '201', floor: 2, capacity: 3, occupiedBeds: 2, rentPerBed: 5500, type: 'Non-AC', status: 'Available' },
    { roomNumber: '202', floor: 2, capacity: 3, occupiedBeds: 3, rentPerBed: 6500, type: 'AC', status: 'Full' },
    { roomNumber: '203', floor: 2, capacity: 3, occupiedBeds: 0, rentPerBed: 5000, type: 'Non-AC', status: 'Available' }
  ];

  const createdRooms = await Room.insertMany(roomsData);

  // Create Student record for Rahul
  const studentRecord = await Student.create({
    user: studentUser._id,
    room: createdRooms[0]._id,
    roomNumber: '101',
    bedNumber: 1,
    emergencyContact: '9123456780',
    rentAmount: 6000,
    paymentStatus: 'Paid'
  });

  // Create sample Payment
  await Payment.create({
    student: studentRecord._id,
    user: studentUser._id,
    amount: 6000,
    paymentMethod: 'UPI',
    upiApp: 'Google Pay',
    status: 'Successful',
    transactionId: 'TXN-984320984',
    monthYear: 'Jul 2026',
    receiptNumber: 'RCPT-483920'
  });

  // Create sample Complaint
  await Complaint.create({
    user: studentUser._id,
    student: studentRecord._id,
    roomNumber: '101',
    category: 'Electrical',
    title: 'AC cooling issue in Room 101',
    description: 'The AC compressor stops working after 15 minutes.',
    aiPriority: 'High',
    status: 'In Progress'
  });

  console.log('Database successfully seeded!');
  console.log('-------------------------------------------');
  console.log('Owner Login   -> Email: shiva@smartpg.com | Password: password123');
  console.log('Student Login -> Email: rahul@gmail.com   | Password: password123');
  console.log('-------------------------------------------');
  process.exit();
};

seedDatabase();
