import React, { useEffect, useRef, useState } from 'react'
import styles from './kebab.module.scss'

const KebabMenu = ({ actions = [] }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target) && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  useEffect(() => {
    if (open && ref.current && menuRef.current) {
      const buttonRect = ref.current.getBoundingClientRect()
      const menu = menuRef.current
      
      // Position menu below button, aligned to the right
      menu.style.top = `${buttonRect.bottom + 8}px`
      menu.style.right = `${window.innerWidth - buttonRect.right}px`
    }
  }, [open])

  return (
    <div ref={ref} className={styles.wrapper}>
      <button className={styles.kebab} aria-label="Actions" onClick={() => setOpen(v => !v)}>
        <span />
        <span />
        <span />
      </button>
      {open && (
        <div ref={menuRef} className={styles.menu}>
          {actions.map((a, idx) => (
            <button key={idx} className={styles.item} onClick={() => { setOpen(false); a.onClick?.() }}> {a.label} </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default KebabMenu


