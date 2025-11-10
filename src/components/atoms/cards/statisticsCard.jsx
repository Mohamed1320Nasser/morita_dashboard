import React from 'react'
import styles from './cards.module.scss'
import CountUp from 'react-countup';
import Link from 'next/link';
const StatisticsCard = ({icon,title,count,color,link}) => {
  return (
    <div className={`${styles.card} ${styles.statisticsCard} ${link ? styles.withLink : ''}`}>
        {link && <Link href={link || '/'}></Link>}
        <div className={styles.icon} style={{color:color,backgroundColor:`${color}30`}}>
            {icon}
        </div>
        <h5><CountUp end={count} /></h5>
        <h6>{title}</h6>
    </div>
  )
}

export default StatisticsCard