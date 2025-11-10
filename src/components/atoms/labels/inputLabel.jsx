import React from 'react'
import styles from './labels.module.scss'
const InputLabel = ({children,ar}) => {
  return (
    <label className={`${styles.label} ${ar && styles.ar}`}>{children}</label>
  )
}

export default InputLabel