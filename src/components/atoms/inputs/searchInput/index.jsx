import React from 'react'
import { Cross, Search } from '../../icons'
import styles from './searchInput.module.scss'
const SearchInput = (props) => {

  const { value, valueChange } = props;
  const handleInputChange = (event) => {
    if (valueChange && typeof valueChange === 'function') {
      valueChange(event);
    }
  };

  return (
    <div className={`${styles.input} ${props.defaultInput&& styles.defaultInput}`}>
      <div className={`${styles.ico} ${styles.search}`}>
        <Search/>
      </div>
      <input onChange={e=> handleInputChange(e.target.value)} value={value} type="text" placeholder={props.placeHolder ? props.placeHolder :'Search'} />
      {value &&
        <button onClick={()=> handleInputChange('')} className={`${styles.ico} ${styles.delete}`}>
          <Cross/>
        </button>
      }
    </div>
  )
}

export default SearchInput