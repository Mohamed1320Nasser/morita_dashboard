import React from 'react'
import styles from './badge.module.scss'

const Badge = ({ type, lg, children, onClick }) => {
  return (
    <span
      onClick={onClick}
      className={`
        ${styles.badge}
        ${type === 'success' && styles.suceess}
        ${type === 'pending' && styles.pending}
        ${lg === 'success' && styles.lg}
        ${type === 'danger' && styles.danger}
        ${type === 'purple' && styles.purple}
        ${type === 'blue' && styles.blue}
        ${type === 'yellow' && styles.yellow}
        ${onClick && styles.clickable}
        `}>{children}</span>
  )
}

export default Badge