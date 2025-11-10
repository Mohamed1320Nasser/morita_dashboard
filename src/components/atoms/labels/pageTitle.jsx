import React from 'react'
import styles from './labels.module.scss'
const PageTitle = ({children}) => {
  return (
    <h6 className={styles.pageTitle}>{children}</h6>
  )
}

export default PageTitle