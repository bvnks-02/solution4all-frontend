import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

const typeConfig = {
  success: {
    bg: 'bg-green-50',
    border: 'border-success/30',
    text: 'text-success',
    Icon: CheckCircle,
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-error/30',
    text: 'text-error',
    Icon: XCircle,
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-warning/30',
    text: 'text-warning',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-brand-tealLight',
    border: 'border-brand-teal/30',
    text: 'text-brand-teal',
    Icon: Info,
  },
};

export default function Alert({ type = 'info', message, onDismiss }) {
  const config = typeConfig[type];
  const Icon = config.Icon;
  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-4 text-sm font-sans border ${config.bg} ${config.border} ${config.text} ${type === 'success' ? 'animate-scale-in' : type === 'error' ? 'animate-error-shake' : type === 'warning' ? 'animate-fade-in' : type === 'info' ? 'animate-fade-in' : ''}`}
      role="alert"
    >
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-auto shrink-0 rounded-lg p-1 hover:bg-black/5 focus-visible:ring-2 focus-visible:ring-brand-navy focus-visible:outline-none"
          aria-label="Fermer l'alerte"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
