const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Room = require('../models/Room');
const Bed = require('../models/Bed');

const roomMatrix = [
  // Ground Floor
  { floor: 0, floorName: 'Ground Floor', roomNumber: 'S01', capacity: 6, rentPerBed: 5500 },
  { floor: 0, floorName: 'Ground Floor', roomNumber: 'S02', capacity: 6, rentPerBed: 5500 },
  
  // 1st Floor
  { floor: 1, floorName: '1st Floor', roomNumber: 'S11', capacity: 4, rentPerBed: 6000 },
  { floor: 1, floorName: '1st Floor', roomNumber: 'S12', capacity: 4, rentPerBed: 6000 },
  { floor: 1, floorName: '1st Floor', roomNumber: 'S13', capacity: 4, rentPerBed: 6000 },
  { floor: 1, floorName: '1st Floor', roomNumber: 'S14', capacity: 4, rentPerBed: 6000 },
  { floor: 1, floorName: '1st Floor', roomNumber: 'S15', capacity: 5, rentPerBed: 5500 },
  { floor: 1, floorName: '1st Floor', roomNumber: 'S16', capacity: 5, rentPerBed: 5500 },
  { floor: 1, floorName: '1st Floor', roomNumber: 'S17', capacity: 5, rentPerBed: 5500 },
  { floor: 1, floorName: '1st Floor', roomNumber: 'S18', capacity: 5, rentPerBed: 5500 },
  
  // 2nd Floor
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S21', capacity: 4, rentPerBed: 6000 },
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S22', capacity: 4, rentPerBed: 6000 },
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S23', capacity: 4, rentPerBed: 6000 },
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S24', capacity: 4, rentPerBed: 6000 },
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S25', capacity: 5, rentPerBed: 5500 },
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S26', capacity: 5, rentPerBed: 5500 },
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S27', capacity: 5, rentPerBed: 5500 },
  { floor: 2, floorName: '2nd Floor', roomNumber: 'S28', capacity: 5, rentPerBed: 5500 },
  
  // 3rd Floor
  { floor: 3, floorName: '3rd Floor', roomNumber: 'S31', capacity: 4, rentPerBed: 6000 },
  { floor: 3, floorName: '3rd Floor', roomNumber: 'S32', capacity: 4, rentPerBed: 6000 },
  { floor: 3, floorName: '3rd Floor', roomNumber: 'S33', capacity: 5, rentPerBed: 5500 },
  { floor: 3, floorName: '3rd Floor', roomNumber: 'S34', capacity: 5, rentPerBed: 5500 },
  
  // Special Block
  { floor: 4, floorName: 'Special Block', roomNumber: 'S01', capacity: 6, rentPerBed: 5500 },
  { floor: 4, floorName: 'Special Block', roomNumber: 'S02', capacity: 6, rentPerBed: 5500 }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    console.log('Wiping existing Rooms and Beds...');
    await Room.deleteMany({});
    await Bed.deleteMany({});
    console.log('Successfully wiped existing records.');

    console.log('Inserting new room matrix...');
    for (const roomData of roomMatrix) {
      // Create Room
      const newRoom = await Room.create({
        roomNumber: roomData.roomNumber,
        floor: roomData.floor,
        capacity: roomData.capacity,
        rentPerBed: roomData.rentPerBed,
        status: 'Available',
        type: 'Non-AC'
      });

      // Create Beds for this Room
      const bedsToInsert = [];
      for (let i = 1; i <= roomData.capacity; i++) {
        bedsToInsert.push({
          bedNumber: i,
          roomNumber: roomData.roomNumber,
          floorName: roomData.floorName,
          occupied: false,
          rentPerBed: roomData.rentPerBed,
          reservationStatus: 'Available',
          maintenanceStatus: 'Functional'
        });
      }
      
      await Bed.insertMany(bedsToInsert);
      console.log(`Created Room ${roomData.roomNumber} with ${roomData.capacity} beds.`);
    }

    console.log('Room Matrix successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
