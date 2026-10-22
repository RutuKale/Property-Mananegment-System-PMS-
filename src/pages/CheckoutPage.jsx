import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  DoorClosed, Search, AlertCircle, Key, Luggage, 
  CalendarDays, User, ArrowRight, Printer, CheckCircle2 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatINR } from '../services/pricingCalculators';

export default function CheckoutPage() {
  const { rooms, bookings } = useHotel();
  const { onOpenCheckout, onPrintInvoice } = useOutletContext();

  const [search, setSearch] = useState('');
  const [filterDueOnly, setFilterDueOnly] = useState(false);

  // Active in-house stays
  const activeStays = useMemo(() => {
    return bookings.filter(b => b.status === 'checked_in' || b.status === 'checkout_due');
  }, [bookings]);

  // Filtered
  const filteredStays = useMemo(() => {
    return activeStays.filter(stay => {
      if (filterDueOnly && stay.status !== 'checkout_due') return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchRoom = String(stay.roomNumber).toLowerCase().includes(q);
        const matchGuest = stay.guestName.toLowerCase().includes(q);
        const matchPhone = (stay.guestPhone || '').toLowerCase().includes(q);
        const matchId = stay.bookingId.toLowerCase().includes(q);
        if (!matchRoom && !matchGuest && !matchPhone && !matchId) return false;
      }
      return true;
    });
  }, [activeStays, filterDueOnly, search]);

  const handleCheckoutClick = (stay) => {
    const room = rooms.find(r => r.roomId === stay.roomId) || {
      roomId: stay.roomId,
      roomNumber: stay.roomNumber,
      category: stay.category,
      pricePerNight: stay.ratePerNight,
      status: stay.status === 'checkout_due' ? 'checkout_due' : 'occupied'
    };
    onOpenCheckout(room);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-display">
              In-House Stays & Checkout Clearance
            </h1>
            <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full border border-rose-300">
              {activeStays.length} Active In-House
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enforces 2-step clearance (keycard return + luggage vacancy check) before transitioning room to Cleaning.
          </p>
        </div>
      </div>

      {/* Search & Due Out Toggle */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Guest Name, Room #, or Booking ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={filterDueOnly}
            onChange={(e) => setFilterDueOnly(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded"
          />
          <span>Show Checkout Due Only (&le; 35 mins departure)</span>
        </label>
      </div>

      {/* Active Stays Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-4">Room & Category</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Stay Timeline</th>
                <th className="py-3 px-4">Total Billed</th>
                <th className="py-3 px-4">Balance Status</th>
                <th className="py-3 px-4 text-right">Clearance Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStays.length > 0 ? (
                filteredStays.map((stay) => {
                  const isDue = stay.status === 'checkout_due';
                  return (
                    <tr key={stay.bookingId} className={`hover:bg-slate-50 transition-colors ${isDue ? 'bg-purple-50/40' : ''}`}>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {stay.roomNumber}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800">{stay.category}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{stay.bookingId}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{stay.guestName}</p>
                        <p className="text-slate-500 text-[11px]">{stay.guestPhone}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="text-slate-700 font-medium">{stay.nights} Night(s)</p>
                        <p className="text-[10px] text-slate-400">
                          {stay.checkInDate} → {stay.expectedCheckoutDate}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {formatINR(stay.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4">
                        {stay.balanceDue > 0 ? (
                          <div>
                            <span className="text-rose-600 font-bold font-mono">
                              Due: {formatINR(stay.balanceDue)}
                            </span>
                            <p className="text-[10px] text-slate-400">Paid: {formatINR(stay.amountPaid)}</p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onPrintInvoice(stay.invoiceNumber || stay.bookingId)}
                            title="Print Tax Invoice"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCheckoutClick(stay)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition-all ${
                              isDue
                                ? 'bg-purple-600 hover:bg-purple-700 text-white animate-pulse'
                                : 'bg-rose-600 hover:bg-rose-700 text-white'
                            }`}
                          >
                            <DoorClosed className="w-3.5 h-3.5" />
                            Checkout & Clear
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No active in-house stays match the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
