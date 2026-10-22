import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UserCheck, DoorClosed, CalendarDays,
  Sparkles, Receipt, IndianRupee, MessageSquare, BarChart3,
  Settings2, Building2, LogOut, Hotel, Crown, ShieldAlert, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';

export default function Sidebar({ isOpen, onClose }) {
  const { currentUser, logout, switchRole, hasRole } = useAuth();
  const { metrics, housekeepingTasks } = useHotel();
  const navigate = useNavigate();

  // Pending counts
  const pendingCleaning = housekeepingTasks.filter(t => t.status !== 'completed').length;

  const navItems = [
    {
      path: '/',
      label: 'Room Map Dashboard',
      icon: LayoutDashboard,
      badge: metrics.availableRooms ? `${metrics.availableRooms} Ready` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      path: '/checkin',
      label: 'Walk-In Check-In',
      icon: UserCheck
    },
    {
      path: '/checkout',
      label: 'Checkout & Clearance',
      icon: DoorClosed,
      badge: metrics.checkoutDueRooms > 0 ? `${metrics.checkoutDueRooms} Due` : null,
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    },
    {
      path: '/bookings',
      label: 'Bookings & Stays',
      icon: CalendarDays
    },
    {
      path: '/housekeeping',
      label: 'Housekeeping Queue',
      icon: Sparkles,
      badge: pendingCleaning > 0 ? `${pendingCleaning} Tasks` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    },
    {
      path: '/billing',
      label: 'GST Billing & Invoices',
      icon: Receipt
    },
    {
      path: '/payments',
      label: 'Payment Ledger',
      icon: IndianRupee
    },
    {
      path: '/whatsapp-logs',
      label: 'WhatsApp Messaging',
      icon: MessageSquare
    },
    {
      path: '/reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
      roleRequired: ['Admin', 'Manager']
    },
    {
      path: '/room-config',
      label: 'Room & Floor Config',
      icon: Building2,
      roleRequired: ['Admin']
    },
    {
      path: '/settings',
      label: 'Hotel Settings',
      icon: Settings2,
      roleRequired: ['Admin']
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation Container (Drawer on Mobile / Fixed on Desktop) */}
      <aside className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-slate-950 text-slate-300 z-50 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-out shadow-2xl lg:shadow-none lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>

        {/* Luxury Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 flex-shrink-0">
              <Crown className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-extrabold tracking-tight text-white font-display truncate">
                  UR STAY
                </h1>
                <span className="text-[9px] uppercase font-bold tracking-widest text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 flex-shrink-0">
                  PMS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium truncate">
                Luxury Hotels & Resorts
              </p>
            </div>
          </div>

          {/* Mobile close drawer button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg lg:hidden transition-colors flex-shrink-0"
            aria-label="Close Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Operations & Reception
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${isActive
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Rapid Role Switcher & Active User Profile (PDF Section 10 & 12) */}
        <div className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-3">

          {/* Active User Card */}
          <div className="flex items-center gap-2.5 px-2">
            <img
              src={currentUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"}
              alt="User"
              className="w-8 h-8 rounded-full object-cover border border-amber-400/40"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || "Vikramaditya Rathore"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] text-amber-400 font-medium">
                  {currentUser?.role || "Admin"}
                </span>
              </div>
            </div>
          </div>

          {/* Rapid Role Switcher for instant testing */}
          <div className="pt-1">
            <span className="block text-[9px] uppercase font-bold text-slate-300 px-2 mb-1.5">
              Simulate Role Permissions:
            </span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              {['Admin', 'Manager', 'Receptionist', 'Housekeeping'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => switchRole(role)}
                  className={`px-2 py-1 rounded text-left transition-all ${currentUser?.role === role
                      ? 'bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Log Out */}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors border border-rose-900/30"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

      </aside>
    </>
  );
}
