import React from 'react'
import styles from './filter.module.scss'

const TableFilter = ({children,size}) => {
  return (
    <>
    <div className={`${styles.filter} ${size === 'lg' && styles.filterLg}`}>
        {children}
    </div>
    </>

  )
}

export default TableFilter