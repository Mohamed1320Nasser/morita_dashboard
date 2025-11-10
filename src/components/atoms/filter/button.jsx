import React from 'react'
import {BsFilter} from 'react-icons/bs'
import styles from './filter.module.scss'
const FilterButton = ({onClick,children}) => {
  return (
    <button onClick={onClick} className={styles.button}>{children ? children : <BsFilter/>}</button>

  )
}

export default FilterButton