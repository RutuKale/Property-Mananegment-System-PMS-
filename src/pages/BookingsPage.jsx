import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  CalendarDays, Search, Printer, FileText, CheckCircle2, 
  DoorClosed, CalendarClock, ArrowUpRight, Filter 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatINR } from '../services/pricingCalculators';

export default function BookingsPage() {
  const { bookings } = useHotel();
  const { onPrintInvoice } = useOutletContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchGuest = b.guestName.toLowerCase().includes(q);
        const matchRoom = String(b.roomNumber).toLowerCase().includes(q);
        const matchBooking = b.bookingId.toLowerCase().includes(q);
        const matchPhone = (b.guestPhone || '').toLowerCase().includes(q);
        if (!matchGuest && !matchRoom && !matchBooking && !matchPhone) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, search]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'checked_in':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Checked In</span>;
      case 'checked_out':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">Checked Out</span>;
      case 'checkout_due':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">Checkout Due</span>;
      case 'reserved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Reserved</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
            Bookings & Guest Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical and active reservations, SAC 996311 billing records, and guest folio audit.
          </p>
        </div>
        <div className="text-xs text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm self-start">
          Total Bookings: <strong className="text-slate-900">{bookings.length}</strong>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Guest Name, Room #, Phone or Booking ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['all', 'checked_in', 'checked_out', 'reserved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Stays' : st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Room #</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Stay Timeline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total Tariff</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4 text-right">Tax Folio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {b.bookingId}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {b.roomNumber}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{b.category}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{b.guestName}</p>
                      <p className="text-slate-500 text-[11px]">{b.guestPhone}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="text-slate-700 font-medium">{b.nights} Night(s)</p>
                      <p className="text-[10px] text-slate-400">
                        {b.checkInDate} → {b.actualCheckoutDate || b.expectedCheckoutDate}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(b.status)}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-slate-900">{formatINR(b.totalAmount)}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">Paid: {formatINR(b.amountPaid)}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {b.invoiceNumber || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onPrintInvoice(b.invoiceNumber || b.bookingId)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto transition-colors shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Invoice
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No bookings found matching query.
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
