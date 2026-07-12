require('dotenv').config();
const mongoose = require('mongoose');
const Bed = require('./src/models/Bed');
const Room = require('./src/models/Room');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const bedRes = await Bed.updateMany({ floorName: 'Special Block' }, { $set: { floorName: 'Ground Floor' } });
  console.log('Beds updated:', bedRes);
  const roomRes = await Room.updateMany({ floorName: 'Special Block' }, { $set: { floorName: 'Ground Floor' } });
  console.log('Rooms updated:', roomRes);
  process.exit(0);
}).catch(console.error);
