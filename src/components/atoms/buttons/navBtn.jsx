import React from 'react'
import { Notification } from '../icons'
import styles from './buttons.module.scss'

const NavBtn = ({  }) => {
  return (
    <button className={styles.navBtn}>
        <Notification />
    </button>
  )
}

export default NavBtn