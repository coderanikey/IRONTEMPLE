import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const t = {
      id,
      type: toast.type || 'info',
      title: toast.title || '',
      message: toast.message || '',
      timeoutMs: typeof toast.timeoutMs === 'number' ? toast.timeoutMs : 3200,
    };
    setToasts((prev) => [t, ...prev].slice(0, 4));
    window.setTimeout(() => remove(id), t.timeoutMs);
  }, [remove]);

  const api = useMemo(() => ({ push, remove, toasts }), [push, remove, toasts]);
  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

