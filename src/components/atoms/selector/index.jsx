import React from 'react'
import styles from './selector.module.scss'
import { PulseLoader } from 'react-spinners'

const Selector = ({ searchValue, setSearchValue, data, setSelected, selected, isLoading }) => {
    return (
        <div className={styles.selector}>
            <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} type="text" placeholder='search by name' />
            <div
                className={styles.selectorData}
                style={{
                    height: '200px',
                    overflow: 'auto',
                }}
            >
                {data.map((item, i) => (
                    < button className={`${selected?.id === item.id ? styles.active : ''}`} onClick={() => setSelected(item)} key={i}>{item.title}   </button>
                ))}
                {isLoading && <div className='loading'><PulseLoader color="#006666" size={7} /></div>}
            </div>
        </div >
    )
}

export default Selector