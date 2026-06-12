import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export interface ToastItem {
  id: string;
  message: string;
  submessage: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (message: string, submessage?: string, type?: ToastItem['type']) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (message: string, submessage: string = '', type: ToastItem['type'] = 'success'): string => {
      const id = `toast_${crypto.randomUUID()}`;
      setToasts((prev) => [...prev, { id, message, submessage, type }]);
      return id;
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Auto-dismiss toasts after a duration
  useEffect(() => {
    if (toasts.length === 0) return;
    const latest = toasts[toasts.length - 1];
    const timer = setTimeout(() => {
      dismissToast(latest.id);
    }, DEFAULT_DURATION);
    return () => clearTimeout(timer);
  }, [toasts, dismissToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearToasts }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
