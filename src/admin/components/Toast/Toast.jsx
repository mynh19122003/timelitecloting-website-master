import { useEffect } from 'react'
import { FiCheckCircle, FiX, FiAlertCircle } from 'react-icons/fi'
import styles from './Toast.module.css'

/**
 * Toast notification component
 * @param {Object} props
 * @param {'success' | 'error'} props.type - Type of toast
 * @param {string} props.message - Message to display
 * @param {Function} props.onClose - Callback when toast is closed
 * @param {number} props.duration - Auto-close duration in ms (default: 3000)
 */
export const Toast = ({ type = 'success', message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      <div className={styles.toastIcon}>
        {type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
      </div>
      <div className={styles.toastMessage}>{message}</div>
      <button type="button" className={styles.toastClose} onClick={onClose}>
        <FiX />
      </button>
    </div>
  )
}

