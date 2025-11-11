import React from 'react'
import Card from '../components/Card/Card'
import styles from './Updates.module.css'

const releases = [
  {
    version: 'v2.6.0',
    date: 'May 20, 2025',
    notes: ['New advanced filters for orders.', 'Improved dashboard performance.', 'Added multi-storefront support.']
  },
  {
    version: 'v2.5.3',
    date: 'May 05, 2025',
    notes: ['Bug fixes for CSV exports.', 'Refined coupon creation flow.']
  },
  {
    version: 'v2.5.0',
    date: 'Apr 22, 2025',
    notes: ['Introduced customer segments.', 'Added real-time inventory sync with ERP integrations.']
  }
]

const Updates = () => {
  return (
    <div className={styles.page}>
      <Card title="Product Updates" subtitle="Track what is new in the Fastcart admin experience.">
        <ul className={styles.list}>
          {releases.map((release) => (
            <li key={release.version}>
              <div className={styles.header}>
                <span className={styles.version}>{release.version}</span>
                <span className={styles.date}>{release.date}</span>
              </div>
              <ul>
                {release.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

export default Updates
