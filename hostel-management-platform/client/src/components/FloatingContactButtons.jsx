import React from 'react';
import { Phone, MessageCircle, MapPin } from 'lucide-react';

const FloatingContactButtons = () => {
  const phone = '9494211015';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 items-center">
      {/* Phone Call Floating Button */}
      <a
        href={`tel:+91${phone}`}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white flex items-center justify-center shadow-xl shadow-blue-600/40 border-2 border-white/30 hover:scale-110 transition-all duration-300 group relative"
        title="Call S3 Elite PG Owner"
      >
        <Phone className="w-6 h-6 fill-white text-white" />
        <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-800">
          Call Owner: 9494211015
        </span>
      </a>

      {/* WhatsApp Chat Floating Button */}
      <a
        href={`https://wa.me/91${phone}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#22C55E] hover:bg-[#16A34A] text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 border-2 border-white/30 hover:scale-110 transition-all duration-300 group relative"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white text-white" />
        <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-800">
          WhatsApp S3 Elite PG
        </span>
      </a>

      {/* Location / Maps Floating Button */}
      <a
        href="https://www.google.com/maps/search/?api=1&query=S3+Elite+PG"
        target="_blank"
        rel="noopener noreferrer"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 border-2 border-white/30 hover:scale-110 transition-all duration-300 group relative"
        title="View on Google Maps"
      >
        <MapPin className="w-6 h-6 fill-white text-white" />
        <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-slate-800">
          View on Google Maps
        </span>
      </a>
    </div>
  );
};

export default FloatingContactButtons;
