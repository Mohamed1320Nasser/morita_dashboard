import React from 'react'
import styles from './sidelink.module.scss'

const SideLink = ({children,title,count}) => {
  return (
    <div className={styles.sideLink}>
        {children}
        <span className={styles.title}>{title}</span>
        {count > 0 &&
          <span className={styles.count}>{count < 10 ? count : '+9'}</span>
        }
    </div>
  )
}

export default SideLink