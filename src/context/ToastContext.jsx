import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast = { id, title, message, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    return addToast({ title, message, type: 'success' });
  }, [addToast]);

  const showError = useCallback((message, title = 'Error') => {
    return addToast({ title, message, type: 'error', duration: 6000 });
  }, [addToast]);

  const showWarning = useCallback((message, title = 'Warning') => {
    return addToast({ title, message, type: 'warning' });
  }, [addToast]);

  const showInfo = useCallback((message, title = 'Notification') => {
    return addToast({ title, message, type: 'info' });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-luxury border backdrop-blur-md transition-all duration-300 transform translate-y-0 opacity-100 ${
                isSuccess
                  ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-100'
                  : isError
                  ? 'bg-rose-950/90 border-rose-700/60 text-rose-100'
                  : isWarning
                  ? 'bg-amber-950/90 border-amber-700/60 text-amber-100'
                  : 'bg-slate-900/90 border-slate-700/60 text-slate-100'
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
              </div>
              <div className="flex-1 text-sm">
                {toast.title && <h5 className="font-semibold text-white mb-0.5">{toast.title}</h5>}
                <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-white/60 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
