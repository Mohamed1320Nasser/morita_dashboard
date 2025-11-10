import React from 'react'
import styles from './cards.module.scss'

const Card = ({children,title,flexCenter,className}) => {
  return (
    <div className={`${styles.card} ${flexCenter && styles.flexCenter} ${className && className}`}>
      {title &&<h6 className={styles.title}>{title}</h6>}
      {children}
    </div>
  )
}

export default Card