import React, { useState, useRef, useEffect } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import styles from './EmojiPickerPopover.module.scss'

const EmojiPickerPopover = ({ value, onChange, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false)
      }
    }

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPicker])

  const handleEmojiSelect = (emoji) => {
    onChange(emoji.native)
    setShowPicker(false)
  }

  return (
    <div className={styles.emojiPickerWrapper} ref={pickerRef}>
      <button
        type="button"
        className={styles.emojiButton}
        onClick={() => !disabled && setShowPicker(!showPicker)}
        disabled={disabled}
        title="Select emoji"
      >
        {value || '😀'}
      </button>

      {showPicker && (
        <div className={styles.pickerPopover}>
          <Picker
            data={data}
            onEmojiSelect={handleEmojiSelect}
            theme="light"
            previewPosition="none"
            skinTonePosition="none"
            searchPosition="top"
            perLine={8}
            maxFrequentRows={2}
          />
        </div>
      )}
    </div>
  )
}

export default EmojiPickerPopover
