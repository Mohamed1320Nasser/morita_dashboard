import React, { useState, useEffect } from 'react'
import InputBox from '@/components/molecules/inputBox/inputBox'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { normalizeIncomingEmoji } from '@/utils/emoji'
import styles from './Step.module.scss'

const ServiceStep = ({ data, onChange }) => {
  const [name, setName] = useState(data?.name || '')
  const [emoji, setEmoji] = useState(normalizeIncomingEmoji(data?.emoji))
  const [description, setDescription] = useState(data?.description || '')
  const [displayOrder, setDisplayOrder] = useState(data?.displayOrder || 0)
  const [active, setActive] = useState(data?.active ?? true)

  useEffect(() => {
    onChange({
      name,
      emoji,
      description,
      displayOrder: parseInt(displayOrder) || 0,
      active,
    })
  }, [name, emoji, description, displayOrder, active])

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Service Information</h2>
      <p className={styles.stepDescription}>Enter the details for your new service</p>

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
          <div></div>
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
    </div>
  )
}

export default ServiceStep
