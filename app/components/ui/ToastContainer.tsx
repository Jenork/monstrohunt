'use client';

import { useToastContext } from '../../contexts/ToastContext';
import styles from './ToastContainer.module.css';

export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type]}`}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
