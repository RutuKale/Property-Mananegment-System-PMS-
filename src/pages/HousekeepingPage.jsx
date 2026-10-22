import React, { useState } from 'react';
import { 
  Sparkles, Wrench, CheckCircle2, Clock, AlertTriangle, 
  Check, User, ShieldCheck, ArrowRight 
} from 'lucide-react';
import { useHotel } from '../context/HotelContext';
import { useToast } from '../context/ToastContext';

export default function HousekeepingPage() {
  const { housekeepingTasks, rooms, completeHousekeepingSanitization, resolveMaintenance } = useHotel();
  const { showSuccess } = useToast();

  const [activeTab, setActiveTab] = useState('cleaning'); // 'cleaning' | 'maintenance'

  // Cleaning tasks vs Maintenance tasks
  const cleaningTasks = housekeepingTasks.filter(t => 
    t.taskType.toLowerCase().includes('clean') || 
    t.taskType.toLowerCase().includes('sanit') ||
    t.taskType.toLowerCase().includes('turnover')
  );

  const maintenanceTasks = housekeepingTasks.filter(t => 
    t.taskType.toLowerCase().includes('maintenance') || 
    t.taskType.toLowerCase().includes('hvac') ||
    t.taskType.toLowerCase().includes('repair')
  );

  // Active rooms in cleaning or maintenance
  const roomsInCleaning = rooms.filter(r => r.status === 'cleaning');
  const roomsInMaintenance = rooms.filter(r => r.status === 'maintenance');

  const handleCompleteCleaning = (task) => {
    completeHousekeepingSanitization(task.taskId, task.roomId);
    showSuccess(`Room ${task.roomNumber} sanitization certified! Status restored to Available (Emerald Green).`);
  };

  const handleResolveMaintenance = (task) => {
    resolveMaintenance(task.roomId, "Maintenance resolved by engineer");
    completeHousekeepingSanitization(task.taskId, task.roomId);
    showSuccess(`Room ${task.roomNumber} defect resolved! Status restored to Available.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 font-display">
            Housekeeping & Sanitization Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Turnover deep-sanitization checklists and maintenance repair defect queue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start sm:self-auto">
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm">
            Pending Sanitizations: <strong className="text-amber-600">{roomsInCleaning.length}</strong>
          </div>
          <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-sm">
            Active Defect Repairs: <strong className="text-rose-600">{roomsInMaintenance.length}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-full max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('cleaning')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'cleaning' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          Cleaning Queue ({roomsInCleaning.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('maintenance')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'maintenance' ? 'bg-white text-slate-900 shadow' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-zinc-600" />
          Maintenance Queue ({roomsInMaintenance.length})
        </button>
      </div>

      {/* CLEANING QUEUE CONTENT */}
      {activeTab === 'cleaning' && (
        <div className="space-y-4">
          {cleaningTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cleaningTasks.map((task) => {
                const roomObj = rooms.find(r => r.roomId === task.roomId);
                const isCompleted = task.status === 'completed';

                return (
                  <div 
                    key={task.taskId}
                    className={`bg-white rounded-xl border p-5 shadow-sm space-y-4 transition-all ${
                      isCompleted ? 'border-emerald-300 opacity-80' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-base font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {task.roomNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{task.taskType}</h4>
                          <p className="text-[11px] text-slate-400">Assigned: {task.assignedTo || 'Floor Captain'}</p>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isCompleted 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Checklist Items */}
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Mandatory Sanitization Protocol
                      </p>
                      {task.checklist?.map((chk, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] ${
                            chk.completed || isCompleted ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-transparent'
                          }`}>
                            ✓
                          </div>
                          <span className={chk.completed || isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}>
                            {chk.item}
                          </span>
                        </div>
                      ))}
                    </div>

                    {task.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                        Note: {task.notes}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Enqueued: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {!isCompleted ? (
                        <button
                          type="button"
                          onClick={() => handleCompleteCleaning(task)}
                          className="w-full sm:w-auto px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Certify Sanitization & Make Available
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Ready for Walk-In Guests
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Cleaning Queue Clear!</h4>
              <p className="text-xs text-slate-500 mt-1">All rooms have been sanitized and restored to Available.</p>
            </div>
          )}
        </div>
      )}

      {/* MAINTENANCE QUEUE CONTENT */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {maintenanceTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {maintenanceTasks.map((task) => (
                <div key={task.taskId} className="bg-white rounded-xl border border-zinc-300 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-base font-black text-slate-900 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                        {task.roomNumber}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900">{task.taskType}</h4>
                        <p className="text-[11px] text-slate-400">Assigned: {task.assignedTo}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 text-zinc-800 uppercase">
                      {task.priority} Priority
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200 text-xs">
                    <p className="font-semibold text-zinc-800">Defect Notes:</p>
                    <p className="text-zinc-600 mt-0.5">{task.notes}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Reported: {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleResolveMaintenance(task)}
                      className="w-full sm:w-auto px-4 py-1.5 bg-zinc-800 hover:bg-zinc-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Wrench className="w-4 h-4" />
                      Resolve Defect & Make Available
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">No Open Maintenance Work Orders</h4>
              <p className="text-xs text-slate-500 mt-1">All engineering fixtures and room HVAC units are operational.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
