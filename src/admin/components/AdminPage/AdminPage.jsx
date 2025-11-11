import React from 'react'
import styles from './AdminPage.module.css'

const AdminPage = ({ title, subtitle, actions, children }) => {
  return (
    <div className={styles.page}>
      {(title || subtitle || actions) && (
        <div className={styles.headerRow}>
          <div>
            {title && <h1 className={styles.title}>{title}</h1>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {actions && <div className={styles.headerActions}>{actions}</div>}
        </div>
      )}

      <div className={styles.content}>{children}</div>
    </div>
  )
}

export default AdminPage
