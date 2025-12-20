import React, { useState, useEffect } from 'react'
import InputBox from '@/components/molecules/inputBox/inputBox'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { normalizeIncomingEmoji } from '@/utils/emoji'
import styles from './Step.module.scss'

const ServiceStep = ({ data, services, onChange }) => {
  const [mode, setMode] = useState(data?.mode || 'new')
  const [existingId, setExistingId] = useState(data?.existingId || '')
  const [name, setName] = useState(data?.name || '')
  const [emoji, setEmoji] = useState(normalizeIncomingEmoji(data?.emoji))
  const [imageUrl, setImageUrl] = useState(data?.imageUrl || '')
  const [description, setDescription] = useState(data?.description || '')
  const [displayOrder, setDisplayOrder] = useState(data?.displayOrder || 0)
  const [active, setActive] = useState(data?.active ?? true)

  useEffect(() => {
    onChange({
      mode,
      ...(mode === 'existing'
        ? { existingId }
        : { name, emoji, imageUrl, description, displayOrder, active }
      ),
    })
  }, [mode, existingId, name, emoji, imageUrl, description, displayOrder, active])

  const handleModeChange = (newMode) => {
    setMode(newMode)
    if (newMode === 'existing' && services && services.length > 0) {
      setExistingId(services[0].id)
    }
  }

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Select or Create Service</h2>
      <p className={styles.stepDescription}>
        Choose an existing service to add pricing methods, or create a new one
      </p>

      <div className={styles.modeSelector}>
        <label className={`${styles.modeOption} ${mode === 'new' ? styles.active : ''}`}>
          <input
            type="radio"
            name="serviceMode"
            value="new"
            checked={mode === 'new'}
            onChange={() => handleModeChange('new')}
          />
          <span>Create New Service</span>
        </label>
        <label className={`${styles.modeOption} ${mode === 'existing' ? styles.active : ''}`}>
          <input
            type="radio"
            name="serviceMode"
            value="existing"
            checked={mode === 'existing'}
            onChange={() => handleModeChange('existing')}
          />
          <span>Use Existing Service</span>
        </label>
      </div>

      {mode === 'existing' ? (
        <div className={styles.formGroup}>
          <label>Select Service *</label>
          {!services ? (
            <div className={styles.loadingMessage}>Loading services...</div>
          ) : services.length === 0 ? (
            <div className={styles.emptyMessage}>
              <p>No services available in this category yet.</p>
              <p>Please create a new service instead.</p>
            </div>
          ) : (
            <select
              value={existingId}
              onChange={(e) => setExistingId(e.target.value)}
              className={styles.select}
            >
              <option value="">-- Select a service --</option>
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.emoji} {svc.name}
                </option>
              ))}
            </select>
          )}
        </div>
      ) : (
        <div className={styles.formFields}>
          <div className={styles.row}>
            <InputBox
              label="Service Name *"
              placeholder="Enter service name"
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

          <div className={styles.row}>
            <InputBox
              label="Priority"
              placeholder="0"
              value={displayOrder}
              valueChange={(v) => setDisplayOrder(parseInt(v) || 0)}
              type="number"
            />
            <InputBox
              label="Image URL"
              placeholder="https://oldschool.runescape.wiki/images/..."
              value={imageUrl}
              valueChange={setImageUrl}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Enter service description"
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

export default ServiceStep
