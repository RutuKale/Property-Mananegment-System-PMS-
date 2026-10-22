import React, { useState, useMemo } from 'react';
import { 
  IndianRupee, CreditCard, QrCode, FileText, Smartphone, 
  Search, ArrowDownRight, CheckCircle2, Filter 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatINR } from '../services/pricingCalculators';

export default function PaymentHistoryPage() {
  const { payments } = useHotel();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  // Breakdown by Method
  const methodTotals = useMemo(() => {
    const summary = {
      total: 0,
      upi: 0,
      cash: 0,
      razorpay: 0,
      card: 0
    };

    payments.forEach(p => {
      const amt = Number(p.amount) || 0;
      summary.total += amt;
      const m = (p.paymentMethod || '').toLowerCase();
      if (m.includes('upi')) summary.upi += amt;
      else if (m.includes('cash')) summary.cash += amt;
      else if (m.includes('razorpay')) summary.razorpay += amt;
      else if (m.includes('card') || m.includes('pos')) summary.card += amt;
    });

    return summary;
  }, [payments]);

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      if (methodFilter !== 'all') {
        if (!p.paymentMethod?.toLowerCase().includes(methodFilter.toLowerCase())) {
          return false;
        }
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchGuest = p.guestName?.toLowerCase().includes(q);
        const matchTxn = p.transactionId?.toLowerCase().includes(q);
        const matchRef = (p.referenceId || '').toLowerCase().includes(q);
        const matchBooking = (p.bookingId || '').toLowerCase().includes(q);
        if (!matchGuest && !matchTxn && !matchRef && !matchBooking) return false;
      }
      return true;
    });
  }, [payments, methodFilter, search]);

  const getMethodIcon = (method = '') => {
    const m = method.toLowerCase();
    if (m.includes('upi')) return <QrCode className="w-4 h-4 text-emerald-600" />;
    if (m.includes('razorpay')) return <Smartphone className="w-4 h-4 text-brand-600" />;
    if (m.includes('card') || m.includes('pos')) return <CreditCard className="w-4 h-4 text-purple-600" />;
    return <FileText className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
          Multi-Channel Payment Ledger
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete transaction audit across Cash Register, Dynamic UPI QR, Razorpay Online Gateway, and Card POS.
        </p>
      </div>

      {/* 4 Method Aggregate Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Ledger */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Settlements</span>
            <IndianRupee className="w-4 h-4" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {formatINR(methodTotals.total)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{payments.length} transactions processed</p>
        </div>

        {/* UPI QR Volume */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">UPI QR Volume</span>
            <QrCode className="w-4 h-4" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            {formatINR(methodTotals.upi)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Scanned upi:// settlements</p>
        </div>

        {/* Razorpay Gateway */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-brand-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Razorpay Gateway</span>
            <Smartphone className="w-4 h-4" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-brand-700 font-mono">
            {formatINR(methodTotals.razorpay)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Verified HMAC SHA-256 cards & netbanking</p>
        </div>

        {/* Cash & POS Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-purple-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cash & POS Cards</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-purple-700 font-mono">
            {formatINR(methodTotals.cash + methodTotals.card)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Cash: {formatINR(methodTotals.cash)} • POS: {formatINR(methodTotals.card)}</p>
        </div>

      </div>

      {/* Search & Channel Filters */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Transaction ID, Guest Name, Ref ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'UPI', 'Razorpay', 'Cash', 'Card'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                methodFilter === m
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'all' ? 'All Channels' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Booking Ref</th>
                <th className="py-3 px-4">Channel / Method</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Reference ID</th>
                <th className="py-3 px-4 text-right">Amount Settled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.transactionId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.transactionId}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(p.timestamp).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {p.guestName || 'Guest'}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {p.bookingId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        {getMethodIcon(p.paymentMethod)}
                        <span>{p.paymentMethod}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.paymentType || 'Settlement'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                      {p.referenceId || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      {formatINR(p.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No payment records match your filters.
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
