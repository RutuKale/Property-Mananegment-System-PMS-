import React, { useState } from 'react';
import { 
  MessageSquare, Send, ExternalLink, Search, Clock, 
  CheckCheck, Sparkles, Smartphone, ShieldCheck, User 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useToast } from '../context/ToastContext';
import { 
  createWaMeLink, 
  formatCheckInWhatsAppMessage, 
  formatCheckoutReminderWhatsAppMessage 
} from '../utils/whatsappFormatter';

export default function WhatsAppLogsPage() {
  const { notifications, logWhatsAppNotification, rooms, bookings, hotelSettings } = useHotel();
  const { showSuccess } = useToast();

  const [search, setSearch] = useState('');
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [testGuestName, setTestGuestName] = useState('Arjun Verma');
  const [testType, setTestType] = useState('welcome'); // 'welcome' | 'reminder' | 'custom'
  const [customMsg, setCustomMsg] = useState('');

  // Filtered notifications
  const filteredNotifs = notifications.filter(n => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = n.recipientName?.toLowerCase().includes(q);
      const matchPhone = n.recipientPhone?.toLowerCase().includes(q);
      const matchMsg = n.messageText?.toLowerCase().includes(q);
      const matchType = n.messageType?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchMsg && !matchType) return false;
    }
    return true;
  });

  const getComputedMessage = () => {
    if (testType === 'welcome') {
      return formatCheckInWhatsAppMessage({
        guestName: testGuestName,
        bookingId: 'BK-2026-DEMO',
        roomNumber: '102',
        floorName: 'Ground Floor',
        roomCategory: 'Standard Deluxe',
        checkInDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        expectedCheckoutDate: 'Tomorrow',
        ratePerNight: 2400,
        totalAmount: 5376,
        amountPaid: 5376,
        balanceDue: 0,
        receptionPhone: hotelSettings.receptionPhone
      });
    } else if (testType === 'reminder') {
      return formatCheckoutReminderWhatsAppMessage({
        guestName: testGuestName,
        roomNumber: '102',
        bookingId: 'BK-2026-DEMO',
        checkoutTime: '11:00 AM',
        balanceDue: 0,
        receptionPhone: hotelSettings.receptionPhone
      });
    }
    return customMsg || 'Hello from UR Stay Luxury Hotels & Resorts reception concierge.';
  };

  const handleDispatchTest = (e) => {
    e.preventDefault();
    const textToSend = getComputedMessage();

    // 1. Log to notifications audit
    logWhatsAppNotification({
      recipientPhone: testPhone,
      recipientName: testGuestName,
      messageType: testType === 'welcome' ? 'Check-in Welcome' : testType === 'reminder' ? '30-Min Checkout Reminder' : 'Concierge Message',
      messageText: textToSend,
      bookingId: 'BK-DEMO',
      roomId: 'rm-102'
    });

    showSuccess("Message logged to delivery stream. Opening WhatsApp Web fallback...");

    // 2. Open wa.me link fallback (PDF Page 9)
    const link = createWaMeLink(testPhone, textToSend);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
            Automated WhatsApp Messaging Engine
          </h1>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
            Meta Cloud API v19.0
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Dual-layer messaging: Automated Cloud Functions delivery worker + Front-Desk wa.me Click-to-Chat fallback.
        </p>
      </div>

      {/* Interactive WhatsApp Dispatch Sandbox */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Interactive Dispatcher & Template Tester
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Direct wa.me fallback supported
          </span>
        </div>

        <form onSubmit={handleDispatchTest} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guest WhatsApp #</label>
            <input
              type="tel"
              required
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Guest Full Name</label>
            <input
              type="text"
              required
              value={testGuestName}
              onChange={(e) => setTestGuestName(e.target.value)}
              placeholder="Guest Name"
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message Template</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:outline-none"
            >
              <option value="welcome">Check-in Welcome Confirmation</option>
              <option value="reminder">30-Minute Checkout Reminder</option>
              <option value="custom">Custom Concierge Note</option>
            </select>
          </div>

          {testType === 'custom' && (
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Message Text</label>
              <textarea
                rows={2}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type custom notification..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          )}

          <div className="md:col-span-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <p className="text-[11px] text-slate-400">
              Dispatches via WhatsApp Web with one click if Meta Cloud credentials are in sandbox mode.
            </p>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch & Open wa.me Link
            </button>
          </div>
        </form>
      </div>

      {/* Outbound Delivery Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-3 sm:p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient name, phone, message content..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <span className="text-xs text-slate-500">
            <strong>{filteredNotifs.length}</strong> logged communications
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="py-3 px-4">Recipient</th>
                <th className="py-3 px-4">Template / Type</th>
                <th className="py-3 px-4">Message Preview</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNotifs.length > 0 ? (
                filteredNotifs.map((n) => (
                  <tr key={n.notificationId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{n.recipientName}</p>
                      <p className="text-slate-500 text-[11px] font-mono">{n.recipientPhone}</p>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {n.messageType}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-600 truncate" title={n.messageText}>
                        {n.messageText}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {n.provider || 'Meta Cloud API'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCheck className="w-3.5 h-3.5" />
                        {n.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={createWaMeLink(n.recipientPhone, n.messageText)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded inline-flex items-center gap-1 border border-emerald-200"
                      >
                        wa.me <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No WhatsApp notifications logged.
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
