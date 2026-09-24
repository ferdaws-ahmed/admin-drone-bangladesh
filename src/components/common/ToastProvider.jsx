'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'success', duration = 2800) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const next = { id, message, type };

    setToasts((current) => [...current, next]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  // Toast type dynamic configuration
  const getToastStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
          container: 'border-rose-100 bg-white/95 text-slate-800 shadow-rose-500/10 ring-1 ring-rose-500/20',
          accentBg: 'bg-rose-500',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
          container: 'border-amber-100 bg-white/95 text-slate-800 shadow-amber-500/10 ring-1 ring-amber-500/20',
          accentBg: 'bg-amber-500',
        };
      case 'info':
        return {
          icon: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
          container: 'border-blue-100 bg-white/95 text-slate-800 shadow-blue-500/10 ring-1 ring-blue-500/20',
          accentBg: 'bg-blue-500',
        };
      case 'success':
      default:
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
          container: 'border-emerald-100 bg-white/95 text-slate-800 shadow-emerald-500/10 ring-1 ring-emerald-500/20',
          accentBg: 'bg-emerald-500',
        };
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Toast Notification Floating Container */}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2.5">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${styles.container}`}
            >
              {/* Left Accent Color Indicator Bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${styles.accentBg}`} />

              <div className="flex items-center gap-3 pl-1">
                {styles.icon}
                <p className="text-xs font-semibold leading-snug text-slate-700">
                  {toast.message}
                </p>
              </div>

              {/* Manual Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
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
    return {
      push: () => {},
    };
  }

  return context;
}