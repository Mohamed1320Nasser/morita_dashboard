import React, { useEffect, useState, useRef } from 'react'
import PageTitle from '@/components/atoms/labels/pageTitle'
import InputBox from '@/components/molecules/inputBox/inputBox'
import Button from '@/components/atoms/buttons/button'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { valueForSubmit, normalizeIncomingEmoji } from '@/utils/emoji'
// Categories are provided by parent page to avoid duplicate fetching
import grid from './forms.module.scss'

const ServiceForm = ({ title, initial = {}, submitting = false, onCancel, onSubmit, categories: catsProp = [] }) => {
  const [cats, setCats] = useState(catsProp)
  const [form, setForm] = useState({
    name: initial.name || '',
    slug: initial.slug || '',
    emoji: normalizeIncomingEmoji(initial.emoji),
    description: initial.description || '',
    displayOrder: initial.displayOrder || 0,
    active: initial.active ?? true,
    categoryId: initial.categoryId ? String(initial.categoryId) : ''
  })
  const lastInitialRef = useRef(JSON.stringify({
    name: initial.name,
    slug: initial.slug,
    emoji: initial.emoji,
    description: initial.description,
    displayOrder: initial.displayOrder,
    active: initial.active,
    categoryId: initial.categoryId
  }))

  useEffect(() => {
    // Only update if catsProp is actually different
    const newCats = Array.isArray(catsProp) ? catsProp : []
    setCats(prevCats => {
      if (newCats.length !== prevCats.length || JSON.stringify(newCats.map(c => c.id)) !== JSON.stringify(prevCats.map(c => c.id))) {
        return newCats
      }
      return prevCats
    })
  }, [catsProp])

  // Sync when initial prop changes (edit mode) - only when values actually change
  // Skip sync if initial is empty (create mode)
  useEffect(() => {
    // Check if we're in edit mode (has meaningful data) vs create mode (empty object)
    const hasInitialData = initial.name || initial.slug || initial.categoryId
    
    if (!hasInitialData) {
      // Create mode - don't sync
      return
    }
    
    const currentKey = JSON.stringify({
      name: initial.name,
      slug: initial.slug,
      emoji: initial.emoji,
      description: initial.description,
      displayOrder: initial.displayOrder,
      active: initial.active,
      categoryId: initial.categoryId
    })
    
    // Only sync if the initial data actually changed
    if (currentKey !== lastInitialRef.current) {
      lastInitialRef.current = currentKey
      
      setForm({
        name: initial.name || '',
        slug: initial.slug || '',
        emoji: normalizeIncomingEmoji(initial.emoji),
        description: initial.description || '',
        displayOrder: initial.displayOrder || 0,
        active: initial.active ?? true,
        categoryId: initial.categoryId ? String(initial.categoryId) : ''
      })
    }
  }, [initial.name, initial.slug, initial.emoji, initial.description, initial.displayOrder, initial.active, initial.categoryId])

  const update = (k, v) => {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      // Auto-generate slug from name (only if not in edit mode with existing slug)
      if (k === 'name' && (!initial.slug || !prev.slug)) {
        const slug = String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        next.slug = slug
      }
      return next
    })
  }

  const handleSubmit = () => {
    const payload = {
      ...form,
      emoji: valueForSubmit(form.emoji),
    }
    onSubmit?.(payload)
  }

  return (
    <div className={grid.wrap}>
      {title && <PageTitle title={title} />}
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
        <div className={grid.grid}>
          {/* Row 1 */}
          <InputBox label="Name *" value={form.name} valueChange={(v) => update('name', v)} placeholder="Service name" />
          <EmojiField label="Emoji" value={form.emoji} onChange={(v) => update('emoji', v)} placeholder="Pick an emoji" />

          {/* Row 2 */}
          <InputBox label="Slug *" value={form.slug} valueChange={(v) => update('slug', v)} placeholder="service-slug" />
          <InputBox label="Display Order" value={form.displayOrder} valueChange={(v) => update('displayOrder', parseInt(v) || 0)} placeholder="0" />

          {/* Row 3: Category spans 2 */}
          <div className={grid.span2}>
            <label style={{ display: 'block', marginBottom: 6 }}>Category *</label>
            <select value={String(form.categoryId)} onChange={(e) => update('categoryId', String(e.target.value))} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #f6f6f6', width: '100%', maxWidth: 420 }}>
              <option value="">Select category</option>
              {cats.map(c => <option key={c.id} value={String(c.id)}>{c.emoji} {c.name}</option>)}
            </select>
          </div>

          {/* Row 4: Description spans 2 */}
          <div className={grid.span2}>
            <label style={{ display: 'block', marginBottom: 6 }}>Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #f6f6f6' }} placeholder="Enter description" />
          </div>

          {/* Row 5: actions */}
          <div className={grid.actionsRow + ' ' + grid.span2}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={form.active} onChange={(e) => update('active', e.target.checked)} />
              <span>Active</span>
            </label>
            <div className={grid.actionsRight}>
              <Button type="button" onClick={onCancel} secondary>Cancel</Button>
              <Button type="submit" primary disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ServiceForm


