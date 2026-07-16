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
    const socket = io({ transports: ['polling'] });
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
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-textMuted border border-borderLight">{status || 'Pending'}</span>;
    }
  };

  // Bed color helper based on MongoDB real status
  const getBedCardClass = (bed) => {
    if (bed.occupied || bed.reservationStatus === 'Occupied') {
      return 'bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700 shadow-sm'; // Red = Occupied
    }
    if (bed.reservationStatus === 'Reserved') {
      return 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700 shadow-sm'; // Yellow = Reserved
    }
    if (bed.reservationStatus === 'Maintenance') {
      return 'bg-slate-100 border-slate-200 text-slate-500 shadow-sm'; // Grey = Maintenance
    }
    return 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 shadow-sm'; // Green = Available
  };

  return (
    <div className="min-h-screen bg-bgLight text-textDark pb-12">
      {/* Sticky White Navbar */}
      <div className="sticky top-0 z-40 bg-white border-b border-borderLight shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-textDark flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-primary shadow-sm">
              <Building2 className="w-4 h-4" />
            </div>
            S3 Elite PG <span className="text-primary">Enterprise ERP</span>
          </h1>
        </div>

        {/* Global Search & Refresh */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search student, room, bed, UTR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-borderLight text-xs text-textDark placeholder:text-textMuted focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-borderLight hover:bg-slate-50 text-xs font-bold transition-all shadow-sm text-textDark hover:-translate-y-0.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
          
          <div className="hidden md:flex items-center gap-3 pl-4 border-l border-borderLight">
            <div className="text-right">
              <p className="text-xs font-bold text-textDark">Admin User</p>
              <p className="text-[10px] font-bold text-primary">ERP Manager</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-borderLight flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-textMuted" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Real-Time Dashboard KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase">Total Students</p>
              <Users className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-textDark">{stats.totalStudents}</p>
            <p className="text-[9px] text-emerald-500 font-bold mt-1">✓ Active</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase">Occupied Beds</p>
              <BedDouble className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-rose-500">{stats.occupiedBeds}</p>
            <p className="text-[9px] text-textMuted font-bold mt-1">Out of {stats.totalBeds}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase">Vacant Beds</p>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-emerald-500">{stats.vacantBeds}</p>
            <p className="text-[9px] text-textMuted font-bold mt-1">Ready to book</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase">Reserved</p>
              <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-amber-500">{stats.reservedBeds}</p>
            <p className="text-[9px] text-amber-500 font-bold mt-1">Pending payments</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase">Today's Rev</p>
              <DollarSign className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-textDark">₹{stats.todaysRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-emerald-500 font-bold mt-1">+ Today</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase">Collected</p>
              <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-textDark">₹{stats.collectedRevenue.toLocaleString()}</p>
            <p className="text-[9px] text-textMuted font-bold mt-1">This month</p>
          </div>

          <div className="p-4 rounded-2xl bg-white border-l-4 border-rose-500 shadow-sm hover:-translate-y-1 transition-transform group">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-textMuted uppercase">Overdue</p>
              <AlertTriangle className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-2xl font-black text-rose-500">{stats.overdueStudents}</p>
            <p className="text-[9px] text-rose-500 font-bold mt-1">Requires action</p>
          </div>
        </div>

        {/* Additional ERP Row Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Expected Rev</p>
            <p className="text-xl font-black text-textDark">₹{stats.expectedRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border-l-4 border-amber-400 shadow-sm hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Pending Rev</p>
            <p className="text-xl font-black text-amber-500">₹{stats.pendingRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Monthly Rev</p>
            <p className="text-xl font-black text-textDark">₹{stats.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border-l-4 border-amber-400 shadow-sm hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Pending UTRs</p>
            <p className="text-xl font-black text-amber-500">{stats.pendingPaymentsCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Verified UTRs</p>
            <p className="text-xl font-black text-emerald-500">{stats.verifiedPaymentsCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border-l-4 border-orange-400 shadow-sm hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Open Complaints</p>
            <p className="text-xl font-black text-orange-500">{stats.pendingComplaintsCount}</p>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform">
            <p className="text-[10px] font-bold text-textMuted uppercase mb-1">Resolved</p>
            <p className="text-xl font-black text-textDark">{stats.resolvedComplaintsCount}</p>
          </div>
        </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-3 border-b border-borderLight pb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white text-textMuted hover:text-textDark border border-borderLight hover:bg-slate-50'
          }`}
        >
          Room Matrix ({matrixBeds.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white text-textMuted hover:text-textDark border border-borderLight hover:bg-slate-50'
          }`}
        >
          Payment Ledger ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'bookings'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white text-textMuted hover:text-textDark border border-borderLight hover:bg-slate-50'
          }`}
        >
          Booking Requests ({filteredBookings.filter(r => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('mess')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'mess'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white text-textMuted hover:text-textDark border border-borderLight hover:bg-slate-50'
          }`}
        >
          Monthly Mess ({filteredMessSubscribers.filter(r => r.status === 'Pending').length})
        </button>
        <button
          onClick={() => setActiveTab('payment-verifications')}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
            activeTab === 'payment-verifications'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'bg-white text-textMuted hover:text-textDark border border-borderLight hover:bg-slate-50'
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
              <span className="text-xs font-bold text-textMuted">Layout Floor:</span>
              {['All', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'].map((floor) => (
                <button
                  key={floor}
                  onClick={() => setFilterFloor(floor)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filterFloor === floor
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white border border-borderLight text-textMuted hover:text-textDark hover:bg-slate-50'
                  }`}
                >
                  {floor}
                </button>
              ))}
            </div>

            {/* Status Legend */}
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span> Available
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"></span> Occupied
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]"></span> Reserved
              </span>
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span> Maintenance
              </span>
            </div>
          </div>

          {/* Rooms Layout Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRooms.map((room) => (
              <div
                key={room.roomNumber}
                className="p-5 rounded-2xl bg-white border border-borderLight shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between border-b border-borderLight/60 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-textDark flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-primary" />
                      Room {room.roomNumber}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-textMuted mt-1 block">
                      {room.floorName}
                    </span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-50 border border-borderLight text-textDark">
                    {room.beds.filter((b) => b.occupied).length} / {room.beds.length} Occupied
                  </span>
                </div>

                {/* Beds inside Room */}
                <div className="grid grid-cols-2 gap-3">
                  {room.beds.map((bed) => {
                    const cardStyle = getBedCardClass(bed);
                    return (
                      <div
                        key={bed._id}
                        onClick={() => handleOpenBedDrawer(bed)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between min-h-[5rem] group hover:-translate-y-0.5 ${cardStyle}`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-xs font-black">Cot {bed.bedNumber}</span>
                          <span className="text-[10px] font-extrabold opacity-80">
                            ₹{bed.rentPerBed}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                           {bed.occupied ? (
                             <>
                               <div className="w-4 h-4 rounded bg-rose-200/50 flex items-center justify-center shrink-0">
                                 <UserCheck className="w-2.5 h-2.5 text-rose-700" />
                               </div>
                               <span className="text-[10px] font-bold truncate opacity-90">{bed.studentName || 'Somu'}</span>
                             </>
                           ) : bed.reservationStatus === 'Reserved' ? (
                             <>
                               <div className="w-4 h-4 rounded bg-amber-200/50 flex items-center justify-center shrink-0">
                                 <Clock className="w-2.5 h-2.5 text-amber-700" />
                               </div>
                               <span className="text-[10px] font-bold truncate opacity-90">Reserved</span>
                             </>
                           ) : bed.reservationStatus === 'Maintenance' ? (
                             <>
                               <div className="w-4 h-4 rounded bg-slate-200/50 flex items-center justify-center shrink-0">
                                 <Wrench className="w-2.5 h-2.5 text-slate-600" />
                               </div>
                               <span className="text-[10px] font-bold truncate opacity-90">Maintenance</span>
                             </>
                           ) : (
                             <>
                               <div className="w-4 h-4 rounded bg-emerald-200/50 flex items-center justify-center shrink-0">
                                 <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                               </div>
                               <span className="text-[10px] font-bold truncate opacity-90">Available</span>
                             </>
                           )}
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
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  paymentFilterTab === tab
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white border border-borderLight text-textMuted hover:text-textDark hover:bg-slate-50'
                }`}
              >
                {tab === 'All' ? 'All Payments' : `${tab} Payments`}
              </button>
            ))}
          </div>

          {/* Payments Table */}
          <div className="rounded-2xl bg-white border border-borderLight overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-borderLight bg-slate-50 text-[11px] font-bold uppercase text-textMuted tracking-wider">
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
                <tbody className="divide-y divide-borderLight/60 text-sm font-medium">
                  {filteredPayments.map((pay) => (
                    <tr key={pay._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-textDark border border-borderLight">
                            {pay.studentName?.slice(0, 2)?.toUpperCase() || 'ST'}
                          </div>
                          <div>
                            <p className="font-bold text-textDark text-sm">{pay.studentName}</p>
                            <p className="text-[10px] font-semibold text-textMuted uppercase mt-0.5">{pay.paymentMethod || 'UPI'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                         <div className="font-bold text-primary text-sm">Room {pay.roomNumber}</div>
                         <div className="text-[10px] font-semibold text-textMuted uppercase mt-0.5">Cot {pay.bedNumber}</div>
                      </td>
                      <td className="p-4 font-black text-textDark">₹{pay.amount?.toLocaleString()}</td>
                      <td className="p-4 text-textMuted font-semibold text-sm">{pay.monthYear || 'July 2026'}</td>
                      <td className="p-4 text-textMuted text-xs flex items-center gap-1.5"><Calendar className="w-3 h-3"/> 05 August 2026</td>
                      <td className="p-4">{renderPaymentStatusBadge(pay.status || 'Paid')}</td>
                      <td className="p-4 font-mono text-textDark font-bold text-xs">{pay.utrNumber}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                            pay.verificationStatus === 'Verified'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : pay.verificationStatus === 'Rejected'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
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
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-all border border-emerald-200"
                            >
                              Verify
                            </button>
                          )}
                          {pay.verificationStatus !== 'Rejected' && (
                            <button
                              onClick={() => handleRejectPayment(pay._id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-all border border-rose-200"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            onClick={() => alert(`Sending reminder / WhatsApp notification to ${pay.studentName}`)}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-textMuted border border-borderLight transition-all shadow-sm"
                            title="Send WhatsApp Reminder"
                          >
                            <Send className="w-3.5 h-3.5 text-emerald-500" />
                          </button>
                          <button
                            onClick={() => alert(`Downloading official PDF Receipt ${pay.receiptNumber || 'REC-2026'}`)}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-textMuted border border-borderLight transition-all shadow-sm"
                            title="Download Receipt"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                     <tr>
                       <td colSpan="9" className="p-8 text-center text-textMuted text-sm">
                         No payments found.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKING REQUESTS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white border border-borderLight overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-borderLight bg-slate-50">
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Applicant Name</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Requested Bed</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Status</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight/60">
                  {filteredBookings.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-textDark text-sm">{req.name}</div>
                        <div className="text-[11px] font-semibold text-textMuted mt-0.5">{req.collegeCompany || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-textMuted">
                        <div>{req.phone}</div>
                        <div className="mt-0.5">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-primary">Room {req.preferredRoom}</div>
                        <div className="text-[11px] font-semibold text-textMuted uppercase mt-0.5">Cot {req.preferredBed}</div>
                      </td>
                      <td className="p-4">
                        {req.status === 'Pending' && <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border border-amber-200">Pending</span>}
                        {req.status === 'Approved' && <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Approved</span>}
                        {req.status === 'Rejected' && <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-rose-50 text-rose-600 border border-rose-200">Rejected</span>}
                      </td>
                      <td className="p-4 text-right">
                        {req.status === 'Pending' && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleApproveBooking(req._id)}
                              disabled={processingId === req._id}
                              className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${
                                processingId === req._id ? 'bg-slate-50 text-textMuted border-borderLight cursor-not-allowed' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {processingId === req._id ? 'Processing...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectBooking(req._id)}
                              disabled={processingId === req._id}
                              className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${
                                processingId === req._id ? 'bg-slate-50 text-textMuted border-borderLight cursor-not-allowed' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
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
                      <td colSpan="5" className="p-8 text-center text-textMuted text-sm">
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
            <div className="p-4 rounded-xl bg-white border border-borderLight shadow-sm hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-blue-500" /> Total Applications</p>
              <p className="text-xl font-black text-textDark mt-1">{filteredMessSubscribers.length}</p>
            </div>
            <div className="p-4 rounded-xl bg-white border-l-4 border-emerald-500 shadow-sm hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active Subscribers</p>
              <p className="text-xl font-black text-textDark mt-1">{filteredMessSubscribers.filter(s => s.status === 'Active').length}</p>
            </div>
            <div className="p-4 rounded-xl bg-white border-l-4 border-amber-500 shadow-sm hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Pending Approval</p>
              <p className="text-xl font-black text-textDark mt-1">{filteredMessSubscribers.filter(s => s.status === 'Pending').length}</p>
            </div>
            <div className="p-4 rounded-xl bg-white border-l-4 border-rose-500 shadow-sm hover:-translate-y-1 transition-transform">
              <p className="text-[10px] font-bold text-textMuted uppercase flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> Inactive</p>
              <p className="text-xl font-black text-textDark mt-1">{filteredMessSubscribers.filter(s => s.status === 'Inactive').length}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-borderLight overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-borderLight bg-slate-50">
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Applicant Name</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Plan & Date</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider">Status</th>
                    <th className="p-4 text-[11px] font-bold text-textMuted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderLight/60">
                  {filteredMessSubscribers.map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-textDark text-sm">{req.name}</div>
                        <div className="text-[10px] text-textMuted font-bold uppercase mt-0.5">{req.mealPreference} • {req.occupation}</div>
                        <div className="text-[11px] font-semibold text-textMuted mt-0.5">{req.collegeCompany || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-textMuted">
                        <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-textMuted" /> {req.phone}</div>
                        <div className="mt-1 truncate max-w-[150px]">{req.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-bold text-primary">{req.plan}</div>
                        <div className="text-[11px] font-semibold text-textMuted mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Starts: {new Date(req.startDate).toLocaleDateString()}</div>
                      </td>
                      <td className="p-4">
                        {req.status === 'Pending' && <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border border-amber-200">Pending</span>}
                        {req.status === 'Active' && <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">Active</span>}
                        {req.status === 'Inactive' && <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-rose-50 text-rose-600 border border-rose-200">Inactive</span>}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {req.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateMessStatus(req._id, 'Active')}
                                disabled={processingId === req._id}
                                className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-50 text-textMuted border-borderLight' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'}`}
                              >
                                Activate
                              </button>
                              <button
                                onClick={() => handleUpdateMessStatus(req._id, 'Inactive')}
                                disabled={processingId === req._id}
                                className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-50 text-textMuted border-borderLight' : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'}`}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {req.status === 'Active' && (
                            <button
                              onClick={() => handleUpdateMessStatus(req._id, 'Inactive')}
                              disabled={processingId === req._id}
                              className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-50 text-textMuted border-borderLight' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'}`}
                            >
                              Pause/Cancel
                            </button>
                          )}
                          {req.status === 'Inactive' && (
                            <button
                              onClick={() => handleUpdateMessStatus(req._id, 'Active')}
                              disabled={processingId === req._id}
                              className={`px-3 py-1.5 rounded-lg transition-all text-[11px] font-bold border ${processingId === req._id ? 'bg-slate-50 text-textMuted border-borderLight' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'}`}
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
                      <td colSpan="5" className="p-8 text-center text-textMuted text-sm">
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
            <h2 className="text-xl font-black text-primary">Pending Verifications</h2>
          </div>
          
          <div className="grid gap-4">
            {paymentVerifications.filter(p => p.paymentStatus === 'Pending Verification').map((req) => (
              <div key={req._id} className="bg-white rounded-2xl p-6 border border-borderLight shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:items-center justify-between">
                
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-textDark">{req.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-50 text-amber-600 border border-amber-200">
                      {req.applicationType}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-textMuted border border-borderLight">
                      {req.applicationId}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    <div>
                      <p className="text-[10px] text-textMuted uppercase font-bold">Contact</p>
                      <p className="text-sm font-semibold text-textDark flex items-center gap-1"><Phone className="w-3 h-3 text-textMuted"/> {req.phone}</p>
                    </div>
                    {req.applicationType === 'PG Booking' && (
                      <div>
                        <p className="text-[10px] text-textMuted uppercase font-bold">Room / Cot</p>
                        <p className="text-sm font-semibold text-textDark">Room {req.preferredRoom}, Cot {req.preferredBed}</p>
                      </div>
                    )}
                    {req.applicationType === 'Monthly Mess' && (
                      <div>
                        <p className="text-[10px] text-textMuted uppercase font-bold">Mess Plan</p>
                        <p className="text-sm font-semibold text-textDark">{req.plan}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-textMuted uppercase font-bold">UTR Number</p>
                      <p className="text-sm font-black text-emerald-600">{req.utrNumber}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-textMuted uppercase font-bold">Screenshot</p>
                      <a href={req.paymentScreenshot} target="_blank" rel="noreferrer" className="text-primary hover:text-indigo-600 text-xs flex items-center gap-1 mt-1 font-semibold">
                        <ExternalLink className="w-3 h-3" /> View Image
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[140px]">
                  <button
                    onClick={() => handleVerifyApplicationPayment(req.applicationType, req._id)}
                    disabled={processingId === req._id}
                    className="w-full px-4 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all border border-emerald-200 flex justify-center items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectApplicationPayment(req.applicationType, req._id)}
                    disabled={processingId === req._id}
                    className="w-full px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all border border-rose-200 flex justify-center items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}

            {paymentVerifications.filter(p => p.paymentStatus === 'Pending Verification').length === 0 && (
              <div className="text-center p-12 bg-white border border-borderLight rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border border-borderLight rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-textMuted font-semibold text-sm">No pending payments to verify.</p>
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
    </div>
  );
};

export default OwnerDashboard;
