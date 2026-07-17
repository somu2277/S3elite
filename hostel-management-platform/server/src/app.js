const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const authRoutes = require('./routes/auth.routes');
const adminAuthRoutes = require('./routes/adminAuth.routes');
const adminERPRoutes = require('./routes/adminERP.routes');
const publicRoutes = require('./routes/public.routes');
const roomRoutes = require('./routes/room.routes');
const paymentRoutes = require('./routes/payment.routes');
const complaintRoutes = require('./routes/complaint.routes');
const startPaymentReminderJobs = require('./jobs/paymentReminder.job');

const uploadRoutes = require('./routes/upload.routes');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize automated rent reminder scheduler
startPaymentReminderJobs();

const { protect, authorize } = require('./middleware/auth.middleware');


// API Routes
app.use('/api/public', publicRoutes);
app.use('/api/public', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

// Protected Admin Routes (Strict RBAC)
app.use('/api/admin/erp', protect, authorize('admin'), adminERPRoutes);
app.use('/api/admin', protect, authorize('admin'), adminERPRoutes);
app.use('/api/rooms', protect, authorize('admin'), roomRoutes);
app.use('/api/payments', protect, authorize('admin'), paymentRoutes);
app.use('/api/complaints', protect, authorize('admin'), complaintRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Smart AI Hostel Management API is running',
    ownerContact: {
      name: 'Shiva',
      role: 'PG / Hostel Owner',
      phone: '9494211015',
      coordinates: '15.7724378865698, 78.05908726789515'
    }
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
