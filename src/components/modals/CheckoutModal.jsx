import React, { useState, useMemo } from 'react';
import { 
  X, CheckCircle, DoorClosed, AlertCircle, Key, Luggage, 
  Plus, Trash2, Printer, CreditCard, QrCode, FileText, 
  ShieldAlert, Sparkles, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatINR } from '../../services/pricingCalculators';
import { generateUpiUri } from '../../services/paymentService';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CheckoutModal({ room, booking, isOpen, onClose, onCheckoutSuccess, onPrintInvoice }) {
  const { hotelSettings, performCheckout } = useHotel();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [submitting, setSubmitting] = useState(false);

  // Clearance Checklist
  const [keycardReturned, setKeycardReturned] = useState(true);
  const [luggageCleared, setLuggageCleared] = useState(true);
  const [managerOverrideReason, setManagerOverrideReason] = useState('');

  // Incidentals list (e.g., Dining, Laundry, Minibar, Damage)
  const [incidentals, setIncidentals] = useState([]);
  const [newIncidentalType, setNewIncidentalType] = useState('Dining');
  const [newIncidentalAmount, setNewIncidentalAmount] = useState('');
  const [newIncidentalNote, setNewIncidentalNote] = useState('');

  // Settlement Method
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [referenceId, setReferenceId] = useState('');

  // Calculate incidentals subtotal and tax
  const incidentalsTotal = useMemo(() => {
    return incidentals.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }, [incidentals]);

  const incidentalTax = useMemo(() => {
    return Math.round(incidentalsTotal * 0.12 * 100) / 100;
  }, [incidentalsTotal]);

  // Overall Total & Net Dues
  const currentTotalAmount = (booking?.totalAmount || 0) + incidentalsTotal + incidentalTax;
  const currentPaid = booking?.amountPaid || 0;
  const netBalanceDue = Math.max(0, currentTotalAmount - currentPaid);

  // Dynamic UPI URI for settling remaining balance
  const upiUri = useMemo(() => {
    return generateUpiUri({
      upiId: hotelSettings.upiId || 'urstay@icici',
      payeeName: hotelSettings.tradeName || hotelSettings.name,
      amount: netBalanceDue,
      transactionNote: `Room ${room?.roomNumber} Departure Settlement`
    });
  }, [hotelSettings, netBalanceDue, room]);

  if (!isOpen || !room || !booking) return null;

  // Add incidental entry
  const handleAddIncidental = (e) => {
    e.preventDefault();
    const amt = Number(newIncidentalAmount);
    if (!amt || amt <= 0) return;

    setIncidentals(prev => [
      ...prev,
      {
        id: `inc_${Date.now()}`,
        type: newIncidentalType,
        amount: amt,
        note: newIncidentalNote || newIncidentalType
      }
    ]);
    setNewIncidentalAmount('');
    setNewIncidentalNote('');
  };

  const handleRemoveIncidental = (id) => {
    setIncidentals(prev => prev.filter(item => item.id !== id));
  };

  // Execute Checkout
  const handleExecuteCheckout = async () => {
    if (!luggageCleared) {
      showError("Guest luggage clearance and room vacancy must be confirmed before departure.");
      return;
    }

    if (!keycardReturned && (!managerOverrideReason || !managerOverrideReason.trim())) {
      showError("Keycard not returned. A Manager Override Reason is strictly mandatory.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await performCheckout({
        booking,
        room,
        finalPayment: netBalanceDue > 0 ? {
          amount: netBalanceDue,
          paymentMethod,
          referenceId: referenceId || (paymentMethod === 'UPI' ? 'UPI-SETTLE-' + Date.now().toString().slice(-6) : '')
        } : null,
        incidentalsList: incidentals,
        keycardReturned,
        managerOverrideReason,
        currentUser
      });

      showSuccess(`Room ${room.roomNumber} checkout cleared. Room status set to Cleaning.`);
      onCheckoutSuccess?.(result);
      onClose();
    } catch (err) {
      showError(err.message || "Failed to process checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 flex-shrink-0">
              <DoorClosed className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 truncate">
                <span className="truncate">Checkout & Clearance</span>
                <span className="text-[10px] sm:text-xs bg-rose-950 text-rose-300 font-mono px-2 sm:px-2.5 py-0.5 rounded-full border border-rose-800 flex-shrink-0">
                  Room {room.roomNumber}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                In-house Guest: <strong className="text-white">{booking.guestName}</strong> ({booking.guestPhone})
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

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 space-y-4 sm:space-y-6 bg-slate-50/50">
          
          {/* Stay Overview Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Stay Reference</span>
              <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">{booking.bookingId}</p>
            </div>
            <div>
              <span className="text-slate-400">Duration</span>
              <p className="font-semibold text-slate-900 text-sm mt-0.5">{booking.nights} Night(s)</p>
            </div>
            <div>
              <span className="text-slate-400">Check-in Date</span>
              <p className="font-semibold text-slate-900 mt-0.5">{booking.checkInDate}</p>
            </div>
            <div>
              <span className="text-slate-400">Advance Paid</span>
              <p className="font-semibold text-emerald-600 text-sm mt-0.5">{formatINR(booking.amountPaid)}</p>
            </div>
          </div>

          {/* Section 1: Incidentals Recording */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-600" />
                Record Incidental Charges (Dining, Minibar, Laundry, Damages)
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                Incidental Subtotal: <strong className="text-slate-900">{formatINR(incidentalsTotal)}</strong>
              </span>
            </div>

            {/* Incidentals Table */}
            {incidentals.length > 0 && (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
                {incidentals.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between bg-slate-50">
                    <div>
                      <span className="font-semibold text-slate-800">{item.type}</span>
                      <span className="text-slate-500 ml-2">— {item.note}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{formatINR(item.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIncidental(item.id)}
                        className="text-rose-500 hover:text-rose-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Incidental Form */}
            <form onSubmit={handleAddIncidental} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
              <div>
                <select
                  value={newIncidentalType}
                  onChange={(e) => setNewIncidentalType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Dining & In-Room Service">Dining & Food</option>
                  <option value="Laundry & Dry Cleaning">Laundry & Pressing</option>
                  <option value="Minibar Consumption">Minibar Restock</option>
                  <option value="Property Damage / Loss">Property Damage</option>
                  <option value="Spa & Wellness">Spa & Wellness</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  min="1"
                  value={newIncidentalAmount}
                  onChange={(e) => setNewIncidentalAmount(e.target.value)}
                  placeholder="Amount (₹)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newIncidentalNote}
                  onChange={(e) => setNewIncidentalNote(e.target.value)}
                  placeholder="Notes / Order #"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Add Charge
              </button>
            </form>
          </div>

          {/* Section 2: Final Settlement & Dues */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Final Bill Settlement (GST SAC 996311)
            </h4>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-slate-50 rounded-xl border border-slate-200 gap-4">
              <div className="space-y-1 text-xs text-slate-600">
                <p>Stay Tariff Subtotal: <strong className="text-slate-900">{formatINR(booking.subtotal)}</strong></p>
                {incidentalsTotal > 0 && (
                  <p>Incidentals Added: <strong className="text-slate-900">{formatINR(incidentalsTotal)} (+ ₹{incidentalTax} GST)</strong></p>
                )}
                <p>Total Billed: <strong className="text-slate-900">{formatINR(currentTotalAmount)}</strong></p>
                <p>Already Settled: <strong className="text-emerald-700">{formatINR(currentPaid)}</strong></p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Outstanding Balance</span>
                <p className={`text-2xl font-black ${netBalanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatINR(netBalanceDue)}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {netBalanceDue > 0 ? 'Collect prior to key return' : 'No dues remaining'}
                </p>
              </div>
            </div>

            {netBalanceDue > 0 && (
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-700">Settlement Method for Dues:</label>
                <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI QR', icon: QrCode },
                    { id: 'Cash', label: 'Cash Counter', icon: FileText },
                    { id: 'Card', label: 'Card POS', icon: CreditCard }
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          isSelected
                            ? 'bg-brand-50 border-brand-600 text-brand-900 ring-2 ring-brand-500/20'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-center sm:text-left">
                    <div className="p-1 bg-white rounded border border-slate-200">
                      <QRCodeSVG value={upiUri} size={80} level="H" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">Scan & Pay Balance: {formatINR(netBalanceDue)}</p>
                      <p className="text-slate-500 font-mono text-[11px]">UPI: {hotelSettings.upiId}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Mandatory Room Clearance Checklist (PDF Page 7) */}
          <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Mandatory Room Clearance Checklist
            </div>

            <div className="space-y-2.5">
              {/* Checklist 1: Key returned */}
              <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keycardReturned}
                  onChange={(e) => setKeycardReturned(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Key className="w-4 h-4 text-brand-600" />
                  1. Room keycard / physical key returned to reception
                </div>
              </label>

              {/* Checklist 2: Luggage cleared */}
              <label className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={luggageCleared}
                  onChange={(e) => setLuggageCleared(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <Luggage className="w-4 h-4 text-brand-600" />
                  2. Guest luggage cleared and room confirmed vacated
                </div>
              </label>

              {/* Manager Override Reason (Mandatory if key is missing) */}
              {!keycardReturned && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg space-y-1.5 animate-shake">
                  <label className="block text-xs font-bold text-rose-900">
                    ⚠️ Keycard Missing: Manager Override Reason is strictly mandatory!
                  </label>
                  <input
                    type="text"
                    required
                    value={managerOverrideReason}
                    onChange={(e) => setManagerOverrideReason(e.target.value)}
                    placeholder="e.g. Lost key penalty charged ₹500 / Guest took key card authorized by GM"
                    className="w-full px-3 py-1.5 text-xs border border-rose-300 rounded-lg focus:outline-none bg-white text-rose-900"
                  />
                </div>
              )}
            </div>

            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              <strong>Automated Housekeeping Rule:</strong> Completing checkout immediately transitions Room {room.roomNumber} status to <strong>Cleaning (Slate/Gray)</strong> and enqueues an automated deep-sanitization task in Housekeeping. Status <em>never</em> transitions directly to Available.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-200 gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 text-center"
          >
            Cancel
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            {onPrintInvoice && (
              <button
                type="button"
                onClick={() => onPrintInvoice(booking.invoiceNumber)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                View & Print Invoice
              </button>
            )}

            <button
              type="button"
              disabled={submitting}
              onClick={handleExecuteCheckout}
              className="px-5 sm:px-6 py-2.5 sm:py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {submitting ? 'Processing Clearance...' : 'Complete Checkout & Enqueue Cleaning'}
              <DoorClosed className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
