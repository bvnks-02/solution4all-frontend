import { useState, useCallback } from 'react';
import Toast from './Toast';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Expose addToast globally for admin components
  if (typeof window !== 'undefined') {
    window.__toast = addToast;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export function useToast() {
  return {
    success: (msg, dur) => window.__toast?.('success', msg, dur),
    error: (msg, dur) => window.__toast?.('error', msg, dur),
    warning: (msg, dur) => window.__toast?.('warning', msg, dur),
    info: (msg, dur) => window.__toast?.('info', msg, dur),
  };
}
