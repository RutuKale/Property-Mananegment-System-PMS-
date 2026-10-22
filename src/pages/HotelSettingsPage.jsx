import React, { useState } from 'react';
import { 
  Settings2, Save, Hotel, ShieldCheck, QrCode, 
  MapPin, Phone, Mail, Clock, CheckCircle2 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useToast } from '../context/ToastContext';

export default function HotelSettingsPage() {
  const { hotelSettings, updateSettings } = useHotel();
  const { showSuccess } = useToast();

  const [formData, setFormData] = useState({
    name: hotelSettings.name || 'UR Stay Luxury Hotels & Resorts',
    tradeName: hotelSettings.tradeName || 'UR Stay Palace & Suites',
    gstin: hotelSettings.gstin || '07AAAAA0000A1Z5',
    sacCode: hotelSettings.sacCode || '996311',
    taxRatePercent: hotelSettings.taxRatePercent || 12,
    cgstRatePercent: hotelSettings.cgstRatePercent || 6,
    sgstRatePercent: hotelSettings.sgstRatePercent || 6,
    upiId: hotelSettings.upiId || 'urstay@icici',
    receptionPhone: hotelSettings.receptionPhone || '+91 98765 43210',
    receptionEmail: hotelSettings.receptionEmail || 'concierge@urstayluxury.com',
    address: hotelSettings.address || '104, Royalty Enclave, Heritage Boulevard, New Delhi 110001, India',
    checkInTime: hotelSettings.checkInTime || '12:00 PM',
    checkOutTime: hotelSettings.checkOutTime || '11:00 AM'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      ...formData,
      taxRatePercent: Number(formData.taxRatePercent) || 12,
      cgstRatePercent: Number(formData.cgstRatePercent) || 6,
      sgstRatePercent: Number(formData.sgstRatePercent) || 6
    });
    showSuccess("Hotel property settings & GST configurations saved successfully.");
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
          Hotel Settings & Statutory Compliance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure property identity, legal GSTIN, SAC 996311 rates, and reception UPI VPAs.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
        
        {/* Section 1: Property Identity */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <Hotel className="w-4 h-4 text-brand-600" />
            Property Identity & Trade Name
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Brand / Group Name *</label>
              <input
                type="text"
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Trade Name *</label>
              <input
                type="text"
                required
                name="tradeName"
                value={formData.tradeName}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Legal Registered Address *</label>
            <input
              type="text"
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reception Concierge Phone *</label>
              <input
                type="tel"
                required
                name="receptionPhone"
                value={formData.receptionPhone}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Concierge Email *</label>
              <input
                type="email"
                required
                name="receptionEmail"
                value={formData.receptionEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Indian GST & Statutory Tax Config */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Statutory Goods & Services Tax (GST SAC 996311)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property GSTIN *</label>
              <input
                type="text"
                required
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="07AAAAA0000A1Z5"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tariff SAC Code *</label>
              <input
                type="text"
                required
                name="sacCode"
                value={formData.sacCode}
                onChange={handleChange}
                placeholder="996311"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Tax Rate (%)</label>
              <input
                type="number"
                name="taxRatePercent"
                value={formData.taxRatePercent}
                onChange={handleChange}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60">
            <div>
              <label className="block text-xs font-semibold text-emerald-900 mb-1">CGST Rate (%)</label>
              <input
                type="number"
                name="cgstRatePercent"
                value={formData.cgstRatePercent}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs border border-emerald-300 rounded-lg bg-white"
              />
              <p className="text-[10px] text-emerald-700 mt-1">Central Tax component</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-900 mb-1">SGST Rate (%)</label>
              <input
                type="number"
                name="sgstRatePercent"
                value={formData.sgstRatePercent}
                onChange={handleChange}
                className="w-full px-3 py-1.5 text-xs border border-emerald-300 rounded-lg bg-white"
              />
              <p className="text-[10px] text-emerald-700 mt-1">State Tax component</p>
            </div>
          </div>
        </div>

        {/* Section 3: Financial & UPI VPA */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
            <QrCode className="w-4 h-4 text-purple-600" />
            Counter UPI Virtual Payment Address (VPA)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Front Desk Reception UPI VPA *</label>
              <input
                type="text"
                required
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                placeholder="urstay@icici"
                className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Used to generate dynamic scannable upi:// QR codes at Step 3 of walk-in check-in.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Checkout Time</label>
              <input
                type="text"
                name="checkOutTime"
                value={formData.checkOutTime}
                onChange={handleChange}
                placeholder="11:00 AM"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto justify-center px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Hotel Configurations
          </button>
        </div>

      </form>

    </div>
  );
}
