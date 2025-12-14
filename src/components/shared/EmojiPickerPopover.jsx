import React, { useState, useRef, useEffect } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import styles from './EmojiPickerPopover.module.scss'

const EmojiPickerPopover = ({ value, onChange, disabled = false }) => {
  const [showPicker, setShowPicker] = useState(false)
  const [mode, setMode] = useState('unicode') // 'unicode' or 'discord'
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

  const toggleMode = () => {
    setMode(m => m === 'unicode' ? 'discord' : 'unicode')
    setShowPicker(false)
  }

  return (
    <div className={styles.emojiPickerWrapper} ref={pickerRef}>
      <div className={styles.emojiButtonGroup}>
        {mode === 'unicode' ? (
          <button
            type="button"
            className={styles.emojiButton}
            onClick={() => !disabled && setShowPicker(!showPicker)}
            disabled={disabled}
            title="Select emoji"
          >
            {value || '😀'}
          </button>
        ) : (
          <input
            type="text"
            className={styles.emojiInput}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Type \:name: in chat"
            disabled={disabled}
            title="Type \:emoji_name: in Discord chat to get the code"
          />
        )}
        <button
          type="button"
          className={styles.modeToggle}
          onClick={toggleMode}
          disabled={disabled}
          title={mode === 'unicode' ? 'Switch to Discord Emoji' : 'Switch to Unicode Emoji'}
        >
          {mode === 'unicode' ? '🎮' : '😀'}
        </button>
      </div>

      {showPicker && mode === 'unicode' && (
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
