import React, { useEffect, useState } from 'react'
import styles from './switch.module.scss'
const Switch = (props) => {
    const [checked, setChecked] = useState(false)
    const handleChange = () => {
        setChecked(!checked)
        props.onChange(!checked)
    }
    useEffect(() => {
        setChecked(props.value)
    }, [props.value])
    return (
        <div className={styles.switchView}>
            <label className={styles.switch}>
                <input checked={props.value || checked} onChange={() => handleChange()} type="checkbox" id="switch" />
                <span className={styles.slider}></span>
            </label>
            {props.label && <label className={styles.switchName} htmlFor='switch'>{props.label}</label>}
        </div>
    )
}

export default Switch