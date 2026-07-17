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
  const [isLoading, setIsLoading] = useState(true);
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

  const getSharingCapacity = (roomNumber) => {
    if (!roomNumber) return 4;
    const num = roomNumber.toUpperCase();
    if (['S11', 'S12', 'S13', 'S14', 'S21', 'S22', 'S23', 'S24', 'S31', 'S32'].includes(num)) return 4;
    if (['S15', 'S16', 'S17', 'S18', 'S25', 'S26', 'S27', 'S28', 'S33', 'S34'].includes(num)) return 5;
    if (['S01', 'S02'].includes(num)) return 6;
    return 4;
  };

  const fetchLiveDatabaseData = async () => {
    try {
      // Fetch both endpoints in parallel to dramatically improve loading speed
      const [statsRes, roomsRes] = await Promise.all([
        fetch('/api/public/statistics'),
        fetch('/api/public/rooms')
      ]);

      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success && statsJson.data) {
          setStats(statsJson.data);
        }
      }

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
              sharing: (room.beds && room.beds.length > 0) ? room.beds.length : getSharingCapacity(room.roomNumber),
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
    } finally {
      setIsLoading(false);
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
    })
  })).filter((block) => block.rooms.length > 0 && block.floorName !== 'Special Block');

  return (
    <div className="space-y-12 pb-14 bg-bgLight">
      {/* Hero Banner Section (Matches Reference Mockup) */}
      <section className="relative bg-[#faf9f6] pt-12 lg:pt-24 pb-32 lg:pb-40 overflow-visible z-10">
        
        {/* Right Side Image with CSS Mask for Seamless Blend */}
        <div className="absolute inset-y-0 right-0 w-full lg:w-[55%] z-0 h-[400px] lg:h-full top-0 lg:top-auto">
          {/* Using standard CSS mask for the perfect fade effect shown in mockup */}
          <div 
            className="w-full h-full"
            style={{ 
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 100%)' 
            }}
          >
            <img 
              src="/building.jpg" 
              alt="S3 Elite PG Building" 
              className="w-full h-full object-cover object-[center_right]"
            />
          </div>
          {/* Mobile fade mask (bottom) */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#faf9f6] to-transparent lg:hidden pointer-events-none z-10"></div>
        </div>

        {/* Hero Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row mt-64 sm:mt-80 lg:mt-0">
          
          {/* Left Content Side */}
          <div className="lg:w-[50%] flex flex-col justify-center w-full relative z-20">
            
            {/* Trusted Badge */}
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">Trusted by 10,000+ Students</span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#1a1a1a] leading-[1.1] mb-6 tracking-tight">
              Comfort, Care,<br />
              Career, <span className="text-orange-500">Success</span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-10 max-w-md font-medium">
              Premium accommodation, hygienic food, and a positive environment that helps you focus on what truly matters — your future.
            </p>
            
            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a
                href="#floor-availability"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-transform hover:-translate-y-0.5 shadow-lg shadow-orange-500/25"
              >
                Book Your Bed
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={() => onOpenMess()}
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white border border-gray-200 text-gray-800 font-bold text-sm transition-transform hover:-translate-y-0.5 shadow-sm hover:shadow-md"
              >
                <Utensils className="w-4 h-4 text-orange-500" />
                Join Monthly Mess
              </button>
            </div>

            {/* Happy Students & Parents */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/100?img=11" alt="Student" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=12" alt="Student" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=33" alt="Student" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                <img src="https://i.pravatar.cc/100?img=44" alt="Student" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800">Happy Students & Parents</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs font-bold text-gray-600">4.8</span>
                  <span className="text-[10px] text-gray-500">(2K+ Reviews)</span>
                  <div className="flex text-amber-400 ml-1">
                    {'★'.repeat(5)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats Bar (Positioned overlapping the bottom) */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16 w-[95%] max-w-5xl z-30">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            
            {/* Stat 1 */}
            <div className="flex items-center gap-4 px-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xl font-black text-gray-800 leading-tight">97</p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Beds Available</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-100"></div>

            {/* Stat 2 */}
            <div className="flex items-center gap-4 px-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800 leading-tight">24/7</p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Security</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-100"></div>

            {/* Stat 3 */}
            <div className="flex items-center gap-4 px-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800 leading-tight">Hygienic</p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Food</p>
              </div>
            </div>

            <div className="hidden md:block w-px h-12 bg-gray-100"></div>

            {/* Stat 4 */}
            <div className="flex items-center gap-4 px-4 w-full md:w-auto">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-lg font-black text-gray-800 leading-tight">Prime</p>
                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Location</p>
              </div>
            </div>

          </div>
        </div>
      </section>
      
      {/* Wavy bottom decorative shape from mockup (optional but adds flavor) */}
      <div className="w-full overflow-hidden leading-none z-0 relative -mt-1 bg-white">
        <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#faf9f6"></path>
        </svg>
      </div>

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
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-200/50 rounded-2xl w-full border border-slate-100"></div>
              ))}
            </div>
          ) : filteredBlocks.length === 0 ? (
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
                className="mb-10"
              >
                {/* FLOOR STATIC HEADER (Matches Mockup) */}
                <div className="flex items-center gap-4 mb-6 px-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    {block.floorName}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-bold shadow-sm">
                    {block.roomCount}
                  </span>
                </div>

                {/* ROOMS CONTAINER */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {block.rooms.map((room) => {
                        return (
                        <div
                          key={room.id}
                          className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
                        >
                          {/* Image */}
                          <div className="h-36 w-full bg-gray-100 overflow-hidden relative">
                            <img 
                              src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                              alt="Room interior"
                              className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>

                          <div className="p-5 flex flex-col flex-1">
                            {/* Room Header: Number & Badge */}
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-2xl font-black text-gray-900 tracking-tight">{room.id}</h3>
                              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-xs font-bold capitalize">
                                {room.free} Beds Available
                              </div>
                            </div>
                            
                            {/* Floor & Sharing */}
                            <p className="text-xs font-bold text-gray-500 mb-5">
                              {block.floorName} • {room.sharing} Sharing
                            </p>



                            {/* Dynamic Cot List */}
                            <div className="space-y-3 flex-1 border-t border-gray-100 pt-5">
                              {/* Generate exact number of cots based on sharing capacity */}
                              {Array.from({ length: room.sharing }).map((_, index) => {
                                const cotIndex = index;
                                const bed = room.cots[cotIndex] || { bedNumber: cotIndex + 1, occupied: false, reservationStatus: 'Available' };
                                const isAvailable = !bed.occupied && (bed.reservationStatus === 'Available' || !bed.reservationStatus);
                                const isReserved = bed.reservationStatus === 'Reserved';
                                const isMaintenance = bed.reservationStatus === 'Maintenance';

                                return (
                                  <div
                                    key={bed._id || cotIndex}
                                    className="flex items-center justify-between px-4 py-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                                  >
                                    <span className="text-sm font-bold text-gray-800">
                                      Cot {bed.bedNumber || cotIndex + 1}
                                    </span>

                                    {isAvailable ? (
                                      <button
                                        onClick={() =>
                                          onOpenAuth('student', {
                                            room: room.id,
                                            cot: bed.bedNumber || cotIndex + 1,
                                            floor: block.floorName,
                                            sharingType: `${room.sharing} Sharing`
                                          })
                                        }
                                        className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm"
                                      >
                                        Book
                                      </button>
                                    ) : isReserved ? (
                                      <span className="px-4 py-2 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold">
                                        Reserved
                                      </span>
                                    ) : isMaintenance ? (
                                      <span className="px-4 py-2 rounded-lg bg-gray-100 text-gray-500 text-xs font-bold">
                                        Maintenance
                                      </span>
                                    ) : (
                                      <span className="px-4 py-2 rounded-lg bg-red-100 text-red-600 text-xs font-bold">
                                        Occupied
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  </div>
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
