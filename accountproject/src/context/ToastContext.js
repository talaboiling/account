// src/context/ToastContext.js
import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(null);
let idCounter = 0;

const ICONS = { success: '✓', error: '⚠️' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const remove = useCallback(id => {
    setToasts(t => t.filter(x => x.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const dismiss = useCallback(id => {
    setToasts(t => t.map(x => (x.id === id ? { ...x, leaving: true } : x)));
    clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => remove(id), 220);
  }, [remove]);

  const push = useCallback((type, message) => {
    const id = ++idCounter;
    setToasts(t => [...t, { id, type, message, leaving: false }]);
    timers.current[id] = setTimeout(() => dismiss(id), 3200);
  }, [dismiss]);

  const clearAll = useCallback(() => {
    Object.values(timers.current).forEach(clearTimeout);
    timers.current = {};
    setToasts([]);
  }, []);

  const toast = {
    success: message => push('success', message),
    error: message => push('error', message),
    clearAll,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast toast--${t.type}${t.leaving ? ' toast--leaving' : ''}`}
            onClick={() => dismiss(t.id)}
          >
            <span className="toast__icon">{ICONS[t.type]}</span>
            <span className="toast__msg">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() { return useContext(ToastContext); }
