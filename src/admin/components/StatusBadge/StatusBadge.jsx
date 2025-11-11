import React from 'react'
import styles from './StatusBadge.module.css'

const STATUS_MAP = {
  paid: { label: 'Paid', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  processing: { label: 'Processing', tone: 'primary' },
  draft: { label: 'Draft', tone: 'muted' },
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'muted' },
  expired: { label: 'Expired', tone: 'danger' }
}

const StatusBadge = ({ status, tone, children }) => {
  const normalized = typeof status === 'string' ? status.toLowerCase() : ''
  const config = STATUS_MAP[normalized] || {}
  const badgeTone = tone || config.tone || 'muted'
  const label = children || config.label || status

  return <span className={`${styles.badge} ${styles[badgeTone]}`}>{label}</span>
}

export default StatusBadge
