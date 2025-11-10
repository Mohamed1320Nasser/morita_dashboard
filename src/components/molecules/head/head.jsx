import Button from '@/components/atoms/buttons/button'
import PageTitle from '@/components/atoms/labels/pageTitle'
import React from 'react'
import styles from './head.module.scss'
import {  BackArrow } from '@/components/atoms/icons'
import Link from 'next/link'
const Head = ({ title, back, des, children, onClick, btns }) => {
  return (
    <>
      <div className={styles.head}>
        <div className={styles.headTitle}>
          {back &&
            <Link href={back} className={styles.back}><BackArrow /></Link>
          }
          <PageTitle>{title}</PageTitle>
        </div>
        {children && !btns ? <Button onClick={onClick} primary>{children}</Button> : null}
        {btns &&
          <div className={styles.btns}>
            {children}
          </div>
        }
      </div>
      {des &&
        <p className={styles.des}>{des}</p>
      }
    </>
  )
}

export default Head