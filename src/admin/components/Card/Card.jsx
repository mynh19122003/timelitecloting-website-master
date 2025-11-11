import React from 'react'
import styles from './Card.module.css'

const Card = ({ title, subtitle, action, actionLabel, children, bleed = false, className = '' }) => {
  return (
    <section className={`${styles.card} ${bleed ? styles.bleed : ''} ${className}`}>
      {(title || actionLabel) && (
        <header className={styles.header}>
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {actionLabel && (
            <button type="button" onClick={action} className={styles.headerBtn}>
              {actionLabel}
            </button>
          )}
        </header>
      )}
      <div className={styles.body}>{children}</div>
    </section>
  )
}

export default Card
