import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  UserCheck, BedDouble, Search, Filter, Sparkles, 
  CheckCircle2, ArrowRight, ShieldCheck, Wifi 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatINR } from '../services/pricingCalculators';

export default function WalkInCheckInPage() {
  const { rooms, floors } = useHotel();
  const { onOpenCheckIn } = useOutletContext();

  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  // Available ready rooms only
  const availableRooms = useMemo(() => {
    return rooms.filter(r => r.status === 'available');
  }, [rooms]);

  // Categories present
  const categories = useMemo(() => {
    return Array.from(new Set(rooms.map(r => r.category))).filter(Boolean);
  }, [rooms]);

  // Filtered ready rooms
  const filteredAvailable = useMemo(() => {
    return availableRooms.filter(r => {
      if (selectedFloor !== 'all' && r.floorId !== selectedFloor) return false;
      if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!r.roomNumber.toLowerCase().includes(q) && !(r.category || '').toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [availableRooms, selectedFloor, selectedCategory, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
              Ready Rooms Walk-In Inventory
            </h1>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
              {availableRooms.length} Available
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse fully sanitized rooms ready for immediate walk-in guest check-in & tariff quoting.
          </p>
        </div>

        <button
          onClick={() => availableRooms.length > 0 && onOpenCheckIn(availableRooms[0])}
          disabled={availableRooms.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 self-start"
        >
          <UserCheck className="w-4 h-4" />
          Quick Check-In First Ready Room
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room number or category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="all">All Floors</option>
            {floors.map(f => (
              <option key={f.floorId} value={f.floorId}>{f.name}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Ready Rooms Grid */}
      {filteredAvailable.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAvailable.map((room) => {
            const floorObj = floors.find(f => f.floorId === room.floorId);
            return (
              <div 
                key={room.roomId}
                className="bg-white rounded-xl border border-emerald-500/40 p-5 shadow-sm hover:shadow-luxury transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-600">
                        {floorObj?.name || 'Floor'}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 leading-tight">
                        Room {room.roomNumber}
                      </h3>
                    </div>
                    <span className="text-sm font-black text-emerald-800 font-mono">
                      {formatINR(room.pricePerNight)}
                      <span className="text-[10px] text-slate-600 font-normal"> / nt</span>
                    </span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-bold text-slate-800">{room.category}</p>
                    <p className="text-[11px] text-slate-600">{room.bedType || 'King Bed'}</p>
                  </div>

                  {/* Amenities */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {room.amenities?.slice(0, 3).map((am, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded">
                        {am}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Sanitized & Inspected
                  </span>

                  <button
                    onClick={() => onOpenCheckIn(room)}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 shadow-sm transition-all"
                  >
                    Check-In
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <BedDouble className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No Ready Rooms Match Selection</h4>
          <p className="text-xs text-slate-500 mt-1">
            All rooms may be occupied or undergoing housekeeping sanitization.
          </p>
        </div>
      )}

    </div>
  );
}
