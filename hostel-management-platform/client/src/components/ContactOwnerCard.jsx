import React from 'react';
import { PhoneCall, MessageCircle, MapPin, ShieldCheck } from 'lucide-react';

const ContactOwnerCard = () => {
  const owner = {
    name: 'Shiva',
    role: 'PG / Hostel Owner',
    phone: '9494211015',
    coordinates: '15.7724378865698, 78.05908726789515'
  };

  const mapUrl = `https://www.google.com/maps?q=${owner.coordinates}`;

  return (
    <div className="glass-card p-5 border border-indigo-500/20 bg-gradient-to-br from-indigo-950/30 to-slate-900/60 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
          S
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white text-lg">{owner.name}</h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified Owner
            </span>
          </div>
          <p className="text-xs text-slate-400">{owner.role} • {owner.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <a
          href={`tel:+91${owner.phone}`}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-600/20"
        >
          <PhoneCall className="w-4 h-4" />
          Call Owner
        </a>
        <a
          href={`https://wa.me/91${owner.phone}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
        >
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </a>
      </div>

      <a
        href={mapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between text-xs text-slate-400 hover:text-indigo-400 py-1.5 px-2 rounded-lg hover:bg-slate-800/40 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
          View PG Location on Google Maps
        </span>
        <span className="text-slate-500">↗</span>
      </a>
    </div>
  );
};

export default ContactOwnerCard;
