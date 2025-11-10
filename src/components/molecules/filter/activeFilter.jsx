import React, { useState } from 'react'
import Button from '@/components/atoms/buttons/button'
import styles from './filter.module.scss'
const ActiveFilter = (props) => {
  const [activeButton, setActiveButton] = useState(0);

  function handleButtonClick(buttonValue) {
    setActiveButton(buttonValue);
    props.onButtonClick(buttonValue);
  }

  return (
    <div className={styles.filter}>
      <Button
        onClick={() => handleButtonClick(0)}
        active={activeButton === 0}>
        Active ({props.activeCount})
      </Button>
      <Button
        disabled={props.activeButton ===1}
        onClick={() => handleButtonClick(1)}
        active={activeButton === 1}>
        Inactive ({props.inActiveCount})
      </Button>
    </div>
  )
}

export default ActiveFilter