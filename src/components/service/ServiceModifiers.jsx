import React, { useState, useEffect } from 'react'
import styles from './ServiceModifiers.module.scss'
import Button from '../atoms/buttons/button'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { IoAdd, IoTrash, IoPencil, IoCheckmark, IoClose, IoToggle } from 'react-icons/io5'

const ServiceModifiers = ({ serviceId }) => {
  const [modifiers, setModifiers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    modifierType: 'PERCENTAGE',
    value: '',
    displayType: 'NORMAL',
    priority: 0,
    condition: '',
    active: true
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (serviceId) {
      loadModifiers()
    }
  }, [serviceId])

  const loadModifiers = async () => {
    try {
      setLoading(true)
      const res = await adminController.getServiceModifiers(serviceId)
      if (res && res.success) {
        setModifiers(res.data || [])
      }
    } catch (error) {
      console.error('Error loading modifiers:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      modifierType: 'PERCENTAGE',
      value: '',
      displayType: 'NORMAL',
      priority: 0,
      condition: '',
      active: true
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleAdd = () => {
    resetForm()
    setShowForm(true)
  }

  const handleEdit = (modifier) => {
    setFormData({
      name: modifier.name,
      modifierType: modifier.modifierType,
      value: modifier.value,
      displayType: modifier.displayType,
      priority: modifier.priority,
      condition: modifier.condition || '',
      active: modifier.active
    })
    setEditingId(modifier.id)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      notify('Name is required')
      return
    }

    if (!formData.value || formData.value === '') {
      notify('Value is required')
      return
    }

    try {
      setSubmitting(true)
      const data = {
        name: formData.name.trim(),
        modifierType: formData.modifierType,
        value: parseFloat(formData.value),
        displayType: formData.displayType,
        priority: parseInt(formData.priority) || 0,
        condition: formData.condition.trim() || null,
        active: formData.active
      }

      let res
      if (editingId) {
        res = await adminController.updateServiceModifier(serviceId, editingId, data)
      } else {
        res = await adminController.createServiceModifier(serviceId, data)
      }

      if (res && res.success) {
        notify(editingId ? 'Modifier updated successfully' : 'Modifier created successfully', 'success')
        resetForm()
        loadModifiers()
      } else {
        notify(res?.error?.message || 'Failed to save modifier')
      }
    } catch (error) {
      notify('An error occurred')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (modifierId) => {
    if (!confirm('Are you sure you want to delete this modifier?')) {
      return
    }

    try {
      const res = await adminController.deleteServiceModifier(serviceId, modifierId)
      if (res && res.success) {
        notify('Modifier deleted successfully', 'success')
        loadModifiers()
      } else {
        notify('Failed to delete modifier')
      }
    } catch (error) {
      notify('An error occurred')
      console.error(error)
    }
  }

  const handleToggle = async (modifierId) => {
    try {
      const res = await adminController.toggleServiceModifier(serviceId, modifierId)
      if (res && res.success) {
        notify('Modifier status updated', 'success')
        loadModifiers()
      } else {
        notify('Failed to toggle modifier')
      }
    } catch (error) {
      notify('An error occurred')
      console.error(error)
    }
  }

  const getDisplayTypeIcon = (type) => {
    switch (type) {
      case 'UPCHARGE': return '🔺'
      case 'NOTE': return '📝'
      case 'WARNING': return '⚠️'
      default: return '⚙️'
    }
  }

  const getDisplayTypeColor = (type) => {
    switch (type) {
      case 'UPCHARGE': return '#ef4444'
      case 'NOTE': return '# 22c55e'
      case 'WARNING': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading modifiers...</div>
  }

  return (
    <div className={styles.serviceModifiers}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h2>Service Modifiers</h2>
            <p className={styles.subtitle}>
              Modifiers that apply to <strong>ALL pricing methods</strong> in this service
            </p>
          </div>
          {!showForm && (
            <Button onClick={handleAdd} primary>
              <IoAdd /> Add Modifier
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <h4>{editingId ? 'Edit Modifier' : 'New Modifier'}</h4>

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Iron Account, Hardcore, Rush Service"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Type *</label>
              <select
                value={formData.modifierType}
                onChange={(e) => setFormData({ ...formData, modifierType: e.target.value })}
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount ($)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Value *</label>
              <input
                type="number"
                step="0.01"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                placeholder={formData.modifierType === 'PERCENTAGE' ? '10 (for +10%)' : '5 (for +$5)'}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Display Type *</label>
              <select
                value={formData.displayType}
                onChange={(e) => setFormData({ ...formData, displayType: e.target.value })}
              >
                <option value="NORMAL">Normal</option>
                <option value="UPCHARGE">Upcharge (Red)</option>
                <option value="DISCOUNT">Discount (Green)</option>
                <option value="NOTE">Note (Green)</option>
                <option value="WARNING">Warning (Yellow)</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Priority</label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                placeholder="0 (lower = applied first)"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Condition (JSON, optional)</label>
              <textarea
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder='{"type": "price_range", "min": 100, "max": 500}'
                rows={2}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="button" style="secondary" onClick={resetForm} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" primary disabled={submitting}>
              {submitting ? 'Saving...' : (editingId ? 'Update Modifier' : 'Create Modifier')}
            </Button>
          </div>
        </form>
      )}

      <div className={styles.modifiersList}>
        {modifiers.length === 0 ? (
          <div className={styles.empty}>
            <p>No modifiers yet. Add one to get started!</p>
            <p className={styles.hint}>Modifiers apply to ALL pricing methods in this service.</p>
          </div>
        ) : (
          modifiers.map((modifier) => (
            <div
              key={modifier.id}
              className={`${styles.modifierCard} ${!modifier.active ? styles.inactive : ''}`}
            >
              <div className={styles.modifierIcon}>
                {getDisplayTypeIcon(modifier.displayType)}
              </div>
              <div className={styles.modifierContent}>
                <h4>
                  {modifier.name}
                  {!modifier.active && <span className={styles.inactiveBadge}>Inactive</span>}
                </h4>
                <div className={styles.modifierMeta}>
                  <span className={styles.value}>
                    {modifier.value > 0 ? '+' : ''}{modifier.value}
                    {modifier.modifierType === 'PERCENTAGE' ? '%' : ' USD'}
                  </span>
                  <span className={styles.type}>{modifier.modifierType}</span>
                  <span
                    className={styles.displayType}
                    style={{ backgroundColor: getDisplayTypeColor(modifier.displayType) }}
                  >
                    {modifier.displayType}
                  </span>
                  <span className={styles.priority}>Priority: {modifier.priority}</span>
                </div>
                {modifier.condition && (
                  <div className={styles.condition}>
                    <small>Condition: {modifier.condition}</small>
                  </div>
                )}
              </div>
              <div className={styles.modifierActions}>
                <button
                  onClick={() => handleToggle(modifier.id)}
                  className={styles.toggleBtn}
                  title={modifier.active ? 'Deactivate' : 'Activate'}
                >
                  <IoToggle />
                </button>
                <button
                  onClick={() => handleEdit(modifier)}
                  className={styles.editBtn}
                  title="Edit"
                >
                  <IoPencil />
                </button>
                <button
                  onClick={() => handleDelete(modifier.id)}
                  className={styles.deleteBtn}
                  title="Delete"
                >
                  <IoTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ServiceModifiers
