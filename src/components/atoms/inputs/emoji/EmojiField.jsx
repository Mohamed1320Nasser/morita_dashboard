import React, { useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import styles from './emoji.module.scss'

// SSR-safe Picker import (emoji-mart v5)
const Picker = dynamic(() => import('@emoji-mart/react').then(m => m.default || m), { ssr: false })
import data from '@emoji-mart/data'

const EmojiField = ({ label = 'Emoji', value, onChange, placeholder = 'Select emoji', disabled = false, allowClear = true }) => {
  const [open, setOpen] = useState(false)
  const anchorRef = useRef(null)

  const handlePick = (emoji) => {
    // emoji-mart v5 provides 'native' and 'shortcodes'
    const unicode = emoji?.native || ''
    const shortcode = emoji?.shortcodes || ''
    onChange?.({ unicode, shortcode })
    setOpen(false)
  }

  const display = useMemo(() => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value.unicode || ''
  }, [value])

  const clear = () => {
    onChange?.({ unicode: '', shortcode: '' })
  }

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputRow} ref={anchorRef}>
        <input
          className={styles.input}
          type="text"
          placeholder={placeholder}
          value={display}
          onChange={(e) => onChange?.({ unicode: e.target.value, shortcode: '' })}
          disabled={disabled}
        />
        {allowClear && display ? (
          <button type="button" className={styles.clearBtn} onClick={clear} disabled={disabled}>×</button>
        ) : null}
        <button type="button" className={styles.pickerBtn} onClick={() => setOpen(v => !v)} disabled={disabled}>🙂</button>
      </div>

      {open && (
        <div className={styles.popover}>
          <Picker data={data} onEmojiSelect={handlePick} locale="en" previewPosition="none" theme="light" />
        </div>
      )}
    </div>
  )
}

export default EmojiField


