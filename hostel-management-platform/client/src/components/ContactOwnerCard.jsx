import React from 'react';
import { PhoneCall, MessageCircle, MapPin, ShieldCheck, Clock, Building, Navigation2, Map } from 'lucide-react';

const ContactOwnerCard = () => {
  const owner = {
    name: 'Shiva',
    role: 'PG / Hostel Owner',
    phone: '9494211015',
    coordinates: '15.7724378865698, 78.05908726789515'
  };

  const mapUrl = `https://www.google.com/maps?q=${owner.coordinates}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${owner.coordinates}`;
  const embedUrl = `https://maps.google.com/maps?q=${owner.coordinates}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Verified Owner Card */}
      <div className="glass-card p-5 lg:p-6 border-borderLight bg-white shadow-sm rounded-2xl">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-orange-500/30">
            S
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-textDark text-xl">{owner.name}</h4>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-primary border border-orange-200 tracking-wide uppercase">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Verified Owner
              </span>
            </div>
            <p className="text-sm text-textMuted font-medium">{owner.role} • {owner.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href={`tel:+91${owner.phone}`}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primaryHover text-white text-sm font-bold transition-all shadow-md shadow-orange-500/20 hover:-translate-y-0.5"
          >
            <PhoneCall className="w-4 h-4" />
            Call Owner
          </a>
          <a
            href={`https://wa.me/91${owner.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold transition-all shadow-md shadow-green-600/20 hover:-translate-y-0.5"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
        </div>
      </div>

      {/* 2. Premium Location Card */}
      <div className="glass-card p-5 lg:p-6 border-borderLight bg-white shadow-sm rounded-2xl flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h4 className="font-bold text-textDark text-lg">Find S3 Elite PG</h4>
        </div>
        
        {/* Embedded Google Map */}
        <div className="w-full h-[250px] sm:h-[300px] rounded-[16px] overflow-hidden shadow-inner border border-slate-100 mb-6 relative bg-slate-50">
          <iframe
            title="S3 Elite PG Location"
            src={embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0"
          ></iframe>
        </div>


        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primaryHover text-white text-sm font-bold transition-all shadow-md shadow-orange-500/20 hover:-translate-y-0.5"
          >
            <Map className="w-4 h-4" />
            Open in Google Maps
          </a>
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200 text-sm font-bold transition-all hover:-translate-y-0.5"
          >
            <Navigation2 className="w-4 h-4" />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactOwnerCard;
