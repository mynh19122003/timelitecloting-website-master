import React from 'react'
import { FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi'
import styles from './StatCard.module.css'

const StatCard = ({ icon: Icon, label, value, delta, trend = 'up', accent = 'primary' }) => {
  const isPositive = trend !== 'down'

  return (
    <article className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.iconWrap}>{Icon && <Icon />}</div>
      <div className={styles.meta}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </div>
      {delta !== undefined && (
        <div className={`${styles.delta} ${isPositive ? styles.up : styles.down}`}>
          {isPositive ? <FiArrowUpRight /> : <FiArrowDownRight />}
          <span>{delta}</span>
        </div>
      )}
    </article>
  )
}

export default StatCard
