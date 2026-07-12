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
  Shield
} from 'lucide-react';
import { io } from 'socket.io-client';
import { realtimeBus } from '../utils/realtimeBus';
import ContactOwnerCard from '../components/ContactOwnerCard';

const facilities = [
  { icon: Wifi, title: 'High-Speed Fiber WiFi', desc: 'Unlimited high-speed Wi-Fi available throughout the hostel for online classes, office work, entertainment, and everyday browsing.' },
  { icon: Utensils, title: 'Hygienic Food & Monthly Mess', desc: 'Enjoy fresh, hygienic, and home-style breakfast, lunch, and dinner every day. Hostel residents receive quality daily meals, and affordable monthly mess plans are also available for external customers who wish to subscribe without staying in the hostel.' },
  { icon: Droplets, title: 'Washing Machine Facility', desc: 'Shared washing machines are available for all hostel residents with easy access and convenient laundry facilities.' },
  { icon: Home, title: 'Spacious & Comfortable Rooms', desc: 'Well-ventilated rooms with quality beds, storage space, proper lighting, and a peaceful environment for comfortable living.' },
  { icon: Camera, title: '24/7 CCTV Surveillance', desc: 'Round-the-clock CCTV surveillance ensures a safe, secure, and well-monitored living environment for all residents.' }
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
    const socket = io();
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
    <div className="space-y-12 pb-14">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden pt-10 pb-14 border-b border-slate-800">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">


            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Comfort, Care, Career, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Success</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Discover a smarter way to live at S3 Elite PG. From comfortable rooms and quality dining to secure accommodation and digital services, we provide everything you need for a stress-free stay.
            </p>

            {/* Live MongoDB Counters */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <div className="px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-emerald-400" />
                <span className="text-xs text-slate-300">
                  Live Vacant Cots: <strong className="text-emerald-400 text-sm font-bold">{totalFreeCots || stats.vacantBeds} Free Cots Available</strong>
                </span>
              </div>

            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <a
                href="#floor-availability"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                Book Your Bed
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={onOpenMess}
                className="px-6 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 border border-amber-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                Join Monthly Mess
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FLOOR-WISE BED AVAILABILITY WITH DROPDOWN SELECTOR & COLLAPSIBLE DROP SECTIONS */}
      <section id="floor-availability" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Floor-wise Bed Availability</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select a floor drop section below. Click on any floor banner to toggle/drop down its rooms.
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
                className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* FLOOR DROPDOWN SELECTOR */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl">
              <Layers className="w-4 h-4 text-indigo-400" />
              <label htmlFor="floor-dropdown" className="text-xs font-bold text-slate-300 whitespace-nowrap">
                Select Floor Section:
              </label>
              <select
                id="floor-dropdown"
                value={selectedFloorDropdown}
                onChange={(e) => setSelectedFloorDropdown(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-indigo-400 focus:outline-none cursor-pointer"
              >
                <option value="All" className="bg-slate-900 text-white">All Floors ({floorBlocks.length} Sections)</option>
                {floorBlocks.map((b) => (
                  <option key={b.floorName} value={b.floorName} className="bg-slate-900 text-white">
                    {b.floorName} ({b.roomCount})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              Refresh ({lastRefreshed})
            </button>
          </div>
        </div>

        {/* ACCORDION / COLLAPSIBLE DROP SECTIONS FOR EACH FLOOR */}
        <div className="space-y-5">
          {filteredBlocks.length === 0 ? (
            <div className="text-center p-10 bg-[#0a0f18] rounded-2xl border border-slate-800">
              <p className="text-slate-400">No rooms match your search criteria.</p>
            </div>
          ) : (
            filteredBlocks.map((block) => {
              const isCollapsed = searchQuery.trim() ? false : !!collapsedFloors[block.floorName];
              const floorFreeCots = block.rooms.reduce((acc, r) => acc + r.free, 0);

            return (
              <div
                key={block.floorName}
                className="rounded-2xl bg-[#0a0f18] border border-slate-800/90 overflow-hidden shadow-xl transition-all"
              >
                {/* FLOOR DROP SECTION HEADER BUTTON (CLICK TO DROP / COLLAPSE) */}
                <button
                  type="button"
                  onClick={() => toggleFloorDropSection(block.floorName)}
                  className="w-full px-5 py-4 bg-[#111827] hover:bg-[#1f2937] border-b border-slate-800 flex items-center justify-between text-left transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-extrabold text-amber-400 group-hover:text-amber-300">
                      {block.floorName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800 text-xs font-semibold">
                      {block.roomCount}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-400">
                      {floorFreeCots} free cots
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-800/80 group-hover:bg-indigo-600/30 flex items-center justify-center text-slate-300 transition-colors">
                      {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* DROPPED DOWN ROOMS CONTAINER */}
                {!isCollapsed && (
                  <div className="p-5 bg-[#080c14]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {block.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="p-3.5 rounded-xl bg-[#0d131f] border border-slate-800 hover:border-indigo-500/40 shadow-md space-y-3 transition-colors"
                        >
                          {/* Room Header */}
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-slate-200">
                              {room.id} ({room.sharing} sharing)
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[11px] ${
                              room.free > 0
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                                : 'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}>
                              {room.free} free
                            </span>
                          </div>

                          {/* Cots Vertical List loaded directly from MongoDB */}
                          <div className="space-y-1.5">
                            {room.cots.map((bed, cIdx) => {
                              const isAvailable = !bed.occupied && (bed.reservationStatus === 'Available' || !bed.reservationStatus);
                              const isReserved = bed.reservationStatus === 'Reserved';
                              const isMaintenance = bed.reservationStatus === 'Maintenance';

                              return (
                                <div
                                  key={bed._id || cIdx}
                                  className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-[#070b12] border border-slate-800/70"
                                >
                                  <span className="font-semibold text-slate-300">
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
                                      className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#A7F3D0] hover:bg-[#6EE7B7] text-[#065F46] transition-all shadow-sm active:scale-95"
                                    >
                                      Book Now
                                    </button>
                                  ) : isReserved ? (
                                    <span
                                      className="px-3 py-1 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                    >
                                      Reserved
                                    </span>
                                  ) : isMaintenance ? (
                                    <span
                                      className="px-3 py-1 rounded-md text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700"
                                    >
                                      Maintenance
                                    </span>
                                  ) : (
                                    <span
                                      className="px-3 py-1 rounded-md text-[11px] font-bold bg-[#FCE7F3] text-[#9D174D]"
                                    >
                                      Occupied
                                    </span>
                                  )}
                                </div>
                              );
                            })}
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

      {/* Facilities Showcase Section */}
      <section id="facilities" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Why Choose S3 Elite PG?</h2>
          <p className="text-sm text-slate-400">
            Designed for comfort, study focus, career growth, and seamless AI digital living.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((fac, idx) => {
            const IconComponent = fac.icon;
            return (
              <div key={idx} className="glass-card p-6 border border-slate-800/80 hover:border-indigo-500/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1.5">{fac.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-3xl font-extrabold text-white">Monthly Mess Menu</h2>
          <p className="text-sm text-slate-400">
            Nutritious and delicious meals prepared fresh daily.
          </p>
        </div>
        <div className="glass-card p-12 border border-slate-800/80 hover:border-amber-500/40 transition-all text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600/30 to-orange-600/30 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Menu Coming Soon</h3>
          <p className="text-sm text-slate-400">
            We are currently updating our weekly mess menu. Please check back later or contact the owner for details.
          </p>
        </div>
      </section>

      {/* Contact Owner & Direct Support Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Need Quick Support or Location Guidance?</h3>
          <p className="text-xs text-slate-400">Reach out directly to S3 Elite PG Verified Owner</p>
        </div>
        <ContactOwnerCard />
      </section>
    </div>
  );
};

export default HomePage;
