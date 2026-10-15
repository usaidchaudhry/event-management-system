import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeToast, selectToasts } from '../features/ui/uiSlice.js';

function Toast({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(removeToast(toast.id)), 4500);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <p>{toast.message}</p>
      <button type="button" aria-label="Dismiss message" onClick={() => dispatch(removeToast(toast.id))}>
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector(selectToasts);
  return (
    <div className="toast-region" aria-live="polite">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
