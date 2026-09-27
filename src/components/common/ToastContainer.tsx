import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useTenant();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      {toasts.map(toast => {
        let Icon = CheckCircle2;
        let borderClass = 'border-slate-200 bg-white shadow-md text-slate-800';
        let iconColor = 'text-emerald-600';

        if (toast.type === 'error') {
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          iconColor = 'text-amber-600';
        } else if (toast.type === 'info') {
          Icon = Info;
          iconColor = 'text-blue-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 ${borderClass}`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-900 block leading-tight">{toast.title}</span>
                {toast.message && (
                  <span className="text-[11px] text-slate-500 block leading-tight truncate mt-0.5">{toast.message}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
