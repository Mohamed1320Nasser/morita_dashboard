import React, { useState, useEffect, useRef } from 'react'
import PageTitle from '@/components/atoms/labels/pageTitle'
import InputBox from '@/components/molecules/inputBox/inputBox'
import Button from '@/components/atoms/buttons/button'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { valueForSubmit, normalizeIncomingEmoji } from '@/utils/emoji'
import grid from './forms.module.scss'

const CategoryForm = ({ title, initial = {}, submitting = false, onCancel, onSubmit }) => {
  const [name, setName] = useState(initial.name || '')
  const [description, setDescription] = useState(initial.description || '')
  const [emoji, setEmoji] = useState(normalizeIncomingEmoji(initial.emoji))
  const [active, setActive] = useState(initial.active ?? true)
  const lastInitialRef = useRef(JSON.stringify({ name: initial.name, description: initial.description, emoji: initial.emoji, active: initial.active }))

  // Sync when initial prop changes (edit mode) - only when values actually change
  useEffect(() => {
    const currentKey = JSON.stringify({ name: initial.name, description: initial.description, emoji: initial.emoji, active: initial.active })

    // Only sync if the initial data actually changed
    if (currentKey !== lastInitialRef.current) {
      lastInitialRef.current = currentKey

      setName(initial.name || '')
      setDescription(initial.description || '')
      setEmoji(normalizeIncomingEmoji(initial.emoji))
      setActive(initial.active ?? true)
    }
  }, [initial.name, initial.description, initial.emoji, initial.active])

  const handleSubmit = () => {
    const payload = {
      name,
      description,
      emoji: valueForSubmit(emoji),
      active,
    }
    onSubmit?.(payload)
  }

  return (
    <div className={grid.wrap}>
      {title && <PageTitle title={title} />}
      <div className={grid.grid}>
        {/* Row 1 */}
        <InputBox label="Category Name" placeholder="Enter category name" value={name} valueChange={setName} />
        <EmojiField label="Emoji" value={emoji} onChange={setEmoji} placeholder="Pick an emoji (e.g., 🎮)" />

        {/* Row 2 */}
        <div className={grid.span2}>
          <label style={{ display: 'block', marginBottom: 6 }}>Description</label>
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #f6f6f6' }} placeholder="Enter category description" />
        </div>

        {/* Row 3: actions */}
        <div className={grid.actionsRow + ' ' + grid.span2}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={active} onChange={() => setActive(!active)} />
            <span>Active</span>
          </label>
          <div className={grid.actionsRight}>
            <Button onClick={onCancel} secondary>Cancel</Button>
            <Button onClick={handleSubmit} primary disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryForm


