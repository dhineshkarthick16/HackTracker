import React from 'react';
import { useToast, ToastItem } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{ toast: ToastItem; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div
      role="alert"
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md animate-slide-up transition-all ${
        isSuccess
          ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
          : isError
          ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-950/40'
          : 'bg-slate-900/90 border-slate-700/80 text-slate-100 shadow-slate-950/40'
      }`}
    >
      <div className="flex items-center gap-2.5 text-sm font-medium">
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-indigo-400 shrink-0" />}
        <span>{toast.message}</span>
      </div>
      <button
        onClick={onDismiss}
        className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
