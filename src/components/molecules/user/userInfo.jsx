import React from 'react'
import styles from './user.module.scss'
import UserImg from '@/components/atoms/images/user'
import Badge from '@/components/atoms/badge'

const UserInfo = ({img,name,state}) => {
  return (
    <div className={styles.userInfo}>
        <UserImg img={img} userPage={true}/>
        <div className={styles.vertical}>
            <h6 className={styles.lgTitle}>{name}</h6>
            <div className="mt-2"><Badge lg="true" type={state ? 'danger' : 'success'}>{state ? 'inactive': 'active'}</Badge></div>
        </div>
    </div>
  )
}

export default UserInfo