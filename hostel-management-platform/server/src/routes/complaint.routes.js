const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  getAiInsights
} = require('../controllers/complaint.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, createComplaint);
router.get('/', protect, getComplaints);
router.put('/:id/status', protect, authorize('owner', 'staff'), updateComplaintStatus);
router.get('/ai-insights', protect, authorize('owner', 'staff'), getAiInsights);

module.exports = router;
