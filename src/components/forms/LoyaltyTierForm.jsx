import React, { useEffect, useState, useRef } from 'react'
import PageTitle from '@/components/atoms/labels/pageTitle'
import InputBox from '@/components/molecules/inputBox/inputBox'
import Button from '@/components/atoms/buttons/button'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { valueForSubmit, normalizeIncomingEmoji } from '@/utils/emoji'
import grid from './forms.module.scss'

const LoyaltyTierForm = ({ title, initial = {}, submitting = false, onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    name: initial.name || '',
    emoji: normalizeIncomingEmoji(initial.emoji),
    minSpending: initial.minSpending || 0,
    maxSpending: initial.maxSpending || '',
    discountPercent: initial.discountPercent || 0,
    discordRoleId: initial.discordRoleId || '',
    sortOrder: initial.sortOrder || 0,
    isActive: initial.isActive ?? true,
  })

  const lastInitialRef = useRef(JSON.stringify({
    name: initial.name,
    emoji: initial.emoji,
    minSpending: initial.minSpending,
    maxSpending: initial.maxSpending,
    discountPercent: initial.discountPercent,
    discordRoleId: initial.discordRoleId,
    sortOrder: initial.sortOrder,
    isActive: initial.isActive,
  }))

  useEffect(() => {
    const hasInitialData = initial.name || initial.minSpending

    if (!hasInitialData) return

    const currentKey = JSON.stringify({
      name: initial.name,
      emoji: initial.emoji,
      minSpending: initial.minSpending,
      maxSpending: initial.maxSpending,
      discountPercent: initial.discountPercent,
      discordRoleId: initial.discordRoleId,
      sortOrder: initial.sortOrder,
      isActive: initial.isActive,
    })

    if (currentKey !== lastInitialRef.current) {
      lastInitialRef.current = currentKey

      setForm({
        name: initial.name || '',
        emoji: normalizeIncomingEmoji(initial.emoji),
        minSpending: initial.minSpending || 0,
        maxSpending: initial.maxSpending || '',
        discountPercent: initial.discountPercent || 0,
        discordRoleId: initial.discordRoleId || '',
        sortOrder: initial.sortOrder || 0,
        isActive: initial.isActive ?? true,
      })
    }
  }, [initial.name, initial.emoji, initial.minSpending, initial.maxSpending, initial.discountPercent, initial.discordRoleId, initial.sortOrder, initial.isActive])

  const update = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const handleSubmit = () => {
    const payload = {
      ...form,
      emoji: valueForSubmit(form.emoji),
      minSpending: parseFloat(form.minSpending) || 0,
      maxSpending: form.maxSpending ? parseFloat(form.maxSpending) : null,
      discountPercent: parseFloat(form.discountPercent) || 0,
      sortOrder: parseInt(form.sortOrder) || 0,
      discordRoleId: form.discordRoleId || null,
    }
    onSubmit?.(payload)
  }

  return (
    <div className={grid.wrap}>
      {title && <PageTitle title={title} />}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <div className={grid.grid}>
          <InputBox
            label="Tier Name *"
            value={form.name}
            valueChange={(v) => update('name', v)}
            placeholder="e.g., Client, Regular, VIP"
          />
          <EmojiField
            label="Emoji"
            value={form.emoji}
            onChange={(v) => update('emoji', v)}
            placeholder="Pick an emoji"
          />

          <InputBox
            label="Min Spending ($) *"
            value={form.minSpending}
            valueChange={(v) => update('minSpending', v)}
            placeholder="0"
            type="number"
            step="0.01"
          />
          <InputBox
            label="Max Spending ($)"
            value={form.maxSpending}
            valueChange={(v) => update('maxSpending', v)}
            placeholder="Leave empty for unlimited"
            type="number"
            step="0.01"
          />

          <InputBox
            label="Discount Percent *"
            value={form.discountPercent}
            valueChange={(v) => update('discountPercent', v)}
            placeholder="0"
            type="number"
            step="0.01"
            min="0"
            max="100"
          />
          <InputBox
            label="Sort Order *"
            value={form.sortOrder}
            valueChange={(v) => update('sortOrder', v)}
            placeholder="0"
            type="number"
          />

          <div className={grid.span2}>
            <InputBox
              label="Discord Role ID (optional)"
              value={form.discordRoleId}
              valueChange={(v) => update('discordRoleId', v)}
              placeholder="Leave empty to auto-assign via setup script"
            />
          </div>

          <div className={grid.actionsRow + ' ' + grid.span2}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update('isActive', e.target.checked)}
              />
              <span>Active</span>
            </label>
            <div className={grid.actionsRight}>
              <Button type="button" onClick={onCancel} secondary>
                Cancel
              </Button>
              <Button type="submit" primary disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default LoyaltyTierForm
