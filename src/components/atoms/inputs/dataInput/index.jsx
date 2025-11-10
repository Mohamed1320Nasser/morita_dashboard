import React, { useState } from 'react'
import styles from './dataInput.module.scss'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
const DataInput = (props) => {
  const { value, valueChange, button } = props;
  const handleInputChange = (event) => {
    if (valueChange && typeof valueChange === 'function') {
      valueChange(event.target.value);
    }
  };

  const [view, setView] = useState(false)
  const handleWheel = (e) => {
    e.target.blur();
  };
  return (
    <div className={styles.inputView}>
      {!props.textarea ?
        <input
          onKeyPress={props.onKeyPress}
          onChange={handleInputChange}
          value={value}
          className={`${styles.input} ${props.dataInput && styles.dataInput} ${props.ar && styles.ar}`}
          placeholder={props.placeholder ? props.placeholder : 'PLaceholder'} type={view ? 'text' : props.type}
          onWheel={props.type === "number" ? handleWheel : null}

        />
        :
        <textarea
          onChange={handleInputChange}
          value={value}
          rows={4}
          className={`${styles.input} ${props.dataInput && styles.dataInput} ${props.ar && styles.ar}`}
          placeholder={props.placeholder ? props.placeholder : 'PLaceholder'}
        ></textarea>
      }
      {props.type === "password" &&
        <button onClick={() => setView(!view)} className={styles.eye}>{!view ? <AiFillEye /> : <AiFillEyeInvisible />}</button>
      }
      {button ?
        <div className={styles.button}>
          {button}
        </div>
        : null
      }
    </div>
  )
}

export default DataInput