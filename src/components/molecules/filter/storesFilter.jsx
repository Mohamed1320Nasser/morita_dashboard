import React, { useState } from 'react'
import Button from '@/components/atoms/buttons/button'
import styles from './filter.module.scss'
const StoresFilter = (props) => {
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
        All Stores ({props.totalCount})
      </Button>
      <Button
        disabled={props.activeButton ===0}
        onClick={() => handleButtonClick(0)}
        active={activeButton === 0}>
        Active ({props.activeCount})
      </Button>
      <Button
        disabled={props.bannedCount === 0}
        onClick={() => handleButtonClick(1)}
        active={activeButton === 1}>
        Inactive ({props.bannedCount})
      </Button>
      <Button
        disabled={props.bannedCount === 0}
        onClick={() => handleButtonClick(3)}
        active={activeButton === 3}>
        Stores Requests ({props.requestsTotal})
      </Button>
    </div>
  )
}

export default StoresFilter