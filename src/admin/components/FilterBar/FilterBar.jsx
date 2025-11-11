import React from 'react'
import { FiSliders, FiFilter, FiPlus } from 'react-icons/fi'
import styles from './FilterBar.module.css'

const FilterBar = ({
  title,
  subtitle,
  primaryAction,
  secondaryAction,
  onPrimaryAction,
  onSecondaryAction,
  children
}) => {
  return (
    <div className={styles.bar}>
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className={styles.controls}>
        {children}
        {secondaryAction && (
          <button type="button" className={styles.secondary} onClick={onSecondaryAction}>
            <FiFilter />
            <span>{secondaryAction}</span>
          </button>
        )}
        {primaryAction && (
          <button type="button" className={styles.primary} onClick={onPrimaryAction}>
            <FiPlus />
            <span>{primaryAction}</span>
          </button>
        )}
      </div>
    </div>
  )
}

export const QuickFilters = ({ items = [], onChange }) => {
  return (
    <div className={styles.quickFilters}>
      <FiSliders />
      <div className={styles.chips}>
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`${styles.chip} ${item.active ? styles.active : ''}`}
            onClick={() => onChange && onChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default FilterBar
