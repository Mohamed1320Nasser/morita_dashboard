import React, { useEffect, useRef, useState } from 'react'
import styles from './Branding.module.scss'
import { notify } from '@/config/error'
import brandingController from '@/controllers/branding'

const SLOTS = [
  {
    key: 'brand.banner',
    label: 'Banner',
    hint: 'Wide image shown at the bottom of bot embeds. Recommended 600×160 or wider.',
    preview: 'wide',
  },
  {
    key: 'brand.thumbnail',
    label: 'Thumbnail',
    hint: 'Square logo shown in the top-right corner of bot embeds. Recommended 256×256.',
    preview: 'square',
  },
]

const MAX_SIZE = 8 * 1024 * 1024

const BrandingSlot = ({ slot, url, onUpload, onRemove, busy }) => {
  const inputRef = useRef(null)

  const handleSelect = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (file.size > MAX_SIZE) {
      notify({ message: 'Image must be 8MB or smaller', type: 'error' })
      return
    }

    onUpload(slot.key, file)
  }

  return (
    <div className={styles.slot}>
      <div className={styles.slotHeader}>
        <span className={styles.slotLabel}>{slot.label}</span>
        {url && (
          <button
            type="button"
            className={styles.removeBtn}
            onClick={() => onRemove(slot.key)}
            disabled={busy}
          >
            Remove
          </button>
        )}
      </div>

      <div
        className={`${styles.dropArea} ${styles[slot.preview]} ${busy ? styles.busy : ''}`}
        onClick={() => !busy && inputRef.current?.click()}
      >
        {url ? (
          <img src={url} alt={slot.label} className={styles.previewImg} />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.plus}>+</div>
            <div className={styles.placeholderText}>
              {busy ? 'Uploading…' : 'Click to upload'}
            </div>
          </div>
        )}

        {url && !busy && <div className={styles.overlay}>Click to replace</div>}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
          onChange={handleSelect}
          className={styles.hiddenInput}
        />
      </div>

      <p className={styles.hint}>{slot.hint}</p>
    </div>
  )
}

const BrandingCard = () => {
  const [urls, setUrls] = useState({})
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)

  const load = async () => {
    try {
      const result = await brandingController.getBranding()
      if (result.success) {
        setUrls(result.data || {})
      }
    } catch (e) {
      console.log('Error loading branding', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleUpload = async (key, file) => {
    setBusyKey(key)
    try {
      const result = await brandingController.uploadBranding(key, file)
      if (result.success) {
        setUrls((prev) => ({ ...prev, [key]: result.data.url }))
        notify({ message: 'Image uploaded. Bot messages update within 5 minutes.', type: 'success' })
      } else {
        notify({ message: result.error?.message || 'Failed to upload image', type: 'error' })
      }
    } catch (e) {
      notify({ message: 'Failed to upload image', type: 'error' })
    } finally {
      setBusyKey(null)
    }
  }

  const handleRemove = async (key) => {
    setBusyKey(key)
    try {
      const result = await brandingController.removeBranding(key)
      if (result.success) {
        setUrls((prev) => ({ ...prev, [key]: null }))
        notify({ message: 'Image removed', type: 'success' })
      } else {
        notify({ message: result.error?.message || 'Failed to remove image', type: 'error' })
      }
    } catch (e) {
      notify({ message: 'Failed to remove image', type: 'error' })
    } finally {
      setBusyKey(null)
    }
  }

  if (loading) {
    return <div className={styles.loadingState}>Loading branding…</div>
  }

  return (
    <div className={styles.branding}>
      <div className={styles.slots}>
        {SLOTS.map((slot) => (
          <BrandingSlot
            key={slot.key}
            slot={slot}
            url={urls[slot.key]}
            onUpload={handleUpload}
            onRemove={handleRemove}
            busy={busyKey === slot.key}
          />
        ))}
      </div>

      <p className={styles.note}>
        These images are used across Discord bot messages. Changes appear in the bot within 5 minutes.
      </p>
    </div>
  )
}

export default BrandingCard
