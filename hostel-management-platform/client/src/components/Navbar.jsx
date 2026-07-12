import React from 'react';
import {
  Building2,
  LogOut,
  Sparkles,
  GraduationCap,
  Home,
  BedDouble,
  LogIn,
  Wifi,
  Image as ImageIcon,
  PhoneCall
} from 'lucide-react';

const Navbar = ({ user, onLogout, currentView, setCurrentView, onOpenAuth }) => {
  return (
    <nav className="glass-header border-b border-slate-800 bg-darkBg/90 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer"
            onClick={() => setCurrentView('home')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                S3 Elite <span className="text-indigo-400 font-extrabold hidden sm:inline">PG</span>
              </span>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold hidden sm:block">Comfort, Care, Career, Success</p>
            </div>
          </div>

          {/* Public Navigation Links (Home, Facilities, Menu, Bed Availability, Gallery, Contact) */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#floor-availability" onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">
              Home
            </a>
            <a href="#facilities" onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">
              Facilities
            </a>
            <a href="#menu" onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">
              Menu
            </a>
            <a href="#floor-availability" onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">
              Bed Availability
            </a>
            <a href="#facilities" onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">
              Gallery
            </a>
            <a href="#contact-owner" onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* Action Area: Student Login / Book Now OR Student Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">{user.name}</p>
                  <span className="text-[10px] text-purple-400 font-semibold capitalize flex items-center justify-end gap-1">
                    <Sparkles className="w-3 h-3" />
                    Enterprise ERP Admin
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors border border-slate-700/60"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <a
                  href="#floor-availability"
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] sm:text-xs font-bold transition-all shadow-md shadow-purple-600/30"
                >
                  <BedDouble className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Request Booking</span>
                  <span className="sm:hidden">Book</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
