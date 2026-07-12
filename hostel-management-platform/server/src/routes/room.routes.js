const express = require('express');
const router = express.Router();
const { getRooms, createRoom, allocateStudent, getHostelStats } = require('../controllers/room.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/', protect, getRooms);
router.post('/', protect, authorize('owner', 'staff'), createRoom);
router.post('/allocate', protect, authorize('owner', 'staff'), allocateStudent);
router.get('/stats', protect, getHostelStats);

module.exports = router;
