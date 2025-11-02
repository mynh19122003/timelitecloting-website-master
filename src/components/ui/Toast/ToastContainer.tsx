"use client";

import { useToast } from '../../../context/ToastContext';
import { Toast } from './Toast';
import styles from './ToastContainer.module.css';

export const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};








