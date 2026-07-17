const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Room = require('../models/Room');
const Bed = require('../models/Bed');

dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/s3elite';

const layout = [
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
  { floor: 3, floorName: '3rd Floor', roomNumber: 'S34', capacity: 5, rentPerBed: 5500 }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('Connected.');

    console.log('Clearing existing Room and Bed collections...');
    await Room.deleteMany({});
    await Bed.deleteMany({});
    console.log('Cleared.');

    console.log('Seeding structural layout...');
    
    let totalCotsCreated = 0;
    
    for (const data of layout) {
      const room = await Room.create({
        roomNumber: data.roomNumber,
        floor: data.floor,
        floorName: data.floorName,
        capacity: data.capacity,
        rentPerBed: data.rentPerBed
      });

      for (let i = 1; i <= data.capacity; i++) {
        await Bed.create({
          bedNumber: i,
          roomNumber: room.roomNumber,
          floorName: room.floorName,
          rentPerBed: room.rentPerBed
        });
        totalCotsCreated++;
      }
    }
    
    console.log(`Successfully seeded ${layout.length} rooms and ${totalCotsCreated} cots exactly as requested!`);
    
  } catch (error) {
    console.error('Error seeding DB:', error);
  } finally {
    mongoose.disconnect();
  }
}

seedDatabase();
