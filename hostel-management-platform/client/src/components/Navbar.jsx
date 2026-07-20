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
  PhoneCall,
  Calendar
} from 'lucide-react';

const Navbar = ({ user, onLogout, currentView, setCurrentView, onOpenAuth, onOpenRenewRent }) => {
  return (
    <nav className="glass-header">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group"
            onClick={() => setCurrentView('home')}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-105">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-textDark">
                S3 Elite <span className="text-primary font-extrabold hidden sm:inline">PG</span>
              </span>
              <p className="text-[10px] text-textMuted tracking-wider uppercase font-semibold hidden sm:block">Comfort, Care, Career, Success</p>
            </div>
          </div>

          {/* Public Navigation Links (Home, Facilities, Bed Availability, Gallery, Contact) */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-semibold text-textMuted">
            <a href="#" onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
              Home
            </a>
            <a href="#services" onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
              Facilities
            </a>
            <a href="#floor-availability" onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
              Bed Availability
            </a>
            <a href="#" onClick={(e) => {
              e.preventDefault();
              alert("Gallery section is coming soon!");
            }} className="hover:text-primary transition-colors">
              Gallery
            </a>
            <a href="#contact" onClick={() => setCurrentView('home')} className="hover:text-primary transition-colors">
              Contact
            </a>
          </div>

          {/* Action Area: Student Login / Book Now OR Student Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-textDark">{user.name}</p>
                  <span className="text-[10px] text-primary font-semibold capitalize flex items-center justify-end gap-1">
                    <Sparkles className="w-3 h-3" />
                    Enterprise ERP Admin
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-textMuted transition-colors border border-borderLight"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                <button
                  onClick={onOpenRenewRent}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white border border-borderLight hover:border-primary text-primary text-[10px] sm:text-xs font-bold transition-all shadow-sm hover:shadow-md"
                >
                  <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Renew / Pay Rent</span>
                  <span className="sm:hidden">Renew</span>
                </button>
                <a
                  href="#floor-availability"
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-[10px] sm:text-xs font-bold transition-all shadow-md shadow-orange-500/30 hover:scale-[1.03] hover:shadow-orange-500/40"
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
