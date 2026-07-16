import React from 'react';
import { Phone, MessageCircle, BedDouble } from 'lucide-react';

const FloatingContactButtons = ({ onOpenBooking }) => {
  const phone = '9494211015';

  return (
    <div className="fixed bottom-[20px] right-[16px] lg:bottom-[24px] lg:right-[24px] z-[9999] flex flex-col gap-4 items-center animate-fade-in">
      
      {/* 3. Request Booking Button */}
      <button
        onClick={() => {
          if (onOpenBooking) {
            onOpenBooking();
          } else {
            window.location.hash = 'floor-availability';
          }
        }}
        className="w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shadow-[0_8px_20px_rgb(249,115,22,0.3)] hover:shadow-[0_12px_25px_rgb(249,115,22,0.4)] hover:scale-[1.08] active:scale-95 transition-all duration-300 group relative"
        title="Request Booking"
      >
        <BedDouble className="w-6 h-6" />
        <span className="absolute right-[75px] px-3 py-1.5 rounded-lg bg-white text-textDark text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-borderLight">
          Request Booking
        </span>
      </button>

      {/* 2. WhatsApp Chat Floating Button */}
      <a
        href={`https://wa.me/91${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white flex items-center justify-center shadow-[0_8px_20px_rgb(37,211,102,0.3)] hover:shadow-[0_12px_25px_rgb(37,211,102,0.4)] hover:scale-[1.08] active:scale-95 transition-all duration-300 group relative"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute right-[75px] px-3 py-1.5 rounded-lg bg-white text-textDark text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-borderLight">
          Chat on WhatsApp
        </span>
      </a>

      {/* 1. Phone Call Floating Button */}
      <a
        href={`tel:+91${phone}`}
        className="w-[60px] h-[60px] rounded-full bg-gradient-to-tr from-blue-700 to-blue-400 text-white flex items-center justify-center shadow-[0_8px_20px_rgb(59,130,246,0.3)] hover:shadow-[0_12px_25px_rgb(59,130,246,0.4)] hover:scale-[1.08] active:scale-95 transition-all duration-300 group relative"
        title="Call Owner"
      >
        <Phone className="w-6 h-6 fill-white" />
        <span className="absolute right-[75px] px-3 py-1.5 rounded-lg bg-white text-textDark text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-borderLight">
          Call Owner
        </span>
      </a>
    </div>
  );
};

export default FloatingContactButtons;
