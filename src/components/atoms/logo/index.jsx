import React from 'react'
import styles from './logo.module.scss'

const Logo = () => {
  return (
    <div className={styles.logo}>
      <img src="/logo2.png" alt="Morita Gaming" className={styles.logoImage} />
      <h2 className={styles.brandName}>MORITA</h2>
      <p className={styles.brandSlogan}>Premium Gaming Services</p>
    </div>
  )
}

export default Logo