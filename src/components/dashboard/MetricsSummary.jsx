import React from 'react';
import { 
  Users, LogIn, LogOut, Percent, IndianRupee, BedDouble, 
  DoorClosed, CalendarClock, Sparkles, Wrench, AlertCircle, 
  SlidersHorizontal, Search
} from 'lucide-react';
import { formatINR } from '../../services/pricingCalculators';
import { useHotel } from '../../context/HotelContext';

export default function MetricsSummary({
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  maxPrice,
  setMaxPrice,
  selectedFloor,
  setSelectedFloor
}) {
  const { metrics, floors } = useHotel();

  const filterButtons = [
    { id: 'all', label: 'All Rooms', count: metrics.totalRooms, color: 'border-slate-300 text-slate-700 bg-white' },
    { id: 'available', label: 'Available', count: metrics.availableRooms, color: 'border-emerald-500 text-emerald-800 bg-emerald-50' },
    { id: 'occupied', label: 'Occupied', count: metrics.occupiedRooms, color: 'border-rose-500 text-rose-800 bg-rose-50' },
    { id: 'checkout_due', label: 'Checkout Due', count: metrics.checkoutDueRooms, color: 'border-purple-500 text-purple-800 bg-purple-50' },
    { id: 'reserved', label: 'Reserved', count: metrics.reservedRooms, color: 'border-amber-500 text-amber-800 bg-amber-50' },
    { id: 'cleaning', label: 'Cleaning', count: metrics.cleaningRooms, color: 'border-slate-400 text-slate-800 bg-slate-100' },
    { id: 'maintenance', label: 'Maintenance', count: metrics.maintenanceRooms, color: 'border-zinc-500 text-zinc-800 bg-zinc-100' }
  ];

  return (
    <div className="space-y-4">
      {/* Top 4 Real-time Operations KPI Cards (PDF Page 6) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        
        {/* Today's Check-ins */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Today's Check-ins</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{metrics.todayCheckIns}</h3>
            <p className="text-[9px] sm:text-[10px] text-emerald-700 font-medium mt-0.5 truncate">Live arrivals</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0 ml-1">
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Today's Check-outs */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Today's Check-outs</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{metrics.todayCheckOuts}</h3>
            <p className="text-[9px] sm:text-[10px] text-rose-700 font-medium mt-0.5 truncate">Departures processed</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 flex-shrink-0 ml-1">
            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Hotel Occupancy Rate */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Occupancy Rate</p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">{metrics.occupancyRate}%</h3>
              <span className="text-[10px] sm:text-[11px] text-slate-600 font-medium">({metrics.occupiedRooms + metrics.checkoutDueRooms}/{metrics.totalRooms})</span>
            </div>
            {/* Progress bar */}
            <div className="w-16 sm:w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-brand-600 rounded-full transition-all duration-500" 
                style={{ width: `${metrics.occupancyRate}%` }} 
              />
            </div>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center border border-brand-100 flex-shrink-0 ml-1">
            <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Today's Front Desk Revenue */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200/90 shadow-sm flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider truncate">Front Desk Revenue</p>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 font-mono truncate">{formatINR(metrics.todayRevenue)}</h3>
            <p className="text-[9px] sm:text-[10px] text-emerald-700 font-medium mt-0.5 truncate">All channels</p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-brand-gold flex items-center justify-center border border-amber-100 flex-shrink-0 ml-1">
            <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

      </div>

      {/* Control Bar: Status Chips + Search + Floor + Price Range Slider */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        
        {/* Top Row: Search & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Room #, Category (e.g. 102, Suite)..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none bg-slate-50 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3">
            {/* Floor Selector */}
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Floor:</span>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                className="w-full sm:w-auto px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:outline-none"
              >
                <option value="all">All Floors</option>
                {floors.map(f => (
                  <option key={f.floorId} value={f.floorId}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Price Range Slider (PDF Page 6: ₹1,000 to ₹15,000) */}
            <div className="flex items-center gap-2.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex-1 sm:flex-initial">
              <SlidersHorizontal className="w-4 h-4 text-slate-600 flex-shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-semibold text-slate-700 gap-2">
                  <span className="truncate">Max:</span>
                  <span className="text-brand-600 font-mono font-bold">{formatINR(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24 sm:w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row: Status Filter Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {filterButtons.map((btn) => {
            const isSelected = statusFilter === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                onClick={() => setStatusFilter(btn.id)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                    : `${btn.color} hover:shadow-sm`
                }`}
              >
                <span>{btn.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-800'
                }`}>
                  {btn.count}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
