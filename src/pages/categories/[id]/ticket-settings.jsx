import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import Button from '@/components/atoms/buttons/button'
import InputBox from '@/components/molecules/inputBox/inputBox'
import categories from '@/controllers/categories'
import categoryTicketSettings from '@/controllers/categoryTicketSettings'
import { notify } from '@/config/error'
import styles from '../categoryForm.module.scss'

// Dynamic import for Quill editor (no SSR)
const QuillEditor = dynamic(
  () => import('@/components/atoms/editor'),
  { ssr: false, loading: () => <p>Loading editor...</p> }
)

// Available template variables
const TEMPLATE_VARIABLES = [
  { name: '{customer}', description: 'Customer mention (@username)' },
  { name: '{support}', description: 'Support role mention' },
  { name: '{service}', description: 'Selected service name' },
  { name: '{price}', description: 'Calculated price' },
  { name: '{currency}', description: 'Currency code (USD)' },
  { name: '{ticket_id}', description: 'Ticket number' },
  { name: '{category}', description: 'Category name' },
]

const CategoryTicketSettings = () => {
  const router = useRouter()
  const { id: categoryId } = router.query

  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [welcomeTitle, setWelcomeTitle] = useState('Welcome to Your Ticket')
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [autoAssign, setAutoAssign] = useState(false)
  const [notifyOnCreate, setNotifyOnCreate] = useState(true)
  const [notifyOnClose, setNotifyOnClose] = useState(true)
  const [mentionSupport, setMentionSupport] = useState(true)
  const [mentionCustomer, setMentionCustomer] = useState(true)

  // Preview state
  const [showPreview, setShowPreview] = useState(false)
  const [previewMessage, setPreviewMessage] = useState('')

  useEffect(() => {
    if (categoryId) {
      fetchData()
    }
  }, [categoryId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch category info
      const catRes = await categories.getCategoryById(categoryId)
      if (catRes && catRes.success) {
        const cat = catRes?.data?.category?.data ?? catRes?.data?.category ?? catRes?.data ?? {}
        setCategory(cat)
      } else {
        notify('Category not found', 'error')
        router.push('/categories')
        return
      }

      // Fetch ticket settings
      const settingsRes = await categoryTicketSettings.getSettings(categoryId)
      if (settingsRes && settingsRes.success && settingsRes.data) {
        const s = settingsRes.data
        setWelcomeTitle(s.welcomeTitle || 'Welcome to Your Ticket')
        setWelcomeMessage(s.welcomeMessage || getDefaultWelcomeMessage())
        setAutoAssign(Boolean(s.autoAssign))
        setNotifyOnCreate(s.notifyOnCreate !== false)
        setNotifyOnClose(s.notifyOnClose !== false)
        setMentionSupport(s.mentionSupport !== false)
        setMentionCustomer(s.mentionCustomer !== false)
      } else {
        // Use defaults
        setWelcomeMessage(getDefaultWelcomeMessage())
      }
    } catch (error) {
      console.error('[TicketSettings] fetchData error:', error)
      notify('Error loading settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getDefaultWelcomeMessage = () => {
    return `Hello {customer}!

Thank you for opening a ticket. Our support team ({support}) will assist you shortly.

**Service:** {service}
**Price:** ${'{price}'} {currency}
**Ticket ID:** #{'{ticket_id}'}

Please provide any additional details about your request.`
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const payload = {
        welcomeTitle,
        welcomeMessage,
        autoAssign,
        notifyOnCreate,
        notifyOnClose,
        mentionSupport,
        mentionCustomer,
      }

      const res = await categoryTicketSettings.upsertSettings(categoryId, payload)

      if (res && res.success) {
        notify('Ticket settings saved successfully!', 'success')
      } else {
        notify(res?.error?.message || 'Failed to save settings', 'error')
      }
    } catch (error) {
      console.error('[TicketSettings] handleSave error:', error)
      notify('Error saving settings', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    // Render preview with sample variables
    let preview = welcomeMessage
    preview = preview.replace(/\{customer\}/g, '@JohnDoe')
    preview = preview.replace(/\{support\}/g, '@Support Team')
    preview = preview.replace(/\{service\}/g, category?.name || 'Example Service')
    preview = preview.replace(/\{price\}/g, '25.00')
    preview = preview.replace(/\{currency\}/g, 'USD')
    preview = preview.replace(/\{ticket_id\}/g, '12345')
    preview = preview.replace(/\{category\}/g, category?.name || 'Category')

    setPreviewMessage(preview)
    setShowPreview(true)
  }

  const insertVariable = (variable) => {
    // For plain text area, we append at the end
    setWelcomeMessage(prev => prev + variable)
  }

  if (loading) return <Loading />
  if (!category) return null

  return (
    <div className={styles.categoryForm}>
      <PageHead current="Categories">
        <Head
          title={`Ticket Settings - ${category.name}`}
          back={`/categories/${categoryId}`}
        />
      </PageHead>

      <Container>
        <Card style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 600 }}>
            Discord Ticket Channel Settings
          </h3>
          <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
            Configure how tickets are created for this category in Discord.
          </p>

          {/* Welcome Title */}
          <div style={{ marginBottom: '20px' }}>
            <InputBox
              label="Welcome Message Title"
              placeholder="e.g., Welcome to Your Ticket"
              value={welcomeTitle}
              valueChange={setWelcomeTitle}
            />
          </div>

          {/* Template Variables Helper */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Available Variables
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
              marginBottom: '8px'
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
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                  }}
                  title={v.description}
                >
                  {v.name}
                </button>
              ))}
            </div>
            <small style={{ color: '#666' }}>
              Click a variable to insert it into the welcome message
            </small>
          </div>

          {/* Welcome Message - Using textarea for plain text since Discord doesn't support HTML */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
              Welcome Message (supports Markdown)
            </label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={10}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '14px',
                resize: 'vertical',
              }}
              placeholder="Enter the welcome message for this category's tickets..."
            />
            <small style={{ color: '#666' }}>
              This message will be sent when a ticket is created. Use Markdown for formatting.
            </small>
          </div>

          {/* Options */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: 500 }}>
              Notification Options
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={mentionCustomer}
                  onChange={(e) => setMentionCustomer(e.target.checked)}
                />
                <span>Mention customer when ticket is created</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={mentionSupport}
                  onChange={(e) => setMentionSupport(e.target.checked)}
                />
                <span>Mention support role when ticket is created</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyOnCreate}
                  onChange={(e) => setNotifyOnCreate(e.target.checked)}
                />
                <span>Send notification when ticket is created</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={notifyOnClose}
                  onChange={(e) => setNotifyOnClose(e.target.checked)}
                />
                <span>Send notification when ticket is closed</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoAssign}
                  onChange={(e) => setAutoAssign(e.target.checked)}
                />
                <span>Auto-assign tickets to available support (if any)</span>
              </label>
            </div>
          </div>

          {/* Preview Button */}
          <div style={{ marginBottom: '24px' }}>
            <Button onClick={handlePreview} secondary>
              Preview Welcome Message
            </Button>
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}>
              <div style={{
                background: '#36393f', // Discord dark theme
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}>
                <h4 style={{ color: '#fff', marginBottom: '16px' }}>
                  {welcomeTitle}
                </h4>
                <div style={{
                  background: '#2f3136',
                  padding: '16px',
                  borderRadius: '4px',
                  borderLeft: '4px solid #5865f2',
                }}>
                  <pre style={{
                    color: '#dcddde',
                    fontFamily: 'inherit',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}>
                    {previewMessage}
                  </pre>
                </div>
                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                  <Button onClick={() => setShowPreview(false)} secondary>
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}>
            <Button onClick={() => router.push(`/categories/${categoryId}`)} secondary>
              Cancel
            </Button>
            <Button onClick={handleSave} primary disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default CategoryTicketSettings
