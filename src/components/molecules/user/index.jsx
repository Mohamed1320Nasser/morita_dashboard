import UserImg from '@/components/atoms/images/user'
import React from 'react'
import styles from './user.module.scss'
import Badge from '@/components/atoms/badge'

const User = ({userPage,state,name,img,role,inTable,vertical,defaults}) => {
  return (
    <div className={`${styles.user} ${inTable && styles.inTable} ${defaults && styles.default} ${vertical && styles.vertical}`}>
        <UserImg img={img} inTable={inTable} userPage={userPage}/>
        <div className={`${styles.userData} ${vertical && styles.vertical}`}>
            <h6 className={userPage && styles.lgTitle}>{name}</h6>
            {role && <span className={styles.role}>{role}</span>}
            {userPage && <div className="mt-2"><Badge lg="true" type={state === 'active' ? 'success' : 'danger'}>{state}</Badge></div>}
        </div>
    </div>
  )
}

export default User