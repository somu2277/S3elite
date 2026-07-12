require('dotenv').config();
const mongoose = require('mongoose');
const Room = require('../models/Room');
const Bed = require('../models/Bed');
const Student = require('../models/Student');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

const ATLAS_URI = process.env.MONGODB_URI || "mongodb+srv://somu:somu123@cluster0.uvbgsy8.mongodb.net/s3elite_pg_db?retryWrites=true&w=majority";

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB Atlas Cluster...');
    const conn = await mongoose.connect(ATLAS_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`Connected to MongoDB Atlas: ${conn.connection.host} (${conn.connection.name})`);

    // Clear existing Admin ERP beds & rooms to re-seed clean live matrix
    await Bed.deleteMany({});
    await Room.deleteMany({});
    await Payment.deleteMany({});
    await Complaint.deleteMany({});

    console.log('Seeding real database Room Matrix & Bed allocations...');

    const floorLayouts = [
      { floorName: 'Ground Floor', rooms: ['S01', 'S02'], bedsPerRoom: 6, rent: 6500 },
      { floorName: '1st Floor', rooms: ['S11', 'S12', 'S13', 'S14', 'S15', 'S16', 'S17', 'S18'], bedsPerRoom: 4, rent: 6000 },
      { floorName: '2nd Floor', rooms: ['S21', 'S22', 'S23', 'S24', 'S25', 'S26', 'S27', 'S28'], bedsPerRoom: 4, rent: 5800 },
      { floorName: '3rd Floor', rooms: ['S31', 'S32', 'S33', 'S34'], bedsPerRoom: 4, rent: 5500 }
    ];

    const sampleResidents = [
      { name: 'Rahul Sharma', phone: '+91 98765 43210', company: 'Infosys Ltd', occupation: 'Software Engineer' },
      { name: 'Aditya Verma', phone: '+91 98111 22334', company: 'TCS Innovation Labs', occupation: 'System Analyst' },
      { name: 'Karthik Reddy', phone: '+91 94400 11223', company: 'Wipro Technologies', occupation: 'Cloud Architect' },
      { name: 'Siddharth Rao', phone: '+91 99887 76655', company: 'Tech Mahindra', occupation: 'DevOps Engineer' },
      { name: 'Vikram Singh', phone: '+91 90011 22334', company: 'Amazon India', occupation: 'SDE-1' },
      { name: 'Pranav Nair', phone: '+91 97766 55443', company: 'Accenture', occupation: 'Consultant' },
      { name: 'Rohan Gupta', phone: '+91 91234 56780', company: 'Capgemini', occupation: 'Associate' },
      { name: 'Arjun Das', phone: '+91 93322 11009', company: 'IIT Graduate Student', occupation: 'PhD Scholar' }
    ];

    let residentIdx = 0;
    const createdBeds = [];

    for (const floor of floorLayouts) {
      for (const roomNum of floor.rooms) {
        const roomDoc = await Room.create({
          roomNumber: roomNum,
          floor: floor.floorName === 'Ground Floor' ? 0 : parseInt(floor.floorName),
          capacity: floor.bedsPerRoom,
          rentPerBed: floor.rent,
          type: 'AC',
          status: 'Available'
        });

        for (let c = 1; c <= floor.bedsPerRoom; c++) {
          // Make ~40% of beds occupied with real profiles
          const isOccupied = (residentIdx < sampleResidents.length) && (c <= 2);
          const residentInfo = isOccupied ? sampleResidents[residentIdx % sampleResidents.length] : null;
          if (isOccupied) residentIdx++;

          const bedDoc = await Bed.create({
            bedNumber: c,
            roomNumber: roomNum,
            floorName: floor.floorName,
            occupied: isOccupied,
            studentName: residentInfo ? residentInfo.name : null,
            reservationStatus: isOccupied ? 'Occupied' : 'Available',
            rentPerBed: floor.rent
          });
          createdBeds.push(bedDoc);
        }
      }
    }

    console.log(`Successfully seeded ${createdBeds.length} beds across all floors!`);

    // Seed real UTR Payment records
    console.log('Seeding live MongoDB UTR Payment Ledger...');
    const dummyUser = await User.findOne() || await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@gmail.com',
      password: 'hashedpassword123',
      role: 'student',
      phone: '9876543210'
    });

    await Payment.create([
      {
        student: dummyUser._id,
        user: dummyUser._id,
        amount: 6000,
        roomNumber: 'S11',
        bedNumber: 1,
        paymentMethod: 'UPI',
        upiApp: 'Google Pay',
        utrNumber: '318294019283',
        transactionId: 'TXN_2026_0701_01',
        verificationStatus: 'Verified',
        status: 'Successful',
        monthYear: 'July 2026',
        receiptNumber: 'REC-202607-0001'
      },
      {
        student: dummyUser._id,
        user: dummyUser._id,
        amount: 6000,
        roomNumber: 'S12',
        bedNumber: 2,
        paymentMethod: 'UPI',
        upiApp: 'PhonePe',
        utrNumber: '419283749102',
        transactionId: 'TXN_2026_0703_02',
        verificationStatus: 'Pending Verification',
        status: 'Successful',
        monthYear: 'July 2026',
        receiptNumber: 'REC-202607-0002'
      },
      {
        student: dummyUser._id,
        user: dummyUser._id,
        amount: 5800,
        roomNumber: 'S21',
        bedNumber: 1,
        paymentMethod: 'UPI',
        upiApp: 'Paytm',
        utrNumber: '510293847102',
        transactionId: 'TXN_2026_0705_03',
        verificationStatus: 'Verified',
        status: 'Successful',
        monthYear: 'July 2026',
        receiptNumber: 'REC-202607-0003'
      }
    ]);

    // Seed real complaints
    await Complaint.create([
      {
        user: dummyUser._id,
        roomNumber: 'S11',
        category: 'Electrical',
        title: 'Air Conditioner Cooling Optimization',
        description: 'AC filter cleaning required for Room S11.',
        aiPriority: 'High',
        status: 'In Progress'
      },
      {
        user: dummyUser._id,
        roomNumber: 'S14',
        category: 'Internet',
        title: 'Wi-Fi Extender Signal Calibration',
        description: 'Requesting mesh repeater check on 1st floor corridor.',
        aiPriority: 'Medium',
        status: 'Open'
      }
    ]);

    console.log('MongoDB Atlas ERP database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding MongoDB Atlas:', err.message);
    process.exit(1);
  }
};

seedDatabase();
