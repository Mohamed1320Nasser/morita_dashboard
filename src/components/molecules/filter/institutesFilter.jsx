import React, { useState } from 'react'
import Button from '@/components/atoms/buttons/button'
import styles from './filter.module.scss'

const InstitutesFilter = (props) => {
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
        All Requests ({props.totalCount})
      </Button>
      <Button
        disabled={props.pendingCount === 0}
        onClick={() => handleButtonClick('pending')}
        active={activeButton === 'pending'}>
        Pending ({props.pendingCount})
      </Button>
      <Button
        disabled={props.approvedCount === 0}
        onClick={() => handleButtonClick('approved')}
        active={activeButton === 'approved'}>
        Approved ({props.approvedCount})
      </Button>
      <Button
        disabled={props.declinedCount === 0}
        onClick={() => handleButtonClick('rejected')}
        active={activeButton === 'rejected'}>
        Declined ({props.declinedCount})
      </Button>
    </div>
  )
}

export default InstitutesFilter