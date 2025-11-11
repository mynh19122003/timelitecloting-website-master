import React from 'react'
import styles from './AuthLayout.module.css'

const AuthLayout = ({ title, subtitle, children, helper, footer }) => {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </header>

        {children}

        {helper && <div className={styles.helper}>{helper}</div>}

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </div>
  )
}

export default AuthLayout
