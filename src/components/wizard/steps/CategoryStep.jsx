import React, { useState, useEffect } from 'react'
import InputBox from '@/components/molecules/inputBox/inputBox'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { normalizeIncomingEmoji } from '@/utils/emoji'
import styles from './Step.module.scss'

const CategoryStep = ({ data, categories, onChange }) => {
  const [mode, setMode] = useState(data?.mode || 'existing')
  const [existingId, setExistingId] = useState(data?.existingId || '')
  const [name, setName] = useState(data?.name || '')
  const [emoji, setEmoji] = useState(normalizeIncomingEmoji(data?.emoji))
  const [description, setDescription] = useState(data?.description || '')
  const [active, setActive] = useState(data?.active ?? true)

  useEffect(() => {
    onChange({
      mode,
      ...(mode === 'existing' ? { existingId } : { name, emoji, description, active }),
    })
  }, [mode, existingId, name, emoji, description, active])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (newMode === 'existing' && categories.length > 0) {
      setExistingId(categories[0].id)
    }
  }

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Select or Create Category</h2>
      <p className={styles.stepDescription}>Choose an existing category or create a new one for your service</p>

      <div className={styles.modeSelector}>
        <label className={`${styles.modeOption} ${mode === 'existing' ? styles.active : ''}`}>
          <input
            type="radio"
            name="categoryMode"
            value="existing"
            checked={mode === 'existing'}
            onChange={() => handleModeChange('existing')}
          />
          <span>Use Existing Category</span>
        </label>
        <label className={`${styles.modeOption} ${mode === 'new' ? styles.active : ''}`}>
          <input
            type="radio"
            name="categoryMode"
            value="new"
            checked={mode === 'new'}
            onChange={() => handleModeChange('new')}
          />
          <span>Create New Category</span>
        </label>
      </div>

      {mode === 'existing' ? (
        <div className={styles.formGroup}>
          <label>Select Category *</label>
          <select
            value={existingId}
            onChange={(e) => setExistingId(e.target.value)}
            className={styles.select}
          >
            <option value="">-- Select a category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className={styles.formFields}>
          <div className={styles.row}>
            <InputBox
              label="Category Name *"
              placeholder="Enter category name"
              value={name}
              valueChange={setName}
            />
            <EmojiField
              label="Emoji"
              value={emoji}
              onChange={setEmoji}
              placeholder="Pick an emoji"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Enter category description"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>Active (immediately available)</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryStep
