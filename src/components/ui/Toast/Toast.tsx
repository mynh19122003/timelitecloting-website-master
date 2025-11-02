"use client";

import { useEffect } from 'react';
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { Toast as ToastType, useToast } from '../../../context/ToastContext';
import styles from './Toast.module.css';

interface ToastProps {
  toast: ToastType;
}

const getIcon = (type: ToastType['type']) => {
  switch (type) {
    case 'success':
      return <FiCheckCircle className={styles.icon} />;
    case 'error':
      return <FiXCircle className={styles.icon} />;
    case 'warning':
      return <FiAlertCircle className={styles.icon} />;
    case 'info':
      return <FiInfo className={styles.icon} />;
    default:
      return <FiInfo className={styles.icon} />;
  }
};

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();

  useEffect(() => {
    // Backup auto-remove in case context timer fails
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div className={`${styles.toast} ${styles[toast.type]}`}>
      <div className={styles.content}>
        {getIcon(toast.type)}
        <p className={styles.message}>{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className={styles.closeButton}
        aria-label="Close notification"
      >
        <FiX className={styles.closeIcon} />
      </button>
    </div>
  );
};








