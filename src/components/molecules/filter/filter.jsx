import React, { useState } from 'react'
import Button from '@/components/atoms/buttons/button'
import styles from './filter.module.scss'
const Filter = (props) => {
  const [activeButton, setActiveButton] = useState(2);

  function handleButtonClick(buttonValue) {
    setActiveButton(buttonValue);
    props.onButtonClick(buttonValue);
  }
  return (
    <div className={styles.filter}>
      <Button
        onClick={() => handleButtonClick(2)}
        active={activeButton === 2}>
        {props.allText ? props.allText : 'All Users'} {props.totalCount != 0 && `(${props.totalCount})`}
      </Button>

      <Button
        disabled={props.activeCount === 0}
        onClick={() => handleButtonClick(1)}
        active={activeButton === 1}>
        {props.secondText ? props.secondText : 'Active'} {props.activeCount != 0 && `(${props.activeCount})`}
      </Button>

      <Button
        disabled={props.bannedCount === 0}
        onClick={() => handleButtonClick(0)}
        active={activeButton === 0}>
        {props.thirdText ? props.thirdText : 'Inactive'} {props.bannedCount != 0 && `(${props.bannedCount})`}
      </Button>
    </div>
  )
}

export default Filter