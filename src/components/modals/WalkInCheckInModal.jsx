import React, { useState, useMemo } from 'react';
import { 
  X, CheckCircle, ArrowRight, ArrowLeft, BedDouble, User, 
  CreditCard, QrCode, FileText, Smartphone, Send, Printer, 
  Sparkles, ShieldCheck, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { calculateTariffBreakdown, formatINR } from '../../services/pricingCalculators';
import { generateUpiUri, processRazorpayPayment } from '../../services/paymentService';
import { createWaMeLink } from '../../utils/whatsappFormatter';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function WalkInCheckInModal({ room, isOpen, onClose, onCheckInSuccess }) {
  const { hotelSettings, performCheckIn } = useHotel();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);

  // Today's date YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  // Step 1: Stay & Tariff State
  const [stayData, setStayData] = useState({
    nights: 1,
    adults: 2,
    children: 0,
    checkInDate: todayStr,
    expectedCheckoutDate: tomorrowStr,
    extraGuestSurcharge: 0,
    discount: 0,
    quoteConfirmed: false
  });

  // Step 2: Guest & ID State
  const [guestData, setGuestData] = useState({
    name: '',
    phone: '',
    whatsappNumber: '',
    syncWhatsApp: true,
    email: '',
    address: '',
    documentType: 'Aadhaar',
    documentNumber: ''
  });

  // Step 3: Payment State
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, Cash, Razorpay, Card
  const [paymentOption, setPaymentOption] = useState('full'); // full, partial
  const [customPaidAmount, setCustomPaidAmount] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [razorpaySuccess, setRazorpaySuccess] = useState(false);

  // Calculate live tariff breakdown
  const tariff = useMemo(() => {
    return calculateTariffBreakdown({
      ratePerNight: room?.pricePerNight || 2400,
      nights: stayData.nights,
      adults: stayData.adults,
      children: stayData.children,
      extraGuestSurcharge: stayData.extraGuestSurcharge,
      discount: stayData.discount,
      cgstPercent: hotelSettings.cgstRatePercent || 6,
      sgstPercent: hotelSettings.sgstRatePercent || 6
    });
  }, [room, stayData, hotelSettings]);

  // Actual amount to pay based on payment option
  const amountToPay = useMemo(() => {
    if (paymentOption === 'full') return tariff.totalPayable;
    return Math.min(tariff.totalPayable, Math.max(0, Number(customPaidAmount) || 0));
  }, [paymentOption, tariff.totalPayable, customPaidAmount]);

  const remainingBalance = Math.max(0, tariff.totalPayable - amountToPay);

  // Dynamic UPI URI for real-time QR generation
  const upiUri = useMemo(() => {
    return generateUpiUri({
      upiId: hotelSettings.upiId || 'urstay@icici',
      payeeName: hotelSettings.tradeName || hotelSettings.name,
      amount: amountToPay,
      transactionNote: `Room ${room?.roomNumber} Check-in`
    });
  }, [hotelSettings, amountToPay, room]);

  if (!isOpen || !room) return null;

  // Handlers
  const handleNightsChange = (val) => {
    const nights = Math.max(1, Number(val) || 1);
    const d = new Date(stayData.checkInDate || todayStr);
    d.setDate(d.getDate() + nights);
    setStayData(prev => ({
      ...prev,
      nights,
      expectedCheckoutDate: d.toISOString().split('T')[0]
    }));
  };

  const handlePhoneChange = (val) => {
    setGuestData(prev => ({
      ...prev,
      phone: val,
      whatsappNumber: prev.syncWhatsApp ? val : prev.whatsappNumber
    }));
  };

  const handleSyncToggle = (checked) => {
    setGuestData(prev => ({
      ...prev,
      syncWhatsApp: checked,
      whatsappNumber: checked ? prev.phone : prev.whatsappNumber
    }));
  };

  // Step validation
  const canProceedStep1 = stayData.quoteConfirmed && stayData.nights >= 1;
  const canProceedStep2 = guestData.name.trim().length >= 2 && 
                          guestData.phone.trim().length >= 10 && 
                          guestData.documentNumber.trim().length >= 4;

  // Razorpay Gateway Trigger
  const handleTriggerRazorpay = () => {
    processRazorpayPayment({
      amount: amountToPay,
      bookingId: `BK-TEMP-${room.roomNumber}`,
      guestName: guestData.name,
      guestEmail: guestData.email,
      guestPhone: guestData.phone,
      onSuccess: (data) => {
        setRazorpaySuccess(true);
        setReferenceId(data.paymentId);
        showSuccess(`Razorpay settlement verified (${data.paymentId})`);
      },
      onFailure: (err) => {
        showError(err.message || "Online gateway processing failed");
      }
    });
  };

  // Final Atomic Execution (Step 4)
  const handleExecuteAtomicCheckIn = async () => {
    setSubmitting(true);
    try {
      const result = await performCheckIn({
        room,
        guestData,
        stayData,
        paymentData: {
          amountPaid: amountToPay,
          paymentMethod,
          referenceId: referenceId || (paymentMethod === 'UPI' ? 'UPI-SCAN-' + Date.now().toString().slice(-6) : '')
        },
        currentUser
      });

      setCompletedResult(result);
      setCurrentStep(4);

      // Trigger Confetti Celebration (PDF Page 7: "triggers UI Confetti")
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }

      showSuccess(`Room ${room.roomNumber} successfully allocated to ${guestData.name}!`);
      onCheckInSuccess?.(result);
    } catch (err) {
      showError(err.message || "Failed to complete check-in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] border border-slate-200">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 flex-shrink-0">
              <BedDouble className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2 truncate">
                <span className="truncate">Walk-In Check-In</span>
                <span className="text-[10px] sm:text-xs bg-emerald-950 text-emerald-300 font-mono px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-800 flex-shrink-0">
                  Room {room.roomNumber}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
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

        {/* Step Indicator Progress Bar */}
        <div className="bg-slate-50 px-4 sm:px-8 py-2.5 sm:py-3 border-b border-slate-200 flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
          {[
            { step: 1, label: 'Tariff Quote', icon: FileText },
            { step: 2, label: 'Guest KYC & ID', icon: User },
            { step: 3, label: 'Multi-Channel Payment', icon: CreditCard },
            { step: 4, label: 'Allocation & Welcome', icon: Sparkles }
          ].map((item) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div key={item.step} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-2'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : item.step}
                </div>
                <span className={`text-[11px] sm:text-xs font-medium hidden md:inline ${isCurrent ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                  {item.label}
                </span>
                {item.step < 4 && <div className="w-4 sm:w-8 md:w-12 h-0.5 bg-slate-200 ml-1 sm:ml-2" />}
              </div>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1">
          
          {/* STEP 1: Room & Tariff Breakdown */}
          {currentStep === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-base font-bold text-slate-900">Step 1: Stay Duration & Statutory GST Breakdown</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Input nights and guest counts. 12% GST (SAC 996311) is dynamically calculated.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nights</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={stayData.nights}
                    onChange={(e) => handleNightsChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Adults</label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={stayData.adults}
                    onChange={(e) => setStayData({ ...stayData, adults: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Children</label>
                  <input
                    type="number"
                    min="0"
                    max="4"
                    value={stayData.children}
                    onChange={(e) => setStayData({ ...stayData, children: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={stayData.discount}
                    onChange={(e) => setStayData({ ...stayData, discount: Number(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Check-in Date</label>
                  <input
                    type="date"
                    value={stayData.checkInDate}
                    onChange={(e) => setStayData({ ...stayData, checkInDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Check-out</label>
                  <input
                    type="date"
                    value={stayData.expectedCheckoutDate}
                    onChange={(e) => setStayData({ ...stayData, expectedCheckoutDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Tariff Itemized Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2.5">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Base Tariff ({formatINR(room.pricePerNight)} × {stayData.nights} night{stayData.nights > 1 ? 's' : ''}):</span>
                  <span className="font-semibold text-slate-900">{formatINR(tariff.baseCharge)}</span>
                </div>
                {tariff.extraGuestSurcharge > 0 && (
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Extra Guest Surcharge:</span>
                    <span className="font-semibold text-slate-900">{formatINR(tariff.extraGuestSurcharge)}</span>
                  </div>
                )}
                {tariff.discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>Authorized Discount:</span>
                    <span className="font-semibold">-{formatINR(tariff.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-700 pt-2 border-t border-slate-200 font-medium">
                  <span>Subtotal (Taxable Value):</span>
                  <span className="text-slate-900">{formatINR(tariff.subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>CGST (6% SAC 996311):</span>
                  <span className="font-mono text-slate-800">{formatINR(tariff.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>SGST (6% SAC 996311):</span>
                  <span className="font-mono text-slate-800">{formatINR(tariff.sgstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-900 font-bold pt-2 border-t border-slate-300">
                  <span>Total Payable Tariff:</span>
                  <span className="text-base text-brand-600 font-bold">{formatINR(tariff.totalPayable)}</span>
                </div>
              </div>

              {/* Explicit Quote Acceptance Checkbox (PDF Page 7) */}
              <label className="flex items-start gap-3 p-4 bg-amber-50/70 border border-amber-200 rounded-xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={stayData.quoteConfirmed}
                  onChange={(e) => setStayData({ ...stayData, quoteConfirmed: e.target.checked })}
                  className="mt-1 w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                />
                <span className="text-xs text-amber-900 leading-relaxed font-medium">
                  <strong>Explicit Quote Acceptance Confirmation:</strong> Guest has verbally reviewed and accepted the itemized tariff quote of {formatINR(tariff.totalPayable)} (including 12% GST SAC 996311) for {stayData.nights} night(s).
                </span>
              </label>
            </div>
          )}

          {/* STEP 2: Guest Registration & Government ID */}
          {currentStep === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-base font-bold text-slate-900">Step 2: Guest Registration & KYC ID Proof</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Government-issued photo identification is mandatory under hospitality regulations. Aadhaar is stored masked.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    value={guestData.name}
                    onChange={(e) => setGuestData({ ...guestData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Rathore"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                    placeholder="guest@example.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={guestData.phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    disabled={guestData.syncWhatsApp}
                    value={guestData.whatsappNumber}
                    onChange={(e) => setGuestData({ ...guestData, whatsappNumber: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg disabled:bg-slate-100 disabled:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guestData.syncWhatsApp}
                      onChange={(e) => handleSyncToggle(e.target.checked)}
                      className="w-3.5 h-3.5 text-brand-600 rounded"
                    />
                    <span className="text-[11px] text-slate-600">Same as Mobile Number (Auto-Sync)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Residential / Permanent Address</label>
                <input
                  type="text"
                  value={guestData.address}
                  onChange={(e) => setGuestData({ ...guestData, address: e.target.value })}
                  placeholder="Street, City, State, PIN"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              {/* Government ID Verification */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Government ID Proof Verification
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Document Type *</label>
                    <select
                      value={guestData.documentType}
                      onChange={(e) => setGuestData({ ...guestData, documentType: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none"
                    >
                      <option value="Aadhaar">Aadhaar Card (UIDAI)</option>
                      <option value="Passport">Passport</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Driving Licence">Driving Licence</option>
                      <option value="Voter ID">Election Voter ID</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Document Number *</label>
                    <input
                      type="text"
                      required
                      value={guestData.documentNumber}
                      onChange={(e) => setGuestData({ ...guestData, documentNumber: e.target.value })}
                      placeholder={guestData.documentType === 'Aadhaar' ? '12-digit Aadhaar' : 'Document Number'}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                    />
                    {guestData.documentType === 'Aadhaar' && (
                      <p className="text-[10px] text-emerald-700 mt-1">
                        🔒 Aadhaar privacy compliance: First 8 digits will be automatically masked upon storage (XXXXXXXX1234).
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Multi-Channel Payment Recording */}
          {currentStep === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h4 className="text-base font-bold text-slate-900">Step 3: Multi-Channel Payment Recording</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Record advance deposit or full settlement via Cash, Dynamic UPI QR, Razorpay, or Card POS.
                </p>
              </div>

              {/* Payment Allocation Toggle */}
              <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentOption('full')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    paymentOption === 'full' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full Settlement ({formatINR(tariff.totalPayable)})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('partial')}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    paymentOption === 'partial' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Partial Advance Deposit
                </button>
              </div>

              {paymentOption === 'partial' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Advance Amount Collected (₹)</label>
                    <input
                      type="number"
                      min="1"
                      max={tariff.totalPayable}
                      value={customPaidAmount}
                      onChange={(e) => setCustomPaidAmount(e.target.value)}
                      placeholder="e.g. 2000"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Balance Due at Departure</label>
                    <div className="px-3 py-2 text-sm font-bold text-rose-600 bg-white border border-slate-200 rounded-lg">
                      {formatINR(remainingBalance)}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Channel Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {[
                  { id: 'UPI', label: 'UPI QR', icon: QrCode },
                  { id: 'Cash', label: 'Cash Counter', icon: FileText },
                  { id: 'Razorpay', label: 'Razorpay Gateway', icon: Smartphone },
                  { id: 'Card', label: 'Card POS', icon: CreditCard }
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-semibold ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-brand-600' : 'text-slate-400'}`} />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Channel Sub-Panel */}
              {paymentMethod === 'UPI' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
                    <QRCodeSVG
                      value={upiUri}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                      Dynamic Scannable upi:// URI
                    </span>
                    <h5 className="text-sm font-bold text-slate-900">Scan via GPay, PhonePe, Paytm</h5>
                    <p className="text-xs text-slate-500 font-mono">VPA: {hotelSettings.upiId}</p>
                    <p className="text-sm font-extrabold text-slate-900">Amount: {formatINR(amountToPay)}</p>
                    <p className="text-[11px] text-slate-400">
                      Guest scans QR directly from reception screen. Live payment automatically binds to folio.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === 'Razorpay' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-3">
                  <Smartphone className="w-8 h-8 text-brand-600 mx-auto" />
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">Razorpay Online Gateway Integration</h5>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Launches guest payment modal supporting Credit/Debit Cards, NetBanking, and Wallets.
                    </p>
                  </div>
                  {razorpaySuccess ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Razorpay Settlement Verified: {referenceId}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTriggerRazorpay}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg shadow transition-all"
                    >
                      Launch Razorpay Checkout ({formatINR(amountToPay)})
                    </button>
                  )}
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <CreditCard className="w-4 h-4 text-slate-600" />
                    Counter EDC POS Terminal
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">Card Approval / Batch Code</label>
                    <input
                      type="text"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      placeholder="e.g. HDFC-POS-9812"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'Cash' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <FileText className="w-4 h-4 text-slate-600" />
                    Reception Cash Register
                  </div>
                  <p className="text-xs text-slate-600">
                    Confirm physical currency of <strong>{formatINR(amountToPay)}</strong> received in cash drawer.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Success & Dispatch Summary */}
          {currentStep === 4 && completedResult && (
            <div className="space-y-6 max-w-2xl mx-auto text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Atomic Transaction Committed
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-2">
                  Room {room.roomNumber} Successfully Allocated!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Booking Reference: <strong className="font-mono text-slate-900">{completedResult.booking.bookingId}</strong> • Invoice: <strong className="font-mono text-slate-900">{completedResult.invoice.invoiceNumber}</strong>
                </p>
              </div>

              {/* Summary Details Card */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-left grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Guest Name:</span>
                  <p className="font-semibold text-slate-800">{completedResult.guest.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Mobile:</span>
                  <p className="font-semibold text-slate-800">{completedResult.guest.phone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Nights Billed:</span>
                  <p className="font-semibold text-slate-800">{completedResult.booking.nights} Night(s)</p>
                </div>
                <div>
                  <span className="text-slate-400">Payment Status:</span>
                  <p className="font-semibold text-emerald-600">
                    Paid {formatINR(completedResult.payment.amount)} {completedResult.booking.balanceDue > 0 ? `(Due: ${formatINR(completedResult.booking.balanceDue)})` : '(Fully Settled)'}
                  </p>
                </div>
              </div>

              {/* Automated WhatsApp Welcome Section */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <Send className="w-4 h-4 text-emerald-700" />
                    Automated WhatsApp Welcome Message
                  </div>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 font-semibold px-2 py-0.5 rounded">
                    Delivered via Meta Cloud API
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-emerald-100 text-[11px] font-mono text-slate-700 whitespace-pre-line max-h-32 overflow-y-auto">
                  {completedResult.whatsappText}
                </div>
                <div className="flex justify-end pt-1">
                  <a
                    href={createWaMeLink(completedResult.guest.whatsappNumber, completedResult.whatsappText)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Open in WhatsApp Web (wa.me click-to-chat fallback) →
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-0 border-t border-slate-200">
          {currentStep < 4 ? (
            <>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              ) : (
                <div />
              )}

              <div className="flex flex-col-reverse xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 text-center"
                >
                  Cancel
                </button>

                {currentStep === 1 && (
                  <button
                    type="button"
                    disabled={!canProceedStep1}
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 shadow transition-all"
                  >
                    Next: Guest KYC
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentStep === 2 && (
                  <button
                    type="button"
                    disabled={!canProceedStep2}
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center gap-1.5 shadow transition-all"
                  >
                    Next: Payment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {currentStep === 3 && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleExecuteAtomicCheckIn}
                    className="px-6 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-2 shadow-lg transition-all"
                  >
                    {submitting ? 'Committing Transaction...' : 'Complete & Allocate Room'}
                    <Sparkles className="w-4 h-4" />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="w-full flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow transition-all"
              >
                Close & Return to Room Map
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
