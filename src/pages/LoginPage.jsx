import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, Lock, Mail, ArrowRight, ShieldCheck, 
  Sparkles, UserCheck, KeyRound, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const { loginWithCredentials, loginAsDemoUser } = useAuth();
  const { hotelSettings } = useHotel();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@urstayluxury.com');
  const [password, setPassword] = useState('password123');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = loginWithCredentials(email, password);
      showSuccess(`Welcome back, ${res.user.name} (${res.user.role})!`);
      navigate('/');
    } catch (err) {
      showError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = (role) => {
    const user = loginAsDemoUser(role);
    showSuccess(`Signed in as Demo ${role} (${user.name})`);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Opulent Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-4 sm:space-y-6 px-1 sm:px-0">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20">
            <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-display">
            UR STAY LUXURY HOTELS
          </h1>
          <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-400/90 font-medium">
            Property Management System (PMS) v1.0.0
          </p>
          <p className="text-xs text-slate-400 px-2">
            Front-desk operations, real-time spatial room map & legal GST compliance.
          </p>
        </div>

        {/* 1-Click Administrator Access Banner (PDF Page 5) */}
        <div className="bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-700/20 border border-amber-500/40 rounded-2xl p-4 text-center space-y-2 backdrop-blur-md shadow-lg shadow-amber-500/10">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            1-Click Administrator Demo Access
          </div>
          <p className="text-[11px] text-slate-300">
            Instantly enters as <strong>Vikramaditya Rathore</strong> (General Manager / Admin) with unrestricted permissions.
          </p>
          <button
            type="button"
            onClick={() => handleDemoLogin('Admin')}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            Launch as Administrator (Demo Mode)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Main Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-center">
            Staff Credentials Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Staff Work Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@urstayluxury.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Security Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              Sign In to Reception Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Role Demonstration Buttons */}
          <div className="pt-2 border-t border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-300 text-center mb-2">
              Or Test Specific Operational Roles:
            </p>
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleDemoLogin('Manager')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-center transition-colors font-medium"
              >
                Manager
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Receptionist')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-center transition-colors font-medium"
              >
                Receptionist
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('Housekeeping')}
                className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-center transition-colors font-medium"
              >
                Housekeeping
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="text-[11px] text-center text-slate-600 font-mono">
          Adheres to GST SAC 996311 • Encrypted Firestore Reactive Synchronization
        </p>

      </div>
    </div>
  );
}
