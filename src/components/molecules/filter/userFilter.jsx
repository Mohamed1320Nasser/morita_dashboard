import React, { useState } from 'react'
import Button from '@/components/atoms/buttons/button'
import styles from './filter.module.scss'
const UsersFilter = (props) => {
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
        All Accounts ({props.totalCount})
      </Button>
      <Button
        disabled={props.activeButton ===1}
        onClick={() => handleButtonClick(1)}
        active={activeButton === 1}>
        Users ({props.usersCount})
      </Button>
      <Button
        disabled={props.bannedCount === 2}
        onClick={() => handleButtonClick(2)}
        active={activeButton === 2}>
        Vendors ({props.vendorCount})
      </Button>
    </div>
  )
}

export default UsersFilter