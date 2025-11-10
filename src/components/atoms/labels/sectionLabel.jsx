import React from 'react'
import styles from './labels.module.scss'
const SectionLabel = ({ children, sm, label }) => {
  return (
    <>
      <h6 className={`${styles.section} ${label ? 'mb-1' : ''} ${sm ? styles.sm : ''}`}>{children}</h6>
      <p className={styles.label}>{label}</p>
    </>
  )
}

export default SectionLabel