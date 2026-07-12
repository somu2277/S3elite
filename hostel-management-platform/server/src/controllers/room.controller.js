const Room = require('../models/Room');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().sort({ floor: 1, roomNumber: 1 });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private (Owner/Staff)
const createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, capacity, rentPerBed, type } = req.body;

    const existing = await Room.findOne({ roomNumber });
    if (existing) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNumber,
      floor: floor || 1,
      capacity: capacity || 3,
      rentPerBed: rentPerBed || 5500,
      type: type || 'Non-AC'
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Allocate student to room
// @route   POST /api/rooms/allocate
// @access  Private (Owner/Staff)
const allocateStudent = async (req, res) => {
  try {
    const { userId, roomId, bedNumber } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.occupiedBeds >= room.capacity) {
      return res.status(400).json({ message: 'Room is already at full capacity' });
    }

    let student = await Student.findOne({ user: userId });
    if (!student) {
      student = new Student({
        user: userId,
        room: room._id,
        roomNumber: room.roomNumber,
        bedNumber: bedNumber || (room.occupiedBeds + 1),
        rentAmount: room.rentPerBed
      });
    } else {
      student.room = room._id;
      student.roomNumber = room.roomNumber;
      student.bedNumber = bedNumber || (room.occupiedBeds + 1);
      student.rentAmount = room.rentPerBed;
    }

    await student.save();

    room.occupiedBeds += 1;
    if (room.occupiedBeds >= room.capacity) {
      room.status = 'Full';
    }
    await room.save();

    res.json({ message: 'Student successfully allocated to room', student, room });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard summary stats
// @route   GET /api/rooms/stats
// @access  Private
const getHostelStats = async (req, res) => {
  try {
    const rooms = await Room.find();
    const students = await Student.find().populate('user', 'name email phone');

    let totalCapacity = 0;
    let occupiedBeds = 0;
    let expectedRevenue = 0;

    rooms.forEach(r => {
      totalCapacity += r.capacity;
      occupiedBeds += r.occupiedBeds;
      expectedRevenue += r.occupiedBeds * r.rentPerBed;
    });

    const emptyBeds = totalCapacity - occupiedBeds;
    const occupancyPercentage = totalCapacity > 0 ? ((occupiedBeds / totalCapacity) * 100).toFixed(1) : 0;

    const paidCount = students.filter(s => s.paymentStatus === 'Paid').length;
    const pendingCount = students.filter(s => s.paymentStatus !== 'Paid').length;

    res.json({
      totalRooms: rooms.length,
      totalCapacity,
      occupiedBeds,
      emptyBeds,
      occupancyPercentage: Number(occupancyPercentage),
      expectedRevenue,
      studentStrength: students.length,
      paidCount,
      pendingCount,
      students
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRooms,
  createRoom,
  allocateStudent,
  getHostelStats
};
