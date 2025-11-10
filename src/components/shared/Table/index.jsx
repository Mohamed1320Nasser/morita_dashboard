import React from 'react'
import styles from './table.module.scss'

const Table = ({ columns = [], data = [] }) => {
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.thead}>
        {columns.map(col => (
          <div
            key={col.key}
            className={`${styles.th} ${col.className || ''}`}
            style={col.width ? { flex: `0 0 ${col.width}` } : { flex: col.flex || 1 }}
          >
            {col.header}
          </div>
        ))}
      </div>
      <div className={styles.tbody}>
        {data.map((row, idx) => (
          <div key={row.id || idx} className={styles.tr}>
            {columns.map(col => (
              <div
                key={col.key}
                className={`${styles.td} ${col.className || ''}`}
                style={col.width ? { flex: `0 0 ${col.width}` } : { flex: col.flex || 1 }}
              >
                {col.render ? col.render(row, idx) : row[col.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Table


