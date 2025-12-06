import React, { useState, useEffect, useRef } from 'react'
import PageTitle from '@/components/atoms/labels/pageTitle'
import InputBox from '@/components/molecules/inputBox/inputBox'
import Button from '@/components/atoms/buttons/button'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { valueForSubmit, normalizeIncomingEmoji } from '@/utils/emoji'
import grid from './forms.module.scss'

// Default welcome message template
const DEFAULT_WELCOME_MESSAGE = `Hello {customer}!

Thank you for opening a ticket. Our support team ({support}) will assist you shortly.

**Service:** {service}
**Estimated Price:** {price} {currency}
**Ticket ID:** #{ticket_id}

Please provide any additional details about your request.`

// Available template variables
const TEMPLATE_VARIABLES = [
  { name: '{customer}', description: 'Customer mention (@username)' },
  { name: '{support}', description: 'Support role mention' },
  { name: '{service}', description: 'Selected service name' },
  { name: '{price}', description: 'Calculated price' },
  { name: '{currency}', description: 'Currency code (USD)' },
  { name: '{ticket_id}', description: 'Ticket number' },
]

const CategoryForm = ({ title, initial = {}, submitting = false, onCancel, onSubmit }) => {
  const [name, setName] = useState(initial.name || '')
  const [description, setDescription] = useState(initial.description || '')
  const [emoji, setEmoji] = useState(normalizeIncomingEmoji(initial.emoji))
  const [active, setActive] = useState(initial.active ?? true)

  // Ticket Settings
  const [welcomeTitle, setWelcomeTitle] = useState(initial.ticketSettings?.welcomeTitle || 'Welcome to Your Ticket!')
  const [welcomeMessage, setWelcomeMessage] = useState(initial.ticketSettings?.welcomeMessage || DEFAULT_WELCOME_MESSAGE)
  const [embedColor, setEmbedColor] = useState(initial.ticketSettings?.embedColor || '5865F2')
  const [bannerUrl, setBannerUrl] = useState(initial.ticketSettings?.bannerUrl || '')
  const [footerText, setFooterText] = useState(initial.ticketSettings?.footerText || '')

  const welcomeMessageRef = useRef(null)
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

    // Sync ticket settings
    if (initial.ticketSettings) {
      setWelcomeTitle(initial.ticketSettings.welcomeTitle || 'Welcome to Your Ticket!')
      setWelcomeMessage(initial.ticketSettings.welcomeMessage || DEFAULT_WELCOME_MESSAGE)
      setEmbedColor(initial.ticketSettings.embedColor || '5865F2')
      setBannerUrl(initial.ticketSettings.bannerUrl || '')
      setFooterText(initial.ticketSettings.footerText || '')
    }
  }, [initial.name, initial.description, initial.emoji, initial.active, initial.ticketSettings])

  const handleSubmit = () => {
    const payload = {
      name,
      description,
      emoji: valueForSubmit(emoji),
      active,
      // Include ticket settings
      ticketSettings: {
        welcomeTitle,
        welcomeMessage,
        embedColor,
        bannerUrl: bannerUrl || null,
        footerText: footerText || null,
      },
    }
    onSubmit?.(payload)
  }

  // Insert variable at cursor position in welcome message
  const insertVariable = (variable) => {
    if (welcomeMessageRef.current) {
      const textarea = welcomeMessageRef.current
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = welcomeMessage
      const newText = text.substring(0, start) + variable + text.substring(end)
      setWelcomeMessage(newText)
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    } else {
      setWelcomeMessage(prev => prev + variable)
    }
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
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd' }} placeholder="Enter category description" />
        </div>

        {/* Ticket Settings Section */}
        <div className={grid.span2} style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #eee' }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: '#333' }}>
            🎫 Ticket Welcome Message Settings
          </h3>
          <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
            Configure the welcome message shown when a ticket is created for this category.
          </p>
        </div>

        {/* Welcome Title */}
        <div className={grid.span2}>
          <InputBox
            label="Welcome Title"
            placeholder="e.g., Welcome to Your Ticket!"
            value={welcomeTitle}
            valueChange={setWelcomeTitle}
          />
        </div>

        {/* Template Variables */}
        <div className={grid.span2}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Available Variables (click to insert)
          </label>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            padding: 12,
            background: '#f8f9fa',
            borderRadius: 8,
            marginBottom: 8
          }}>
            {TEMPLATE_VARIABLES.map((v) => (
              <button
                key={v.name}
                type="button"
                onClick={() => insertVariable(v.name)}
                style={{
                  padding: '6px 12px',
                  background: '#e9ecef',
                  border: '1px solid #dee2e6',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontFamily: 'monospace',
                  transition: 'all 0.2s',
                }}
                title={v.description}
                onMouseOver={(e) => e.target.style.background = '#dee2e6'}
                onMouseOut={(e) => e.target.style.background = '#e9ecef'}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Welcome Message */}
        <div className={grid.span2}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            Welcome Message (supports Markdown)
          </label>
          <textarea
            ref={welcomeMessageRef}
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              padding: 12,
              border: '1px solid #ddd',
              borderRadius: 8,
              fontFamily: 'monospace',
              fontSize: 14,
              resize: 'vertical',
              lineHeight: 1.5,
            }}
            placeholder="Enter the welcome message for this category's tickets..."
          />
          <small style={{ color: '#666', marginTop: 4, display: 'block' }}>
            Use Markdown for formatting: **bold**, *italic*, `code`
          </small>
        </div>

        {/* Embed Color & Banner */}
        <InputBox
          label="Embed Color (Hex)"
          placeholder="5865F2"
          value={embedColor}
          valueChange={setEmbedColor}
        />
        <InputBox
          label="Banner Image URL (optional)"
          placeholder="https://example.com/banner.png"
          value={bannerUrl}
          valueChange={setBannerUrl}
        />

        {/* Footer Text */}
        <div className={grid.span2}>
          <InputBox
            label="Footer Text (optional)"
            placeholder="Additional information shown at the bottom of the welcome message"
            value={footerText}
            valueChange={setFooterText}
          />
        </div>

        {/* Active checkbox */}
        <div className={grid.span2} style={{ marginTop: 16 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={active} onChange={() => setActive(!active)} />
            <span>Category Active</span>
          </label>
        </div>

        {/* Actions */}
        <div className={grid.actionsRow + ' ' + grid.span2} style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee' }}>
          <div></div>
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


