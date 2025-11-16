import React, { useState } from 'react'
import { Table, Form } from 'react-bootstrap'
import Button from '@/components/atoms/buttons/button'
import EmojiField from '@/components/atoms/inputs/emoji/EmojiField'
import { notify } from '@/config/error'
import { valueForSubmit } from '@/utils/emoji'
import styles from './BatchServiceTable.module.scss'

const BatchServiceTable = ({ categoryId, categoryName, onSubmit, onCancel }) => {
  const [services, setServices] = useState([
    { id: 1, name: '', emoji: '', description: '', displayOrder: 0, active: true }
  ])
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const addRow = () => {
    const newId = Math.max(...services.map(s => s.id)) + 1
    setServices([
      ...services,
      {
        id: newId,
        name: '',
        emoji: '',
        description: '',
        displayOrder: services.length,
        active: true
      }
    ])
  }

  const removeRow = (id) => {
    if (services.length === 1) {
      notify('At least one service is required', 'warning')
      return
    }
    setServices(services.filter(s => s.id !== id))
  }

  const updateRow = (id, field, value) => {
    setServices(services.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ))
    // Clear validation error for this field
    setValidationErrors(prev => {
      const updated = { ...prev }
      delete updated[`${id}-${field}`]
      return updated
    })
  }

  const validateServices = () => {
    const errors = {}
    let hasErrors = false

    services.forEach((service) => {
      if (!service.name.trim()) {
        errors[`${service.id}-name`] = 'Required'
        hasErrors = true
      }

      // Check for duplicate names in the batch
      const duplicates = services.filter(s =>
        s.id !== service.id &&
        s.name.trim().toLowerCase() === service.name.trim().toLowerCase()
      )
      if (duplicates.length > 0) {
        errors[`${service.id}-name`] = 'Duplicate name'
        hasErrors = true
      }
    })

    setValidationErrors(errors)
    return !hasErrors
  }

  const handleSubmit = async () => {
    if (!validateServices()) {
      notify('Please fix validation errors', 'error')
      return
    }

    setSubmitting(true)

    const payload = {
      categoryId,
      services: services.map(s => ({
        name: s.name.trim(),
        emoji: valueForSubmit(s.emoji),
        description: s.description.trim(),
        displayOrder: s.displayOrder,
        active: s.active
      }))
    }

    const result = await onSubmit(payload)

    // Only reset submitting if submission failed
    if (!result || !result.success) {
      setSubmitting(false)
    }
  }

  const handleKeyDown = (e, rowId, field) => {
    // Tab on last field of last row = add new row
    if (e.key === 'Tab' && !e.shiftKey && field === 'active') {
      const isLastRow = services[services.length - 1].id === rowId
      if (isLastRow) {
        e.preventDefault()
        addRow()
        // Focus on first field of new row after short delay
        setTimeout(() => {
          const newRowInput = document.querySelector(`input[data-row-id="${rowId + 1}"]`)
          if (newRowInput) newRowInput.focus()
        }, 50)
      }
    }
  }

  return (
    <div className={styles.batchTable}>
      <div className={styles.header}>
        <h4>Add Multiple Services to: <strong>{categoryName}</strong></h4>
        <p className={styles.hint}>
          💡 <strong>Tip:</strong> Use Tab key to navigate between fields. Press Tab on the last field to add a new row automatically.
        </p>
      </div>

      <div className={styles.tableWrapper}>
        <Table bordered hover responsive className={styles.serviceTable}>
          <thead>
            <tr>
              <th style={{ width: '5%' }}>#</th>
              <th style={{ width: '25%' }}>Service Name *</th>
              <th style={{ width: '10%' }}>Emoji</th>
              <th style={{ width: '35%' }}>Description</th>
              <th style={{ width: '10%' }}>Priority</th>
              <th style={{ width: '10%' }}>Active</th>
              <th style={{ width: '5%' }}></th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={service.id} className={validationErrors[`${service.id}-name`] ? styles.errorRow : ''}>
                <td className={styles.rowNumber}>{index + 1}</td>

                <td>
                  <Form.Control
                    type="text"
                    value={service.name}
                    onChange={(e) => updateRow(service.id, 'name', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, service.id, 'name')}
                    isInvalid={!!validationErrors[`${service.id}-name`]}
                    placeholder="e.g., Fortnite Boosting"
                    data-row-id={service.id}
                    disabled={submitting}
                  />
                  {validationErrors[`${service.id}-name`] && (
                    <div className={styles.errorText}>
                      {validationErrors[`${service.id}-name`]}
                    </div>
                  )}
                </td>

                <td>
                  <EmojiField
                    label=""
                    value={service.emoji}
                    onChange={(emoji) => updateRow(service.id, 'emoji', emoji.unicode || emoji)}
                    disabled={submitting}
                    placeholder="🙂"
                  />
                </td>

                <td>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={service.description}
                    onChange={(e) => updateRow(service.id, 'description', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, service.id, 'description')}
                    placeholder="Optional description"
                    disabled={submitting}
                  />
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={service.displayOrder}
                    onChange={(e) => updateRow(service.id, 'displayOrder', parseInt(e.target.value) || 0)}
                    onKeyDown={(e) => handleKeyDown(e, service.id, 'displayOrder')}
                    disabled={submitting}
                  />
                </td>

                <td className={styles.checkboxCell}>
                  <Form.Check
                    type="checkbox"
                    checked={service.active}
                    onChange={(e) => updateRow(service.id, 'active', e.target.checked)}
                    onKeyDown={(e) => handleKeyDown(e, service.id, 'active')}
                    disabled={submitting}
                  />
                </td>

                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => removeRow(service.id)}
                    disabled={services.length === 1 || submitting}
                    className={styles.removeBtn}
                    title="Remove row"
                  >
                    ×
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <div className={styles.actions}>
        <Button secondary onClick={addRow} disabled={submitting}>
          + Add Row
        </Button>

        <div className={styles.summary}>
          {services.length} service{services.length !== 1 ? 's' : ''} ready to create
        </div>

        <div className={styles.buttons}>
          <Button cancel onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            primary
            onClick={handleSubmit}
            disabled={submitting || services.length === 0}
          >
            {submitting ? 'Creating...' : `Create All (${services.length})`}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BatchServiceTable
