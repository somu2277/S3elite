const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    bedNumber: {
      type: Number,
      required: true
    },
    roomNumber: {
      type: String,
      required: true,
      index: true
    },
    floorName: {
      type: String,
      default: '1st Floor'
    },
    occupied: {
      type: Boolean,
      default: false
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null
    },
    studentName: {
      type: String,
      default: null
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    studentId: {
      type: String,
      default: null
    },
    admissionNumber: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: '+91 98765 43210'
    },
    whatsappNumber: {
      type: String,
      default: '+91 98765 43210'
    },
    email: {
      type: String,
      default: null
    },
    fatherName: {
      type: String,
      default: 'Rajesh Sharma'
    },
    motherName: {
      type: String,
      default: 'Sunita Sharma'
    },
    emergencyContact: {
      type: String,
      default: '+91 91234 56789'
    },
    currentAddress: {
      type: String,
      default: ''
    },
    permanentAddress: {
      type: String,
      default: '402, Green Avenue, Kurnool, AP - 518002'
    },
    collegeName: {
      type: String,
      default: 'IIT Hyderabad'
    },
    companyName: {
      type: String,
      default: 'TechSolutions India Pvt Ltd'
    },
    occupation: {
      type: String,
      default: 'Software Engineer'
    },
    bloodGroup: {
      type: String,
      default: 'O+'
    },
    aadhaarNumber: {
      type: String,
      default: 'XXXX-XXXX-4829'
    },
    admissionDate: {
      type: String,
      default: '15 July 2026'
    },
    joiningDate: {
      type: String,
      default: '15 July 2026'
    },
    duration: {
      type: String,
      default: '11 Months'
    },
    rentPerBed: {
      type: Number,
      default: 6000
    },
    discount: {
      type: Number,
      default: 0
    },
    securityDeposit: {
      type: Number,
      default: 5000
    },
    pendingAmount: {
      type: Number,
      default: 0
    },
    lastPaymentDate: {
      type: String,
      default: '05 July 2026'
    },
    nextDueDate: {
      type: String,
      default: '05 August 2026'
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Due Today', 'Due Tomorrow', 'Overdue', 'Advance Paid', 'Pending Payment'],
      default: 'Paid'
    },
    reservationStatus: {
      type: String,
      enum: ['Available', 'Reserved', 'Occupied', 'Maintenance'],
      default: 'Available'
    },
    maintenanceStatus: {
      type: String,
      enum: ['Functional', 'Under Repair'],
      default: 'Functional'
    },
    documentsUploaded: [
      {
        name: String,
        type: String,
        url: String,
        uploadedAt: Date
      }
    ],
    notes: {
      type: String,
      default: 'Standard 11-month residential agreement signed. Biometric access enabled.'
    },
    messEnabled: {
      type: Boolean,
      default: false
    },
    messCharges: {
      type: Number,
      default: 2500
    },
    messStartDate: {
      type: Date
    },
    messRenewalDate: {
      type: Date
    },
    activityTimeline: [
      {
        date: String,
        title: String,
        description: String,
        timestamp: Date
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Bed', bedSchema);
