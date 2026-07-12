const Complaint = require('../models/Complaint');
const Student = require('../models/Student');
const Room = require('../models/Room');
const Payment = require('../models/Payment');

// AI Helper: Automatically classify priority based on keywords
const classifyPriority = (title, description, category) => {
  const text = (title + ' ' + description).toLowerCase();
  if (
    text.includes('short circuit') ||
    text.includes('fire') ||
    text.includes('water leak') ||
    text.includes('flooding') ||
    text.includes('power cut') ||
    text.includes('broken lock')
  ) {
    return 'High';
  }
  if (
    text.includes('wifi') ||
    text.includes('internet') ||
    text.includes('fan') ||
    text.includes('food') ||
    category === 'Electrical' ||
    category === 'Plumbing'
  ) {
    return 'Medium';
  }
  return 'Low';
};

// @desc    Submit a new complaint
// @route   POST /api/complaints
// @access  Private (Student/Staff/Owner)
const createComplaint = async (req, res) => {
  try {
    const { title, description, category, roomNumber } = req.body;

    const student = await Student.findOne({ user: req.user._id });
    const assignedRoomNumber = roomNumber || (student ? student.roomNumber : 'General');
    const aiPriority = classifyPriority(title, description, category);

    const complaint = await Complaint.create({
      user: req.user._id,
      student: student ? student._id : null,
      roomNumber: assignedRoomNumber,
      category: category || 'Other',
      title,
      description,
      aiPriority,
      status: 'Open'
    });

    res.status(201).json({
      message: 'Complaint submitted and AI categorized',
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.user = req.user._id;
    }

    const complaints = await Complaint.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Owner/Staff)
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get AI Business Insights & Analytics
// @route   GET /api/complaints/ai-insights
// @access  Private (Owner/Staff)
const getAiInsights = async (req, res) => {
  try {
    const rooms = await Room.find();
    const students = await Student.find().populate('user', 'name');
    const complaints = await Complaint.find();

    let totalCapacity = 0;
    let occupiedBeds = 0;
    let monthlyExpectedRevenue = 0;

    rooms.forEach(r => {
      totalCapacity += r.capacity;
      occupiedBeds += r.occupiedBeds;
      monthlyExpectedRevenue += r.occupiedBeds * r.rentPerBed;
    });

    const occupancyRate = totalCapacity > 0 ? ((occupiedBeds / totalCapacity) * 100).toFixed(1) : 0;
    const overdueStudents = students.filter(s => s.paymentStatus === 'Overdue');
    const highPriorityComplaints = complaints.filter(c => c.aiPriority === 'High' && c.status !== 'Resolved').length;

    // AI-generated recommendations & predictions
    const recommendations = [
      occupancyRate < 80
        ? `Current occupancy is ${occupancyRate}%. Consider offering early-bird booking discounts for upcoming college semesters to boost bed allocation.`
        : `High occupancy detected (${occupancyRate}%). Your pricing model can be optimized by +5% for remaining AC rooms.`,
      overdueStudents.length > 0
        ? `AI Risk Analysis: ${overdueStudents.length} student(s) have overdue rent. Automated WhatsApp reminder triggers are recommended immediately.`
        : `Excellent collection rate! No overdue rent defaulters currently recorded.`,
      highPriorityComplaints > 0
        ? `Action Required: ${highPriorityComplaints} high-priority infrastructure complaint(s) require urgent maintenance intervention.`
        : `Facility infrastructure health is stable with zero unresolved high-priority complaints.`
    ];

    res.json({
      occupancyRate: Number(occupancyRate),
      monthlyExpectedRevenue,
      overdueCount: overdueStudents.length,
      highPriorityComplaints,
      recommendations,
      predictedNextMonthRevenue: Math.round(monthlyExpectedRevenue * 1.05)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaintStatus,
  getAiInsights
};
