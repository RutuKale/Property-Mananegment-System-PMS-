import React from 'react';
import { 
  BedDouble, DoorClosed, CalendarClock, Sparkles, Wrench, AlertCircle, Wifi 
} from 'lucide-react';
import { formatINR } from '../../services/pricingCalculators';
import { STATUS_METADATA } from '../../services/roomService';

export default function RoomTile({ room, onClick }) {
  const meta = STATUS_METADATA[room.status] || STATUS_METADATA.available;

  // Icon corresponding to operational status (PDF Page 6)
  const renderStatusIcon = () => {
    switch (room.status) {
      case 'available':
        return <BedDouble className="w-4 h-4" />;
      case 'occupied':
        return <DoorClosed className="w-4 h-4" />;
      case 'reserved':
        return <CalendarClock className="w-4 h-4" />;
      case 'cleaning':
        return <Sparkles className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      case 'checkout_due':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <BedDouble className="w-4 h-4" />;
    }
  };

  // Specific visual classes matching PDF Section 5
  const getThemeClasses = () => {
    switch (room.status) {
      case 'available':
        return {
          cardBorder: 'border-emerald-500 hover:border-emerald-600',
          bgTint: 'bg-emerald-50/40 hover:bg-emerald-50/80',
          numberColor: 'text-emerald-950',
          ribbonBg: 'bg-emerald-600 text-white',
          badgeBg: 'bg-emerald-100 text-emerald-800'
        };
      case 'occupied':
        return {
          cardBorder: 'border-rose-500 hover:border-rose-600',
          bgTint: 'bg-rose-50/40 hover:bg-rose-50/80',
          numberColor: 'text-rose-950',
          ribbonBg: 'bg-rose-600 text-white',
          badgeBg: 'bg-rose-100 text-rose-800'
        };
      case 'reserved':
        return {
          cardBorder: 'border-amber-500 hover:border-amber-600',
          bgTint: 'bg-amber-50/40 hover:bg-amber-50/80',
          numberColor: 'text-amber-950',
          ribbonBg: 'bg-amber-500 text-white',
          badgeBg: 'bg-amber-100 text-amber-800'
        };
      case 'cleaning':
        return {
          cardBorder: 'border-slate-400 hover:border-slate-500',
          bgTint: 'bg-slate-50/60 hover:bg-slate-100/80',
          numberColor: 'text-slate-800',
          ribbonBg: 'bg-slate-600 text-white',
          badgeBg: 'bg-slate-200 text-slate-800'
        };
      case 'maintenance':
        return {
          cardBorder: 'border-zinc-500 hover:border-zinc-600',
          bgTint: 'bg-zinc-100/60 hover:bg-zinc-200/80',
          numberColor: 'text-zinc-900',
          ribbonBg: 'bg-zinc-700 text-white',
          badgeBg: 'bg-zinc-200 text-zinc-800'
        };
      case 'checkout_due':
        return {
          cardBorder: 'border-purple-500 hover:border-purple-600',
          bgTint: 'bg-purple-50/50 hover:bg-purple-50/90',
          numberColor: 'text-purple-950',
          ribbonBg: 'bg-purple-600 text-white animate-pulse',
          badgeBg: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          cardBorder: 'border-slate-300',
          bgTint: 'bg-white',
          numberColor: 'text-slate-900',
          ribbonBg: 'bg-slate-800 text-white',
          badgeBg: 'bg-slate-100 text-slate-700'
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <div
      onClick={() => onClick?.(room)}
      style={{ height: '205px' }}
      className={`group relative flex flex-col justify-between rounded-xl border-2 transition-all duration-200 cursor-pointer select-none overflow-hidden shadow-card-tile hover:shadow-luxury hover:-translate-y-1 ${theme.cardBorder} ${theme.bgTint}`}
    >
      {/* Top Header inside tile */}
      <div className="p-3.5 pb-0">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-600">
              Room
            </span>
            <h4 className={`text-2xl font-black tracking-tight leading-none ${theme.numberColor}`}>
              {room.roomNumber}
            </h4>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-slate-900 font-mono">
              {formatINR(room.pricePerNight)}
            </span>
            <p className="text-[9px] text-slate-600 font-medium -mt-0.5">/ night</p>
          </div>
        </div>

        {/* Category & Bed Type */}
        <div className="mt-2.5">
          <p className="text-xs font-bold text-slate-800 truncate" title={room.category}>
            {room.category}
          </p>
          <p className="text-[11px] text-slate-600 truncate mt-0.5">
            {room.bedType || 'King Bed'}
          </p>
        </div>

        {/* Amenities preview */}
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-600">
          <Wifi className="w-3 h-3 text-slate-600" />
          <span className="truncate max-w-[140px] text-slate-600">
            {room.amenities ? room.amenities[0] : 'High-speed WiFi'}
          </span>
        </div>
      </div>

      {/* Distinct Bottom-Anchored Operational Status Ribbon (PDF Page 6) */}
      <div className={`w-full py-1.5 px-3 flex items-center justify-between font-semibold text-[11px] tracking-wide uppercase shadow-sm ${theme.ribbonBg}`}>
        <span className="flex items-center gap-1.5">
          {renderStatusIcon()}
          <span>{meta.label}</span>
        </span>
        <span className="text-[10px] opacity-80 font-normal group-hover:opacity-100 transition-opacity">
          Click →
        </span>
      </div>
    </div>
  );
}
