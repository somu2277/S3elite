import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  ShieldCheck,
  Wifi,
  Zap,
  Utensils,
  BookOpen,
  Camera,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Droplets,
  Home,
  Shield,
  MapPin,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { io } from 'socket.io-client';
import { realtimeBus } from '../utils/realtimeBus';
import ContactOwnerCard from '../components/ContactOwnerCard';

const facilities = [
  { icon: BedDouble, title: 'Comfortable Rooms', desc: 'Spacious, well-ventilated rooms with modern amenities.' },
  { icon: Utensils, title: 'Hygienic Food', desc: 'Nutritious and hygienic meals prepared fresh every day.' },
  { icon: Wifi, title: 'High-Speed Wi-Fi', desc: 'Enjoy uninterrupted high-speed internet for studies and work.' },
  { icon: ShieldCheck, title: '24/7 Security', desc: 'CCTV surveillance and security staff for your safety.' },
  { icon: Sparkles, title: 'Housekeeping', desc: 'Daily cleaning and maintenance for a healthy environment.' },
  { icon: Utensils, title: 'Monthly Mess Available', desc: 'Fresh hygienic breakfast, lunch, and dinner with affordable monthly mess plans for residents and external customers.' }
];

const HomePage = ({ onOpenAuth, onOpenMess }) => {
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [selectedFloorDropdown, setSelectedFloorDropdown] = useState('All');
  const [collapsedFloors, setCollapsedFloors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Strictly Live MongoDB States (No Hardcoded or Dummy Data)
  const [floorBlocks, setFloorBlocks] = useState([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    vacantBeds: 0,
    reservedBeds: 0,
    maintenanceBeds: 0,
    occupancyPercentage: 0,
    totalFloors: 4,
    pricing: {
      monthlyRent: 6000,
      deposit: 5000
    }
  });

  const fetchLiveDatabaseData = async () => {
    try {
      // 1. Fetch Secure Public Statistics from MongoDB
      const statsRes = await fetch('/api/public/statistics');
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success && statsJson.data) {
          setStats(statsJson.data);
        }
      }

      // 2. Fetch Live Rooms & Beds from MongoDB
      const roomsRes = await fetch('/api/public/rooms');
      if (roomsRes.ok) {
        const roomsJson = await roomsRes.json();
        if (roomsJson.success && Array.isArray(roomsJson.data)) {
          // Group MongoDB rooms by floor block
          const grouped = {};
          roomsJson.data.forEach((room) => {
            const fName = room.floorName || '1st Floor';
            if (!grouped[fName]) {
              grouped[fName] = [];
            }
            const freeCount = (room.beds || []).filter(
              (b) => !b.occupied && b.reservationStatus === 'Available'
            ).length;

            grouped[fName].push({
              id: room.roomNumber,
              sharing: (room.beds || []).length || 4,
              free: freeCount,
              rentPerBed: room.rentPerBed || 6000,
              cots: room.beds || []
            });
          });

          const formattedBlocks = Object.entries(grouped).map(([floorName, roomsList]) => ({
            floorName,
            roomCount: `${roomsList.length} rooms`,
            rooms: roomsList
          }));

          setFloorBlocks(formattedBlocks);
        }
      }
    } catch (err) {
      console.error('Error fetching live public MongoDB data:', err);
    }
  };

  useEffect(() => {
    fetchLiveDatabaseData();

    // Socket.IO real-time auto-synchronization (no page refresh required)
    const socket = io({ transports: ['polling'] });
    socket.on('ERP_EVENT', (event) => {
      console.log('[Socket.IO] Public website synchronizing live MongoDB update:', event?.type);
      fetchLiveDatabaseData();
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    // Cross-tab broadcast listener
    const unsubscribe = realtimeBus.subscribe(() => {
      fetchLiveDatabaseData();
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    });

    return () => {
      socket.disconnect();
      unsubscribe();
    };
  }, []);

  const handleRefresh = () => {
    fetchLiveDatabaseData();
    setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  const toggleFloorDropSection = (floorName) => {
    setCollapsedFloors((prev) => ({
      ...prev,
      [floorName]: !prev[floorName]
    }));
  };


  const totalFreeCots = floorBlocks.reduce(
    (acc, block) => acc + block.rooms.reduce((rAcc, r) => rAcc + r.free, 0),
    0
  );

  const filteredBlocks = (selectedFloorDropdown === 'All'
    ? floorBlocks
    : floorBlocks.filter((block) => block.floorName === selectedFloorDropdown)
  ).map((block) => ({
    ...block,
    rooms: block.rooms.filter((room) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return room.id.toLowerCase().includes(q) || `${room.sharing} sharing`.toLowerCase().includes(q);
    })
  })).filter((block) => block.rooms.length > 0);

  return (
    <div className="space-y-12 pb-14 bg-bgLight">
      {/* Hero Banner Section */}
      <section className="pt-16 pb-24 relative bg-bgLight overflow-hidden">
        {/* Soft Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-orange-100/40 to-transparent rounded-full blur-3xl opacity-70 pointer-events-none translate-x-1/3 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-orange-50/60 to-transparent rounded-full blur-2xl opacity-60 pointer-events-none -translate-x-1/4 translate-y-1/4"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-14">
            
            {/* Content Side (Left) */}
            <div className="lg:w-[55%] flex flex-col justify-center order-2 lg:order-1 animate-fade-in">
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600 text-[10px] font-black shadow-sm">✓</span>
                <span className="text-xs sm:text-sm font-bold text-textDark tracking-wide">Premium PG in Kurnool</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-textDark leading-[1.15] mb-4">
                S3 Elite PG
              </h1>
              <h2 className="text-xl sm:text-2xl font-bold text-primary mb-6">
                Premium Accommodation for Students & Working Professionals
              </h2>
              
              <p className="text-base sm:text-lg text-textMuted leading-relaxed mb-10 max-w-xl">
                Comfortable rooms, hygienic monthly mess, high-speed Wi-Fi, CCTV surveillance, washing machine facility and a peaceful living environment.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <a
                  href="#floor-availability"
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primaryHover text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/30 hover:-translate-y-1"
                >
                  Book Your Bed
                </a>
                <button
                  onClick={() => onOpenMess()}
                  className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-borderLight text-textDark hover:bg-slate-50 font-bold text-sm transition-all shadow-sm hover:-translate-y-1"
                >
                  Join Monthly Mess
                </button>
              </div>

              {/* LIVE BADGES */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-x-6 gap-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-textDark text-sm">{stats.vacantBeds} Available Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-textDark text-sm">{stats.totalRooms} Total Rooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-textDark text-sm">24/7 CCTV Protected</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-bold text-textDark text-sm">Monthly Mess Available</span>
                </div>
              </div>
            </div>

            {/* Image Side (Right) */}
            <div className="lg:w-[50%] order-1 lg:order-2 w-full animate-slide-in-right relative lg:-mr-12 mt-8 lg:mt-0">
              {/* Soft gradient mask blending the left edge into the background */}
              <div className="absolute inset-y-0 left-0 w-32 md:w-48 bg-gradient-to-r from-bgLight via-bgLight/80 to-transparent z-10 pointer-events-none"></div>
              
              {/* Optional bottom gradient to smooth out the base */}
              <div className="absolute inset-x-0 bottom-0 h-16 md:h-24 bg-gradient-to-t from-bgLight to-transparent z-10 pointer-events-none"></div>
              
              <img 
                src="/building.jpg" 
                alt="S3 Elite PG Building" 
                loading="lazy"
                className="w-full h-auto max-h-[600px] lg:max-h-[700px] object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FLOOR-WISE BED AVAILABILITY WITH DROPDOWN SELECTOR & COLLAPSIBLE DROP SECTIONS */}
      <section id="floor-availability" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-borderLight pb-5">
          <div>
            <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1 block">BED AVAILABILITY</span>
            <h2 className="text-3xl font-extrabold text-textDark tracking-tight">Find Your Perfect Space</h2>
            <p className="text-sm text-textMuted mt-2">
              Choose from our available rooms and book your bed instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SEARCH ROOM */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Room (e.g. S11)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-2 rounded-xl bg-white border border-borderLight text-xs text-textDark placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>

            {/* FLOOR DROPDOWN SELECTOR */}
            <div className="flex items-center gap-2 bg-white border border-borderLight px-3.5 py-2 rounded-xl shadow-sm">
              <Layers className="w-4 h-4 text-primary" />
              <label htmlFor="floor-dropdown" className="text-xs font-bold text-textMuted whitespace-nowrap">
                Select Floor Section:
              </label>
              <select
                id="floor-dropdown"
                value={selectedFloorDropdown}
                onChange={(e) => setSelectedFloorDropdown(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-primary focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-white text-textDark">All Floors ({floorBlocks.length} Sections)</option>
                {floorBlocks.map((b) => (
                  <option key={b.floorName} value={b.floorName} className="bg-white text-textDark">
                    {b.floorName} ({b.roomCount})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-borderLight hover:border-primary/50 text-xs text-textMuted transition-colors shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
              Refresh ({lastRefreshed})
            </button>
          </div>
        </div>

        {/* ACCORDION / COLLAPSIBLE DROP SECTIONS FOR EACH FLOOR */}
        <div className="space-y-5">
          {filteredBlocks.length === 0 ? (
            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-borderLight">
              <p className="text-textMuted">No rooms match your search criteria.</p>
            </div>
          ) : (
            filteredBlocks.map((block) => {
              const isCollapsed = searchQuery.trim() ? false : !!collapsedFloors[block.floorName];
              const floorFreeCots = block.rooms.reduce((acc, r) => acc + r.free, 0);

            return (
              <div
                key={block.floorName}
                className="rounded-2xl bg-white border border-borderLight overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* FLOOR DROP SECTION HEADER BUTTON (CLICK TO DROP / COLLAPSE) */}
                <button
                  type="button"
                  onClick={() => toggleFloorDropSection(block.floorName)}
                  className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100 border-b border-borderLight flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-extrabold text-textDark group-hover:text-primary transition-colors">
                      {block.floorName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white text-textMuted border border-borderLight text-xs font-semibold shadow-sm">
                      {block.roomCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-green-600">
                      {floorFreeCots} free cots
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-white border border-borderLight group-hover:bg-orange-50 flex items-center justify-center text-textDark transition-colors shadow-sm">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* DROPPED DOWN ROOMS CONTAINER */}
                {!isCollapsed && (
                  <div className="p-5 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {block.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="rounded-2xl bg-white border border-borderLight hover:border-primary/40 shadow-sm overflow-hidden transition-colors flex flex-col"
                        >
                          {/* Room Image (from Mockup) */}
                          <div className="h-36 w-full relative">
                            <img src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80" alt="Room" className="w-full h-full object-cover" />
                          </div>

                          <div className="p-4 flex-1 flex flex-col space-y-4">
                            {/* Room Info */}
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-base font-bold text-textDark">{room.id}</h3>
                                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                                  room.free > 0
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {room.free} {room.free === 1 ? 'Bed' : 'Beds'} Available
                                </span>
                              </div>
                              <p className="text-[11px] text-textMuted font-medium">{block.floorName} • {room.sharing} Sharing</p>
                            </div>

                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-textDark">₹{(room.rentPerBed || 6500).toLocaleString('en-IN')}</span>
                              <span className="text-xs text-textMuted font-medium">/ month</span>
                            </div>
                            
                            <hr className="border-borderLight" />

                            {/* Cots Vertical List loaded directly from MongoDB */}
                            <div className="space-y-2">
                              {room.cots.map((bed, cIdx) => {
                                const isAvailable = !bed.occupied && (bed.reservationStatus === 'Available' || !bed.reservationStatus);
                                const isReserved = bed.reservationStatus === 'Reserved';
                                const isMaintenance = bed.reservationStatus === 'Maintenance';

                                return (
                                  <div
                                    key={bed._id || cIdx}
                                    className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-50 border border-borderLight shadow-sm"
                                  >
                                    <span className="font-bold text-textDark">
                                      Cot {bed.bedNumber || cIdx + 1}
                                    </span>

                                    {isAvailable ? (
                                      <button
                                        onClick={() =>
                                          onOpenAuth('student', {
                                            room: room.id,
                                            cot: bed.bedNumber || cIdx + 1,
                                            floor: block.floorName,
                                            rent: bed.rentPerBed || room.rentPerBed || 6000,
                                            sharingType: `${room.sharing} Sharing`
                                          })
                                        }
                                        className="px-4 py-1.5 rounded-md text-[11px] font-bold bg-primary hover:bg-primaryHover text-white transition-all shadow-sm shadow-orange-500/20 active:scale-95"
                                      >
                                        Book
                                      </button>
                                    ) : isReserved ? (
                                      <span
                                        className="px-3 py-1 rounded-md text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200"
                                      >
                                        Reserved
                                      </span>
                                    ) : isMaintenance ? (
                                      <span
                                        className="px-3 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200"
                                      >
                                        Maintenance
                                      </span>
                                    ) : (
                                      <span
                                        className="px-3 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-700 border border-red-200"
                                      >
                                        Occupied
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }))}
        </div>
      </section>

      {/* Our Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 bg-bgLight">
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col items-center">
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase mb-2">OUR SERVICES</span>
          <div className="w-8 h-[2px] bg-primary mb-4"></div>
          <h2 className="text-3xl font-extrabold text-textDark">Everything You Need, All in One Place</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, idx) => {
            const IconComponent = fac.icon;
            return (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-borderLight hover:border-primary/30 transition-all shadow-sm hover:shadow-md flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-primary flex-shrink-0">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-textDark mb-1.5">{fac.title}</h3>
                  <p className="text-[11px] text-textMuted leading-relaxed">{fac.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>




      {/* Contact Owner & Direct Support Section */}
      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-textDark">Need Quick Support or Location Guidance?</h3>
          <p className="text-xs text-textMuted">Reach out directly to S3 Elite PG Verified Owner</p>
        </div>
        <ContactOwnerCard />
      </section>
    </div>
  );
};

export default HomePage;
