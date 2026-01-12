import React from 'react';
import { useToast } from '../context/ToastContext';
import './Toast.css';

const Toast = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-wrapper" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type || 'info'}`} role="status">
          <div className="toast-message">{t.message}</div>
          <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Fermer">×</button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
