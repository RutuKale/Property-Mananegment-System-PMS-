import React, { useState } from 'react';
import { 
  X, BedDouble, CalendarClock, Sparkles, Wrench, CheckCircle, 
  User, Check, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react';
import { formatINR } from '../../services/pricingCalculators';
import { useHotel } from '../../context/HotelContext';
import { useToast } from '../../context/ToastContext';

export default function RoomDetailsModal({ room, isOpen, onClose, onLaunchCheckIn }) {
  const { bookings, housekeepingTasks, completeHousekeepingSanitization, resolveMaintenance } = useHotel();
  const { showSuccess } = useToast();

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !room) return null;

  // Find linked booking if active
  const linkedBooking = bookings.find(b => 
    (b.id === room.activeBookingId || b.bookingId === room.activeBookingId) ||
    (room.status === 'reserved' && b.roomId === room.roomId && b.status === 'reserved')
  );

  // Find linked housekeeping or maintenance task
  const linkedTask = housekeepingTasks.find(t => t.roomId === room.roomId && t.status !== 'completed');

  // Handle sanitization completion
  const handleCompleteSanitization = () => {
    setSubmitting(true);
    completeHousekeepingSanitization(linkedTask?.taskId || `hk-${Date.now()}`, room.roomId);
    showSuccess(`Room ${room.roomNumber} sanitization certified! Status restored to Available (Emerald Green).`);
    setSubmitting(false);
    onClose();
  };

  // Handle maintenance resolution
  const handleResolveMaintenance = () => {
    setSubmitting(true);
    resolveMaintenance(room.roomId, "Engineering overhaul verified and inspected");
    showSuccess(`Room ${room.roomNumber} engineering defect resolved! Status restored to Available.`);
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 max-h-[95vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${
              room.status === 'reserved' ? 'bg-amber-500/20 text-amber-400' :
              room.status === 'cleaning' ? 'bg-slate-500/20 text-slate-300' :
              'bg-zinc-500/20 text-zinc-300'
            }`}>
              {room.status === 'reserved' && <CalendarClock className="w-5 h-5" />}
              {room.status === 'cleaning' && <Sparkles className="w-5 h-5" />}
              {room.status === 'maintenance' && <Wrench className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 truncate">
                <span>Room {room.roomNumber}</span>
                <span className="text-[10px] sm:text-xs uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex-shrink-0">
                  {room.status.replace('_', ' ')}
                </span>
              </h3>
              <p className="text-xs text-slate-400 truncate">
                {room.category} • {formatINR(room.pricePerNight)} / night
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs text-slate-600 overflow-y-auto flex-1">
          
          {/* Room Specs */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400">Bed Category:</span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{room.bedType || 'King Bed'}</p>
            </div>
            <div>
              <span className="text-slate-400">Nightly Rate:</span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{formatINR(room.pricePerNight)}</p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400">Amenities:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {room.amenities?.map((am, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-700">
                    {am}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reserved Status View */}
          {room.status === 'reserved' && (
            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase">
                <CalendarClock className="w-4 h-4 text-amber-600" />
                Advance Reservation Details
              </div>
              {linkedBooking ? (
                <div className="space-y-1.5 text-xs">
                  <p>Guest: <strong className="text-slate-900">{linkedBooking.guestName}</strong> ({linkedBooking.guestPhone})</p>
                  <p>Dates: <strong className="text-slate-900">{linkedBooking.checkInDate} to {linkedBooking.expectedCheckoutDate}</strong> ({linkedBooking.nights} nights)</p>
                  <p>Booking ID: <strong className="font-mono text-slate-900">{linkedBooking.bookingId}</strong></p>
                  <p>Deposit Paid: <strong className="text-emerald-700">{formatINR(linkedBooking.amountPaid)}</strong></p>
                </div>
              ) : (
                <p className="text-slate-500">Reserved for VIP arrival. Awaiting check-in authorization.</p>
              )}
            </div>
          )}

          {/* Cleaning Status View */}
          {room.status === 'cleaning' && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-slate-900 font-bold text-xs uppercase">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  Housekeeping Sanitization Checklist
                </span>
                <span className="text-[10px] text-slate-500">
                  {linkedTask?.taskType || 'Deep Sanitization'}
                </span>
              </div>

              <div className="space-y-2">
                {(linkedTask?.checklist || [
                  { item: 'Ozone air purification & linen replacement', completed: true },
                  { item: 'Hospital-grade bathroom chemical disinfection', completed: false },
                  { item: 'Minibar audit & welcome amenities arrangement', completed: false },
                  { item: 'Final Floor Captain inspection & seal', completed: false }
                ]).map((chk, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 p-2 bg-white rounded border border-slate-200">
                    <div className={`w-4 h-4 rounded flex items-center justify-center text-white text-[10px] ${
                      chk.completed ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}>
                      {chk.completed ? <Check className="w-3 h-3" /> : ''}
                    </div>
                    <span className={`text-xs ${chk.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                      {chk.item}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500">
                Clicking complete will certify sanitization, clear the queue, and restore the room to <strong>Available (Emerald Green)</strong>.
              </p>
            </div>
          )}

          {/* Maintenance Status View */}
          {room.status === 'maintenance' && (
            <div className="bg-zinc-100 border border-zinc-300 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs uppercase">
                <Wrench className="w-4 h-4 text-zinc-600" />
                Engineering Defect Log
              </div>
              <div className="p-3 bg-white rounded-lg border border-zinc-200">
                <p className="font-semibold text-zinc-800">Defect Description:</p>
                <p className="text-zinc-600 mt-1">
                  {room.maintenanceNotes || linkedTask?.notes || "HVAC air conditioning diagnostic check & refrigerant refill."}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Actions */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-200 gap-2 sm:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 text-center"
          >
            Close
          </button>

          {room.status === 'cleaning' && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleCompleteSanitization}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center justify-center gap-2 shadow transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Certify Sanitization & Make Available
            </button>
          )}

          {room.status === 'maintenance' && (
            <button
              type="button"
              disabled={submitting}
              onClick={handleResolveMaintenance}
              className="px-5 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-900 rounded-lg flex items-center justify-center gap-2 shadow transition-all"
            >
              <Wrench className="w-4 h-4" />
              Resolve Defect & Make Available
            </button>
          )}

          {room.status === 'reserved' && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLaunchCheckIn?.(room);
              }}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center justify-center gap-2 shadow transition-all"
            >
              Check-In Reservation
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
