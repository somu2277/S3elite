import React, { useState, useEffect } from 'react';
import {
  Users,
  BedDouble,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Search,
  Filter,
  RefreshCw,
  Building2,
  FileText,
  Clock,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  CreditCard,
  Edit3,
  Save,
  X,
  ExternalLink,
  MessageSquare,
  Wrench,
  TrendingUp,
  MapPin,
  Calendar,
  Briefcase,
  Sparkles,
  Download,
  Phone,
  Send,
  Eye,
  AlertCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import { realtimeBus } from '../utils/realtimeBus';
import AdminBedManagementDrawer from '../components/AdminBedManagementDrawer';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'matrix' | 'payments'
  const [filterFloor, setFilterFloor] = useState('All');
  const [paymentFilterTab, setPaymentFilterTab] = useState('All'); // 'All' | 'Pending' | 'Verified' | 'Overdue' | 'Today' | 'Monthly'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedBedDrawer, setSelectedBedDrawer] = useState(null);

  // Live MongoDB data states (NO DUMMY DATA)
  const [stats, setStats] = useState({
    totalStudents: 0,
    occupiedBeds: 0,
    vacantBeds: 0,
    reservedBeds: 0,
    totalBeds: 0,
    todaysRevenue: 0,
    monthlyRevenue: 0,
    expectedRevenue: 0,
    collectedRevenue: 0,
    pendingRevenue: 0,
    overdueStudents: 0,
    pendingPaymentsCount: 0,
    verifiedPaymentsCount: 0,
    pendingComplaintsCount: 0,
    resolvedComplaintsCount: 0
  });

  const [matrixBeds, setMatrixBeds] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [messSubscribers, setMessSubscribers] = useState([]);
  const [paymentVerifications, setPaymentVerifications] = useState([]);



  // Fetch all real-time data strictly from MongoDB API
  
  const adminToken = JSON.parse(localStorage.getItem('s3elite_admin'))?.token;

  const apiFetch = async (url, options = {}) => {
    const headers = { ...options.headers, Authorization: `Bearer ${adminToken}` };
    const response = await fetch(url, { ...options, headers });
    
    // Auto-logout if token is expired or invalid
    if (response.status === 401) {
      localStorage.removeItem('s3elite_admin');
      window.location.reload();
    }
    return response;
  };

  const fetchDashboardData = async (silent = false) => {

    if (!silent) setLoading(true);
    try {
      // 1. Fetch Real Stats
      const statsRes = await apiFetch('/api/admin/erp/stats');
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success && statsJson.data) {
          setStats(statsJson.data);
        }
      }

      // 2. Fetch Live Room Layout & Bed Matrix
      const matrixRes = await apiFetch('/api/admin/erp/matrix');
      if (matrixRes.ok) {
        const matrixJson = await matrixRes.json();
        if (matrixJson.success && Array.isArray(matrixJson.data)) {
          setMatrixBeds(matrixJson.data);
        }
      }

      // 3. Fetch Real Payments
      const payRes = await apiFetch('/api/admin/erp/payments');
      if (payRes.ok) {
        const payJson = await payRes.json();
        if (payJson.success && Array.isArray(payJson.data)) {
          setPayments(payJson.data);
        }
      }

      // 4. Fetch Booking Requests
      const bookRes = await apiFetch('/api/admin/erp/booking-requests');
      if (bookRes.ok) {
        const bookJson = await bookRes.json();
        if (bookJson.success && Array.isArray(bookJson.data)) {
          setBookingRequests(bookJson.data);
        }
      }

      // 5. Fetch Mess Subscribers
      const messRes = await apiFetch('/api/admin/erp/mess-subscribers');
      if (messRes.ok) {
        const messJson = await messRes.json();
        if (messJson.success && Array.isArray(messJson.data)) {
          setMessSubscribers(messJson.data);
        }
      }
      // 6. Fetch Payment Verifications
      const verifRes = await apiFetch('/api/admin/erp/payment-verifications');
      if (verifRes.ok) {
        const verifJson = await verifRes.json();
        if (verifJson.success && Array.isArray(verifJson.data)) {
          setPaymentVerifications(verifJson.data);
        }
      }
    } catch (err) {
      console.error('Error loading MongoDB data:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Socket.IO Real-Time live listener
  useEffect(() => {
    fetchDashboardData();

    // Connect to backend Socket.IO
    const socket = io();
    socket.on('ERP_EVENT', (data) => {
      console.log('[Socket.IO] Real-Time MongoDB update received:', data);
      fetchDashboardData(true);
    });

    // Also subscribe to local realtimeBus
    const unsubscribe = realtimeBus.subscribe(() => {
      fetchDashboardData(true);
    });

    return () => {
      socket.disconnect();
      unsubscribe();
    };
  }, []);



  // Payment Verification Actions
  const handleVerifyPayment = async (paymentId) => {
    try {
      const res = await apiFetch(`/api/admin/erp/payments/${paymentId}/verify`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchDashboardData(true);
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
    }
  };

  const handleRejectPayment = async (paymentId) => {
    try {
      const res = await apiFetch(`/api/admin/erp/payments/${paymentId}/reject`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchDashboardData(true);
      }
    } catch (err) {
      console.error('Error rejecting payment:', err);
    }
  };

  const handleVerifyApplicationPayment = async (type, id) => {
    setProcessingId(id);
    try {
      const apiType = type === 'PG Booking' ? 'Booking' : 'Mess';
      const res = await apiFetch(`/api/admin/erp/payment-verifications/${apiType}/${id}/verify`, { method: 'PUT' });
      if (res.ok) {
        fetchDashboardData(true);
      } else {
        const json = await res.json();
        alert(json.message || 'Error verifying payment');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectApplicationPayment = async (type, id) => {
    const reason = window.prompt("Enter rejection reason:");
    if (reason === null) return;
    
    setProcessingId(id);
    try {
      const apiType = type === 'PG Booking' ? 'Booking' : 'Mess';
      const res = await apiFetch(`/api/admin/erp/payment-verifications/${apiType}/${id}/reject`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        fetchDashboardData(true);
      } else {
        const json = await res.json();
        alert(json.message || 'Error rejecting payment');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenBedDrawer = async (bed) => {
    if (!bed.occupied && bed.reservationStatus !== 'Occupied') return;
    try {
      if (bed._id) {
        const res = await apiFetch(`/api/admin/erp/bed/${bed._id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSelectedBedDrawer(json.data);
            return;
          }
        }
      }
    } catch (err) {
      console.error('Error fetching full bed profile:', err);
    }
    // Fallback if fetch fails but bed is passed
    setSelectedBedDrawer(bed);
  };

  const handleApproveBooking = async (id) => {
    setProcessingId(id);
    try {
      const res = await apiFetch(`/api/admin/erp/booking-requests/${id}/approve`, { method: 'PUT' });
      if (res.ok) {
        fetchDashboardData(true);
      } else {
        const json = await res.json();
        alert(json.message || 'Error approving booking');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectBooking = async (id) => {
    setProcessingId(id);
    try {
      const res = await apiFetch(`/api/admin/erp/booking-requests/${id}/reject`, { method: 'PUT' });
      if (res.ok) {
        fetchDashboardData(true);
      } else {
        const json = await res.json();
        alert(json.message || 'Error rejecting booking');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateMessStatus = async (id, status) => {
    setProcessingId(id);
    try {
      const res = await apiFetch(`/api/admin/erp/mess-subscribers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchDashboardData(true);
      } else {
        const json = await res.json();
        alert(json.message || `Error updating status to ${status}`);
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setProcessingId(null);
    }
  };

  // Group real matrix beds by floor & room
  const groupedRooms = matrixBeds
    .filter((b) => filterFloor === 'All' || b.floorName === filterFloor)
    .reduce((acc, bed) => {
      if (!acc[bed.roomNumber]) {
        acc[bed.roomNumber] = {
          roomNumber: bed.roomNumber,
          floorName: bed.floorName || '1st Floor',
          beds: []
        };
      }
      acc[bed.roomNumber].beds.push(bed);
      return acc;
    }, {});

  // Real-time search filter
  const filteredRooms = Object.values(groupedRooms).filter((room) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchRoom = room.roomNumber.toLowerCase().includes(q);
    const matchBed = room.beds.some(
      (b) =>
        (b.studentName && b.studentName.toLowerCase().includes(q)) ||
        (b.phone && b.phone.includes(q)) ||
        (b.studentId && b.studentId.toLowerCase().includes(q)) ||
        (b.email && b.email.toLowerCase().includes(q))
    );
    return matchRoom || matchBed;
  });

  // Filtered Payments by tab & search
  const filteredPayments = payments.filter((p) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.studentName && p.studentName.toLowerCase().includes(q);
      const utrMatch = p.utrNumber && p.utrNumber.toLowerCase().includes(q);
      const roomMatch = p.roomNumber && p.roomNumber.toLowerCase().includes(q);
      if (!nameMatch && !utrMatch && !roomMatch) return false;
    }

    // Payment tab match
    if (paymentFilterTab === 'Pending') return p.verificationStatus === 'Pending Verification';
    if (paymentFilterTab === 'Verified') return p.verificationStatus === 'Verified';
    if (paymentFilterTab === 'Overdue') return p.status === 'Overdue' || p.verificationStatus === 'Rejected';
    if (paymentFilterTab === 'Today') {
      const todayStr = new Date().toISOString().slice(0, 10);
      return p.createdAt && p.createdAt.slice(0, 10) === todayStr;
    }
    return true;
  });

  // Filtered Booking Requests
  const filteredBookings = bookingRequests.filter((req) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = req.name && req.name.toLowerCase().includes(q);
    const phoneMatch = req.phone && req.phone.includes(q);
    const emailMatch = req.email && req.email.toLowerCase().includes(q);
    const roomMatch = req.preferredRoom && req.preferredRoom.toLowerCase().includes(q);
    return nameMatch || phoneMatch || emailMatch || roomMatch;
  });

  // Filtered Mess Subscribers
  const filteredMessSubscribers = messSubscribers.filter((sub) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = sub.name && sub.name.toLowerCase().includes(q);
    const phoneMatch = sub.phone && sub.phone.includes(q);
    const emailMatch = sub.email && sub.email.toLowerCase().includes(q);
    return nameMatch || phoneMatch || emailMatch;
  });

  // Status Badge Helper
  const renderPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Paid</span>;
      case 'Due Today':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Due Today</span>;
      case 'Due Tomorrow':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30">Due Tomorrow</span>;
      case 'Overdue':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Overdue</span>;
      case 'Advance Paid':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Advance Paid</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">{status || 'Pending'}</span>;
    }
  };

  // Bed color helper based on MongoDB real status
  const getBedCardClass = (bed) => {
    if (bed.occupied || bed.reservationStatus === 'Occupied') {
      return 'bg-rose-500/15 border-rose-500/50 hover:bg-rose-500/25 text-rose-200'; // Red = Occupied
    }
    if (bed.reservationStatus === 'Reserved') {
      return 'bg-amber-500/15 border-amber-500/50 hover:bg-amber-500/25 text-amber-200'; // Yellow = Reserved
    }
    if (bed.reservationStatus === 'Maintenance') {
      return 'bg-slate-800 border-slate-700 text-slate-400'; // Grey = Maintenance
    }
    return 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300'; // Green = Available
  };

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 p-6 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>

          <h1 className="text-3xl font-black tracking-tight mt-2 text-white flex items-center gap-3">
            S3 Elite PG Enterprise ERP
          </h1>

        </div>

        {/* Global Search & Refresh */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student, room, bed, UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sync DB
          </button>
        </div>
      </div>

      {/* Real-Time Dashboard KPI Cards (14 Metrics Strictly from MongoDB) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total Students</p>
          <p className="text-2xl font-black text-white mt-1">{stats.totalStudents}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-rose-400 uppercase">Occupied Beds</p>
          <p className="text-2xl font-black text-rose-300 mt-1">{stats.occupiedBeds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Vacant Beds</p>
          <p className="text-2xl font-black text-emerald-300 mt-1">{stats.vacantBeds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-amber-400 uppercase">Reserved Beds</p>
          <p className="text-2xl font-black text-amber-300 mt-1">{stats.reservedBeds}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-indigo-400 uppercase">Today's Revenue</p>
          <p className="text-2xl font-black text-indigo-300 mt-1">₹{stats.todaysRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Collected Revenue</p>
          <p className="text-2xl font-black text-emerald-300 mt-1">₹{stats.collectedRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-rose-400 uppercase">Overdue Students</p>
          <p className="text-2xl font-black text-rose-400 mt-1">{stats.overdueStudents}</p>
        </div>
      </div>

      {/* Additional ERP Row Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Expected Revenue</p>
          <p className="text-xl font-black text-white mt-1">₹{stats.expectedRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-amber-400 uppercase">Pending Revenue</p>
          <p className="text-xl font-black text-amber-300 mt-1">₹{stats.pendingRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Monthly Revenue</p>
          <p className="text-xl font-black text-white mt-1">₹{stats.monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-amber-400 uppercase">Pending UTRs</p>
          <p className="text-xl font-black text-amber-300 mt-1">{stats.pendingPaymentsCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Verified UTRs</p>
          <p className="text-xl font-black text-emerald-300 mt-1">{stats.verifiedPaymentsCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-orange-400 uppercase">Open Complaints</p>
          <p className="text-xl font-black text-orange-300 mt-1">{stats.pendingComplaintsCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80">
          <p className="text-[11px] font-bold text-emerald-400 uppercase">Resolved Complaints</p>
          <p className="text-xl font-black text-emerald-300 mt-1">{stats.resolvedComplaintsCount}</p>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Real-Time Room Matrix & Beds ({matrixBeds.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'payments'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Live Payment Ledger ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'bookings'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Booking Requests ({filteredBookings.filter(r => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('mess')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'mess'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Monthly Mess ({filteredMessSubscribers.filter(r => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('payment-verifications')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'payment-verifications'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Payment Verification ({paymentVerifications.filter(p => p.paymentStatus === 'Pending Verification').length})
        </button>
      </div>

      {/* TAB 1: REAL-TIME ROOM & BED MANAGEMENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Floor Legend & Filters */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400">Layout Floor:</span>
              {['All', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'].map((floor) => (
                <button
                  key={floor}
                  onClick={() => setFilterFloor(floor)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterFloor === floor
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Green: Available
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Red: Occupied
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Yellow: Reserved
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600"></span> Grey: Maintenance
              </span>
            </div>
          </div>

          {/* Rooms Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredRooms.map((room) => (
              <div
                key={room.roomNumber}
                className="p-5 rounded-2xl bg-[#090e18] border border-slate-800/80 shadow-xl space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-white">Room {room.roomNumber}</h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                      {room.floorName}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300">
                    {room.beds.filter((b) => b.occupied).length} / {room.beds.length} Occupied
                  </span>
                </div>

                {/* Beds inside Room */}
                <div className="grid grid-cols-2 gap-2.5">
                  {room.beds.map((bed) => {
                    const cardStyle = getBedCardClass(bed);
                    return (
                      <div
                        key={bed._id}
                        onClick={() => handleOpenBedDrawer(bed)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-24 ${cardStyle}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold">Cot #{bed.bedNumber}</span>
                          <BedDouble className="w-4 h-4 opacity-80" />
                        </div>
                        <div>
                          <p className="text-xs font-black truncate">
                            {bed.occupied ? bed.studentName || 'Occupied' : 'Vacant Cot'}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] font-semibold uppercase opacity-80">
                              {bed.occupied ? 'Occupied' : 'Available'}
                            </span>
                            <span className="text-[10px] font-extrabold opacity-90">
                              ₹{bed.rentPerBed}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCTION PAYMENT MANAGEMENT SYSTEM */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Payment Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'Pending', 'Verified', 'Overdue', 'Today', 'Monthly'].map((tab) => (
              <button
                key={tab}
                onClick={() => setPaymentFilterTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  paymentFilterTab === tab
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'All' ? 'All Payments' : `${tab} Payments`}
              </button>
            ))}
          </div>

          {/* Payments Table */}
          <div className="rounded-2xl bg-[#090e18] border border-slate-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-extrabold uppercase text-slate-400">
                    <th className="p-4">Student</th>
                    <th className="p-4">Room / Bed</th>
                    <th className="p-4">Monthly Rent</th>
                    <th className="p-4">Month</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">UTR Number</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
                  {filteredPayments.map((pay) => (
                    <tr key={pay._id} className="hover:bg-slate-900/40 transition-all">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">
                            {pay.studentName?.slice(0, 2)?.toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <p className="font-extrabold text-white">{pay.studentName}</p>
                            <p className="text-[11px] text-slate-400">{pay.paymentMethod || 'UPI'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-indigo-400">
                        Room {pay.roomNumber} • Cot #{pay.bedNumber}
                      </td>
                      <td className="p-4 font-extrabold text-white">₹{pay.amount?.toLocaleString()}</td>
                      <td className="p-4 text-slate-300">{pay.monthYear || 'July 2026'}</td>
                      <td className="p-4 text-slate-400">05 August 2026</td>
                      <td className="p-4">{renderPaymentStatusBadge(pay.status || 'Paid')}</td>
                      <td className="p-4 font-mono text-slate-300 font-bold">{pay.utrNumber}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            pay.verificationStatus === 'Verified'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : pay.verificationStatus === 'Rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {pay.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {pay.verificationStatus !== 'Verified' && (
                            <button
                              onClick={() => handleVerifyPayment(pay._id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all"
                            >
                              Verify
                            </button>
                          )}
                          {pay.verificationStatus !== 'Rejected' && (
                            <button
                              onClick={() => handleRejectPayment(pay._id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-[11px] transition-all"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Sending reminder / WhatsApp notification to ${pay.studentName}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                            title="Send WhatsApp Reminder"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => alert(`Downloading official PDF Receipt ${pay.receiptNumber || 'REC-2026'}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                            title="Download Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING REQUESTS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="glass-card overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant Name</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Requested Bed</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredBookings.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{req.name}</div>
                        <div className="text-xs text-slate-400">{req.collegeCompany || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-slate-300">{req.phone}</div>
                        <div className="text-slate-500">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-indigo-400">Room {req.preferredRoom}</div>
                        <div className="text-xs text-slate-400">Cot #{req.preferredBed}</div>
                      </td>
                      <td className="p-4">
                        {req.status === 'Pending' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Pending</span>}
                        {req.status === 'Approved' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Approved</span>}
                        {req.status === 'Rejected' && <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">Rejected</span>}
                      </td>
                      <td className="p-4 text-right">
                        {req.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApproveBooking(req._id)}
                              disabled={processingId === req._id}
                              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold border ${
                                processingId === req._id ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/30'
                              }`}
                            >
                              {processingId === req._id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectBooking(req._id)}
                              disabled={processingId === req._id}
                              className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold border ${
                                processingId === req._id ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' : 'bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/30'
                              }`}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                        No booking requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MONTHLY MESS (EXTERNAL SUBSCRIBERS) */}
      {activeTab === 'mess' && (
        <div className="space-y-6">
          {/* Quick Metrics for Mess */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800/80 shadow-md">
              <p className="text-[11px] font-bold text-slate-400 uppercase flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Total Applications</p>
              <p className="text-xl font-black text-white mt-1">{filteredMessSubscribers.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800/80 shadow-md">
              <p className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Active Subscribers</p>
              <p className="text-xl font-black text-emerald-300 mt-1">{filteredMessSubscribers.filter(s => s.status === 'Active').length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800/80 shadow-md">
              <p className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Pending Approval</p>
              <p className="text-xl font-black text-amber-300 mt-1">{filteredMessSubscribers.filter(s => s.status === 'Pending').length}</p>
            </div>
            <div className="p-4 rounded-xl bg-[#090e18] border border-slate-800/80 shadow-md">
              <p className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Inactive / Cancelled</p>
              <p className="text-xl font-black text-rose-300 mt-1">{filteredMessSubscribers.filter(s => s.status === 'Inactive').length}</p>
            </div>
          </div>

          <div className="glass-card overflow-hidden border border-slate-800">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/50">
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Applicant Name</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan & Date</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredMessSubscribers.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{req.name}</div>
                        <div className="text-[11px] text-slate-400 font-bold uppercase mt-0.5">{req.mealPreference} • {req.occupation}</div>
                        <div className="text-[10px] text-slate-500">{req.collegeCompany || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-xs">
                        <div className="text-slate-300 flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {req.phone}</div>
                        <div className="text-slate-500 mt-1 truncate max-w-[150px]">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-indigo-400">{req.plan}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Starts: {new Date(req.startDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        {req.status === 'Pending' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">Pending</span>}
                        {req.status === 'Active' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">Active</span>}
                        {req.status === 'Inactive' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">Inactive</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {req.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateMessStatus(req._id, 'Active')}
                                disabled={processingId === req._id}
                                className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/30'}`}
                              >
                                Activate
                              </button>
                              <button
                                onClick={() => handleUpdateMessStatus(req._id, 'Inactive')}
                                disabled={processingId === req._id}
                                className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/30'}`}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {req.status === 'Active' && (
                            <button
                              onClick={() => handleUpdateMessStatus(req._id, 'Inactive')}
                              disabled={processingId === req._id}
                              className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white border-amber-500/30'}`}
                            >
                              Pause/Cancel
                            </button>
                          )}
                          {req.status === 'Inactive' && (
                            <button
                              onClick={() => handleUpdateMessStatus(req._id, 'Active')}
                              disabled={processingId === req._id}
                              className={`px-2.5 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-800 text-slate-500 border-slate-700' : 'bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border-blue-500/30'}`}
                            >
                              Re-Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredMessSubscribers.length === 0 && (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-500 text-sm">
                        No external mess subscribers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENT VERIFICATIONS */}
      {activeTab === 'payment-verifications' && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-black text-amber-500">Pending Payment Verifications</h2>
          </div>
          
          <div className="grid gap-4">
            {paymentVerifications.filter(p => p.paymentStatus === 'Pending Verification').map((req) => (
              <div key={req._id} className="glass-card p-5 border border-slate-800 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{req.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {req.applicationType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      {req.applicationId}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Contact</p>
                      <p className="text-sm font-semibold text-slate-300 flex items-center gap-1"><Phone className="w-3 h-3"/> {req.phone}</p>
                    </div>
                    {req.applicationType === 'PG Booking' && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Room / Cot</p>
                        <p className="text-sm font-semibold text-slate-300">Room {req.preferredRoom}, Cot {req.preferredBed}</p>
                      </div>
                    )}
                    {req.applicationType === 'Monthly Mess' && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Mess Plan</p>
                        <p className="text-sm font-semibold text-slate-300">{req.plan}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">UTR Number</p>
                      <p className="text-sm font-black text-emerald-400">{req.utrNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Screenshot</p>
                      <a href={req.paymentScreenshot} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 mt-1 font-semibold">
                        <ExternalLink className="w-3 h-3" /> View Image
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => handleVerifyApplicationPayment(req.applicationType, req._id)}
                    disabled={processingId === req._id}
                    className="w-full px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex justify-center items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Verify & Approve
                  </button>
                  <button
                    onClick={() => handleRejectApplicationPayment(req.applicationType, req._id)}
                    disabled={processingId === req._id}
                    className="w-full px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg flex justify-center items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {paymentVerifications.filter(p => p.paymentStatus === 'Pending Verification').length === 0 && (
              <div className="text-center p-12 glass-card border border-slate-800 rounded-2xl">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-slate-400 text-sm">No pending payments to verify.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Bed Management Drawer */}
      {selectedBedDrawer && (
        <AdminBedManagementDrawer
          bedId={selectedBedDrawer._id}
          isOpen={!!selectedBedDrawer}
          onClose={() => setSelectedBedDrawer(null)}
          onUpdateSuccess={() => fetchDashboardData(true)}
        />
      )}
    </div>
  );
};

export default OwnerDashboard;
