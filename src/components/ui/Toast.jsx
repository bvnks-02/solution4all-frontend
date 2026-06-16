import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const typeConfig = {
  success: { bg: 'bg-green-50', border: 'border-success/30', text: 'text-success', Icon: CheckCircle },
  error: { bg: 'bg-red-50', border: 'border-error/30', text: 'text-error', Icon: XCircle },
  warning: { bg: 'bg-amber-50', border: 'border-warning/30', text: 'text-warning', Icon: AlertTriangle },
  info: { bg: 'bg-brand-tealLight', border: 'border-brand-teal/30', text: 'text-brand-teal', Icon: Info },
};

export default function Toast({ type = 'info', message, onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(true);
  const config = typeConfig[type];
  const Icon = config.Icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) {
    return (
      <div className="animate-fade-out opacity-0" style={{ animation: 'fade-out 0.3s ease-out forwards' }}>
        <div className={`flex items-start gap-3 rounded-xl p-4 text-sm border ${config.bg} ${config.border} ${config.text}`}>
          <Icon size={18} className="shrink-0 mt-0.5" />
          <p className="flex-1">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 rounded-xl p-4 text-sm border animate-scale-in ${config.bg} ${config.border} ${config.text}`}>
      <Icon size={18} className="shrink-0 mt-0.5" />
      <p className="flex-1">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
        className="ml-auto shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors duration-150"
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  );
}
