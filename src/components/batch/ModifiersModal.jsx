import React, { useState, useEffect } from 'react'
import { Modal, Table, Form } from 'react-bootstrap'
import Button from '@/components/atoms/buttons/button'
import { notify } from '@/config/error'
import styles from './ModifiersModal.module.scss'

const MODIFIER_TYPES = [
  { value: 'PERCENTAGE', label: '%' },
  { value: 'FIXED', label: 'Fixed' },
]

const DISPLAY_TYPES = [
  { value: 'NORMAL', label: 'Normal', color: '#6c757d' },
  { value: 'UPCHARGE', label: 'Upcharge', color: '#dc3545' },
  { value: 'NOTE', label: 'Note', color: '#28a745' },
  { value: 'WARNING', label: 'Warning', color: '#ffc107' },
]

const ModifiersModal = ({ show, onHide, methodName, initialModifiers = [], onSave }) => {
  const [modifiers, setModifiers] = useState([])
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    if (show) {
      // Initialize with existing modifiers or one empty row
      if (initialModifiers.length > 0) {
        setModifiers(
          initialModifiers.map((m, index) => ({
            id: m.id || index + 1,
            name: m.name || '',
            modifierType: m.modifierType || 'PERCENTAGE',
            value: m.value !== undefined ? m.value : '',
            condition: m.condition || '',
            displayType: m.displayType || 'NORMAL',
            priority: m.priority !== undefined ? m.priority : index,
            active: m.active !== undefined ? m.active : true,
          }))
        )
      } else {
        setModifiers([
          {
            id: 1,
            name: '',
            modifierType: 'PERCENTAGE',
            value: '',
            condition: '',
            displayType: 'NORMAL',
            priority: 0,
            active: true,
          },
        ])
      }
      setValidationErrors({})
    }
  }, [show, initialModifiers])

  const addRow = () => {
    const newId = Math.max(...modifiers.map((m) => m.id)) + 1
    setModifiers([
      ...modifiers,
      {
        id: newId,
        name: '',
        modifierType: 'PERCENTAGE',
        value: '',
        condition: '',
        displayType: 'NORMAL',
        priority: modifiers.length,
        active: true,
      },
    ])
  }

  const removeRow = (id) => {
    if (modifiers.length === 1) {
      notify('At least one modifier is required. To remove all, click Cancel.', 'warning')
      return
    }
    setModifiers(modifiers.filter((m) => m.id !== id))
  }

  const updateRow = (id, field, value) => {
    setModifiers(
      modifiers.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    )
    // Clear validation error for this field
    setValidationErrors((prev) => {
      const updated = { ...prev }
      delete updated[`${id}-${field}`]
      return updated
    })
  }

  const validateModifiers = () => {
    const errors = {}
    let hasErrors = false

    modifiers.forEach((modifier) => {
      // Name is required
      if (!modifier.name.trim()) {
        errors[`${modifier.id}-name`] = 'Required'
        hasErrors = true
      }

      // Value is required and must be a number
      if (modifier.value === '' || isNaN(parseFloat(modifier.value))) {
        errors[`${modifier.id}-value`] = 'Valid number required'
        hasErrors = true
      }

      // Check for duplicate names
      const duplicates = modifiers.filter(
        (m) =>
          m.id !== modifier.id &&
          m.name.trim().toLowerCase() === modifier.name.trim().toLowerCase()
      )
      if (duplicates.length > 0) {
        errors[`${modifier.id}-name`] = 'Duplicate name'
        hasErrors = true
      }
    })

    setValidationErrors(errors)
    return !hasErrors
  }

  const handleSave = () => {
    if (!validateModifiers()) {
      notify('Please fix validation errors', 'error')
      return
    }

    const cleanedModifiers = modifiers.map((m) => ({
      name: m.name.trim(),
      modifierType: m.modifierType,
      value: parseFloat(m.value),
      condition: m.condition.trim() || undefined,
      displayType: m.displayType,
      priority: m.priority,
      active: m.active,
    }))

    onSave(cleanedModifiers)
  }

  const handleCancel = () => {
    onHide()
  }

  return (
    <Modal show={show} onHide={handleCancel} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Modifiers for: <strong>{methodName}</strong>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className={styles.hint}>
          💡 <strong>Tip:</strong> Modifiers adjust the base price. Use percentage (e.g., +10, -5) or fixed amounts.
        </p>

        <div className={styles.tableWrapper}>
          <Table bordered hover responsive className={styles.modifiersTable}>
            <thead>
              <tr>
                <th style={{ width: '4%' }}>#</th>
                <th style={{ width: '22%' }}>Modifier Name *</th>
                <th style={{ width: '10%' }}>Type *</th>
                <th style={{ width: '10%' }}>Value *</th>
                <th style={{ width: '12%' }}>Display Type</th>
                <th style={{ width: '20%' }}>Condition</th>
                <th style={{ width: '8%' }}>Priority</th>
                <th style={{ width: '8%' }}>Active</th>
                <th style={{ width: '4%' }}></th>
              </tr>
            </thead>
            <tbody>
              {modifiers.map((modifier, index) => {
                const displayTypeObj = DISPLAY_TYPES.find(
                  (dt) => dt.value === modifier.displayType
                )

                return (
                  <tr
                    key={modifier.id}
                    className={
                      validationErrors[`${modifier.id}-name`] ? styles.errorRow : ''
                    }
                  >
                    <td className={styles.rowNumber}>{index + 1}</td>

                    <td>
                      <Form.Control
                        type="text"
                        value={modifier.name}
                        onChange={(e) => updateRow(modifier.id, 'name', e.target.value)}
                        isInvalid={!!validationErrors[`${modifier.id}-name`]}
                        placeholder="e.g., VIP Discount"
                        size="sm"
                      />
                      {validationErrors[`${modifier.id}-name`] && (
                        <div className={styles.errorText}>
                          {validationErrors[`${modifier.id}-name`]}
                        </div>
                      )}
                    </td>

                    <td>
                      <Form.Select
                        value={modifier.modifierType}
                        onChange={(e) =>
                          updateRow(modifier.id, 'modifierType', e.target.value)
                        }
                        size="sm"
                      >
                        {MODIFIER_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Form.Select>
                    </td>

                    <td>
                      <Form.Control
                        type="number"
                        step="0.01"
                        value={modifier.value}
                        onChange={(e) => updateRow(modifier.id, 'value', e.target.value)}
                        isInvalid={!!validationErrors[`${modifier.id}-value`]}
                        placeholder="e.g., -10"
                        size="sm"
                      />
                      {validationErrors[`${modifier.id}-value`] && (
                        <div className={styles.errorText}>
                          {validationErrors[`${modifier.id}-value`]}
                        </div>
                      )}
                    </td>

                    <td>
                      <Form.Select
                        value={modifier.displayType}
                        onChange={(e) =>
                          updateRow(modifier.id, 'displayType', e.target.value)
                        }
                        size="sm"
                        style={{
                          backgroundColor: displayTypeObj?.color + '20',
                          borderColor: displayTypeObj?.color,
                        }}
                      >
                        {DISPLAY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </Form.Select>
                    </td>

                    <td>
                      <Form.Control
                        type="text"
                        value={modifier.condition}
                        onChange={(e) =>
                          updateRow(modifier.id, 'condition', e.target.value)
                        }
                        placeholder="Optional"
                        size="sm"
                      />
                    </td>

                    <td>
                      <Form.Control
                        type="number"
                        value={modifier.priority}
                        onChange={(e) =>
                          updateRow(modifier.id, 'priority', parseInt(e.target.value) || 0)
                        }
                        size="sm"
                      />
                    </td>

                    <td className={styles.checkboxCell}>
                      <Form.Check
                        type="checkbox"
                        checked={modifier.active}
                        onChange={(e) =>
                          updateRow(modifier.id, 'active', e.target.checked)
                        }
                      />
                    </td>

                    <td className={styles.actionsCell}>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeRow(modifier.id)}
                        title="Remove row"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        </div>

        <Button
          variant="outline-primary"
          size="sm"
          onClick={addRow}
          className={styles.addRowBtn}
        >
          + Add Modifier
        </Button>

        <div className={styles.summary}>
          <span className={styles.summaryText}>
            {modifiers.length} modifier{modifiers.length !== 1 ? 's' : ''} ready
          </span>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Modifiers
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default ModifiersModal
