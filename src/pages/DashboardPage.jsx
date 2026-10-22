import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import MetricsSummary from '../components/dashboard/MetricsSummary';
import RoomTile from '../components/dashboard/RoomTile';
import { useHotel } from '../context/HotelContext';
import { filterRooms } from '../services/roomService';
import { Building2, Layers, AlertCircle, Plus, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { rooms, floors, metrics } = useHotel();
  const { onOpenCheckIn, onOpenCheckout, onOpenRoomDetails } = useOutletContext();

  // Filters State
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(15000);
  const [selectedFloor, setSelectedFloor] = useState('all');

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return filterRooms(rooms, {
      statusFilter,
      searchQuery,
      maxPrice,
      floorId: selectedFloor
    });
  }, [rooms, statusFilter, searchQuery, maxPrice, selectedFloor]);

  // Group rooms by floor (redBus spatial layout architecture from PDF Page 2 & 6)
  const floorGroups = useMemo(() => {
    return floors.map(floor => {
      const floorRooms = filteredRooms.filter(r => r.floorId === floor.floorId);
      return {
        ...floor,
        rooms: floorRooms
      };
    }).filter(group => selectedFloor === 'all' || group.floorId === selectedFloor);
  }, [floors, filteredRooms, selectedFloor]);

  // Handle Room Click based on operational status (PDF Page 6)
  const handleRoomClick = (room) => {
    switch (room.status) {
      case 'available':
        onOpenCheckIn(room);
        break;
      case 'occupied':
      case 'checkout_due':
        onOpenCheckout(room);
        break;
      case 'reserved':
      case 'cleaning':
      case 'maintenance':
        onOpenRoomDetails(room);
        break;
      default:
        onOpenRoomDetails(room);
        break;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Title & Operational Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
              Visual Room Map
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200 font-bold">
              redBus Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-floor spatial inventory grid with sub-second reactive state synchronization.
          </p>
        </div>

        {/* Quick Legend Indicator */}
        <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto scrollbar-none whitespace-nowrap max-w-full">
          <span className="flex items-center gap-1 font-semibold text-emerald-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-800 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Occupied
          </span>
          <span className="flex items-center gap-1 font-semibold text-purple-800 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" /> Due Out
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-800 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Reserved
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-800 ml-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Cleaning
          </span>
        </div>
      </div>

      {/* 9 KPI Operational Bar & Filter Controls */}
      <MetricsSummary
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        selectedFloor={selectedFloor}
        setSelectedFloor={setSelectedFloor}
      />

      {/* Multi-Floor Spatial Layout (redBus Architecture) */}
      <div className="space-y-6">
        {floorGroups.map((floor) => {
          if (floor.rooms.length === 0 && (searchQuery || statusFilter !== 'all')) {
            return null; // hide empty floors when filtered
          }

          return (
            <div 
              key={floor.floorId} 
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Floor Header Ribbon */}
              <div className="bg-slate-900 text-white px-4 sm:px-5 py-3 flex items-center justify-between border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded bg-slate-800 text-amber-400 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                    {floor.floorNumber}F
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 truncate">
                      <span>{floor.name}</span>
                      <span className="text-[10px] font-normal text-slate-400 hidden sm:inline truncate">
                        — {floor.description}
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 text-xs flex-shrink-0">
                  <span className="text-slate-400 text-[10px] sm:text-[11px]">
                    {floor.rooms.length} room{floor.rooms.length !== 1 ? 's' : ''}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Floor Room Cards Grid */}
              <div className="p-3.5 sm:p-5">
                {floor.rooms.length > 0 ? (
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
                    {floor.rooms.map((room) => (
                      <RoomTile
                        key={room.roomId}
                        room={room}
                        onClick={handleRoomClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No rooms on this floor match the selected filter criteria.
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredRooms.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Rooms Match Your Filter</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your price range slider, resetting the status filters, or clearing your search term.
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
                setMaxPrice(15000);
                setSelectedFloor('all');
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
