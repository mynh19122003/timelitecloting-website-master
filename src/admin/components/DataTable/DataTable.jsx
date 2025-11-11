import React from 'react'
import StatusBadge from '../StatusBadge/StatusBadge'
import styles from './DataTable.module.css'

const DataTable = ({ columns, data, dense = false, emptyState }) => {
  return (
    <div className={`${styles.wrapper} ${dense ? styles.dense : ''}`}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={{ textAlign: column.align || 'left', width: column.width }}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyState || 'No data available'}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id || row.key || row.name}>
                {columns.map((column) => {
                  const value = row[column.key]
                  if (column.render) {
                    return (
                      <td key={column.key} style={{ textAlign: column.align || 'left' }}>
                        {column.render(value, row)}
                      </td>
                    )
                  }
                  if (column.type === 'status') {
                    return (
                      <td key={column.key} style={{ textAlign: column.align || 'left' }}>
                        <StatusBadge status={value} />
                      </td>
                    )
                  }
                  return (
                    <td key={column.key} style={{ textAlign: column.align || 'left' }}>
                      {value}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
