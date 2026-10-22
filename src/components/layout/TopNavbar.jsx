import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Plus, RefreshCw, Clock, CheckCircle2, 
  Send, ExternalLink, ShieldCheck, Sparkles 
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useToast } from '../../context/ToastContext';

export default function TopNavbar({ onMenuClick, onLaunchCheckIn }) {
  const { hotelSettings, notifications, resetToFactorySeed } = useHotel();
  const { showSuccess } = useToast();

  const [currentTime, setCurrentTime] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  // Live Asia/Kolkata Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      const dateStr = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setCurrentTime(`${dateStr} • ${timeStr} (IST)`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResetData = () => {
    if (window.confirm("Restore factory demo seed data for all 11 collections?")) {
      resetToFactorySeed();
      showSuccess("Property seed state restored to factory defaults.");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2">
      
      {/* Left: Mobile Toggle & Property Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Toggle Navigation Menu"
          className="p-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100 flex-shrink-0 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight font-display truncate">
              <span className="sm:hidden">UR Stay PMS</span>
              <span className="hidden sm:inline">{hotelSettings.name}</span>
            </h2>
            <span className="text-[9px] sm:text-[10px] bg-slate-100 text-slate-600 font-mono px-1.5 sm:px-2 py-0.5 rounded border border-slate-200 hidden md:inline flex-shrink-0">
              GSTIN: {hotelSettings.gstin}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-500 truncate">
            <Clock className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="font-mono text-slate-600 truncate">{currentTime || 'Asia/Kolkata'}</span>
          </div>
        </div>
      </div>

      {/* Right: Quick Check-in Button, Reset Demo Seed, Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        
        {/* Reset Demo State Button */}
        <button
          type="button"
          onClick={handleResetData}
          title="Reset database to initial demo state"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden xl:inline text-xs font-medium">Reset Demo Data</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            aria-label="View Notifications"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-luxury border border-slate-200 py-2 z-50 text-xs animate-fade-in">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">Outbound WhatsApp Dispatch</span>
                <span className="text-[10px] text-slate-400">{notifications.length} logged</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                {notifications.slice(0, 4).map((n) => (
                  <div key={n.notificationId} className="p-3 hover:bg-slate-50">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-800">{n.recipientName}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{n.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{n.messageText}</p>
                    <p className="text-[9px] text-slate-400 mt-1 font-mono">{new Date(n.timestamp).toLocaleTimeString()}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 text-center">
                <a href="#/whatsapp-logs" onClick={() => setShowNotifMenu(false)} className="text-[11px] font-semibold text-brand-600 hover:underline">
                  View Full WhatsApp Logs →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Primary Action: New Check-in */}
        <button
          type="button"
          onClick={onLaunchCheckIn}
          className="px-2.5 sm:px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm shadow-brand-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4 flex-shrink-0" />
          <span className="hidden xs:inline">Walk-In Check-In</span>
          <span className="xs:hidden">Check-In</span>
        </button>

      </div>

    </header>
  );
}
