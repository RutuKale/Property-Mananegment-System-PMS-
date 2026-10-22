import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Receipt, Printer, Search, ShieldCheck, Download, 
  FileSpreadsheet, IndianRupee, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { formatINR } from '../services/pricingCalculators';

export default function BillingInvoicesPage() {
  const { invoices, hotelSettings } = useHotel();
  const { onPrintInvoice } = useOutletContext();

  const [search, setSearch] = useState('');

  // GST Audit Financial Aggregates (SAC 996311)
  const financialTotals = useMemo(() => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let totalTax = 0;
    let grossTotal = 0;
    let totalCollected = 0;
    let totalOutstanding = 0;

    invoices.forEach(inv => {
      taxable += Number(inv.taxableAmount) || 0;
      cgst += Number(inv.cgstAmount) || 0;
      sgst += Number(inv.sgstAmount) || 0;
      totalTax += Number(inv.taxAmount) || 0;
      grossTotal += Number(inv.totalAmount) || 0;
      totalCollected += Number(inv.amountPaid) || 0;
      totalOutstanding += Number(inv.balanceDue) || 0;
    });

    return {
      taxable,
      cgst,
      sgst,
      totalTax,
      grossTotal,
      totalCollected,
      totalOutstanding
    };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchInv = inv.invoiceNumber.toLowerCase().includes(q);
        const matchGuest = inv.guestName.toLowerCase().includes(q);
        const matchPhone = (inv.guestPhone || '').toLowerCase().includes(q);
        const matchRoom = String(inv.roomNumber).toLowerCase().includes(q);
        const matchBooking = (inv.bookingId || '').toLowerCase().includes(q);
        if (!matchInv && !matchGuest && !matchPhone && !matchRoom && !matchBooking) return false;
      }
      return true;
    });
  }, [invoices, search]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
              GST SAC 996311 Invoicing & Tax Ledger
            </h1>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold font-mono px-2.5 py-0.5 rounded border border-slate-300">
              SAC 996311
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indian Goods & Services Tax compliance audit with 12% statutory split (6% CGST + 6% SGST).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start">
          <span className="text-xs font-mono font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            Property GSTIN: {hotelSettings.gstin}
          </span>
        </div>
      </div>

      {/* Tax Audit Summary Cards (PDF Page 8) */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Taxable Turnover */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Taxable Accommodation Turnover</p>
          <h3 className="text-xl font-black text-slate-900 mt-1 font-mono">
            {formatINR(financialTotals.taxable)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Base Tariff + Incidentals - Discounts</p>
        </div>

        {/* CGST Collected (6%) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Central GST (CGST 6%)</p>
          <h3 className="text-xl font-black text-brand-600 mt-1 font-mono">
            {formatINR(financialTotals.cgst)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Statutory Central Pool</p>
        </div>

        {/* SGST Collected (6%) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">State GST (SGST 6%)</p>
          <h3 className="text-xl font-black text-brand-600 mt-1 font-mono">
            {formatINR(financialTotals.sgst)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Statutory State Pool</p>
        </div>

        {/* Gross Billed Volume */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Gross Invoiced Revenue</p>
          <h3 className="text-xl font-black text-emerald-600 mt-1 font-mono">
            {formatINR(financialTotals.grossTotal)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Collected: {formatINR(financialTotals.totalCollected)}
          </p>
        </div>

      </div>

      {/* Invoices Toolbar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Invoice #, Guest Name, Room, Booking Ref..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing <strong>{filteredInvoices.length}</strong> official tax invoices
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Guest Name</th>
                <th className="py-3 px-4">Room #</th>
                <th className="py-3 px-4">Taxable Value</th>
                <th className="py-3 px-4">CGST + SGST</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Balance Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(inv.generatedAt || Date.now()).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{inv.guestName}</p>
                      <p className="text-[11px] text-slate-500">{inv.guestPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      Room {inv.roomNumber}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      {formatINR(inv.taxableAmount)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      <div>₹{inv.cgstAmount} (6%)</div>
                      <div>₹{inv.sgstAmount} (6%)</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {formatINR(inv.totalAmount)}
                    </td>

                    <td className="py-3.5 px-4">
                      {inv.balanceDue > 0 ? (
                        <span className="text-rose-600 font-bold font-mono">
                          Due: {formatINR(inv.balanceDue)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onPrintInvoice(inv)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print Folio
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No tax invoices match your search.
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
