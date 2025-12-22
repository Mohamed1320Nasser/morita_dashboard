import React, { useState } from 'react'
import { Table, Form, Badge } from 'react-bootstrap'
import Button from '@/components/atoms/buttons/button'
import styles from './ServiceModifiersPanel.module.scss'

const ServiceModifiersPanel = ({
  serviceModifiers = [],
  onUpdate,
  disabled = false,
}) => {
  const [validationErrors, setValidationErrors] = useState({})

  const addModifier = () => {
    const newId = Math.max(...serviceModifiers.map((m) => m.id), 0) + 1
    const updatedModifiers = [
      ...serviceModifiers,
      {
        id: newId,
        name: '',
        modifierType: 'PERCENTAGE',
        value: '',
        displayType: 'NORMAL',
        priority: serviceModifiers.length,
        condition: '',
        active: true,
      },
    ]
    onUpdate(updatedModifiers)
  }

  const removeModifier = (id) => {
    const updatedModifiers = serviceModifiers.filter((m) => m.id !== id)
    onUpdate(updatedModifiers)
  }

  const updateModifier = (id, field, value) => {
    const updatedModifiers = serviceModifiers.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    )
    onUpdate(updatedModifiers)

    // Clear validation error for this field
    setValidationErrors((prev) => {
      const updated = { ...prev }
      delete updated[`${id}-${field}`]
      return updated
    })
  }

  const getDisplayTypeIcon = (type) => {
    switch (type) {
      case 'UPCHARGE': return '🔺'
      case 'DISCOUNT': return '💰'
      case 'NOTE': return '📝'
      case 'WARNING': return '⚠️'
      default: return '⚙️'
    }
  }

  if (serviceModifiers.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No service modifiers added yet.</p>
        <p className={styles.hint}>
          Service modifiers apply to ALL pricing methods automatically.
        </p>
        <Button variant="primary" size="sm" onClick={addModifier} disabled={disabled}>
          + Add Service Modifier
        </Button>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>⚙️ Service Modifiers</span>
        <span className={styles.panelSubtitle}>
          These modifiers apply to ALL pricing methods in this service
        </span>
      </div>
      <div className={styles.tableWrapper}>
        <Table bordered hover responsive size="sm" className={styles.modifiersTable}>
          <thead>
            <tr>
              <th style={{ width: '3%' }}>#</th>
              <th style={{ width: '20%' }}>Modifier Name *</th>
              <th style={{ width: '12%' }}>Type *</th>
              <th style={{ width: '10%' }}>Value *</th>
              <th style={{ width: '12%' }}>Display Type</th>
              <th style={{ width: '8%' }}>Priority</th>
              <th style={{ width: '20%' }}>Condition (JSON)</th>
              <th style={{ width: '6%' }}>Active</th>
              <th style={{ width: '3%' }}></th>
            </tr>
          </thead>
          <tbody>
            {serviceModifiers.map((modifier, index) => (
              <tr
                key={modifier.id}
                className={
                  validationErrors[`${modifier.id}-name`] ? styles.errorRow : ''
                }
              >
                <td className={styles.rowNumber}>
                  {getDisplayTypeIcon(modifier.displayType)} {index + 1}
                </td>

                <td>
                  <Form.Control
                    type="text"
                    value={modifier.name}
                    onChange={(e) => updateModifier(modifier.id, 'name', e.target.value)}
                    isInvalid={!!validationErrors[`${modifier.id}-name`]}
                    placeholder="e.g., Iron Account, Hardcore"
                    size="sm"
                    disabled={disabled}
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
                      updateModifier(modifier.id, 'modifierType', e.target.value)
                    }
                    size="sm"
                    disabled={disabled}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed ($)</option>
                  </Form.Select>
                </td>

                <td>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={modifier.value}
                    onChange={(e) =>
                      updateModifier(modifier.id, 'value', e.target.value)
                    }
                    isInvalid={!!validationErrors[`${modifier.id}-value`]}
                    placeholder="10"
                    size="sm"
                    disabled={disabled}
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
                      updateModifier(modifier.id, 'displayType', e.target.value)
                    }
                    size="sm"
                    disabled={disabled}
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="UPCHARGE">🔺 Upcharge</option>
                    <option value="DISCOUNT">💰 Discount</option>
                    <option value="NOTE">📝 Note</option>
                    <option value="WARNING">⚠️ Warning</option>
                  </Form.Select>
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={modifier.priority}
                    onChange={(e) =>
                      updateModifier(
                        modifier.id,
                        'priority',
                        parseInt(e.target.value) || 0
                      )
                    }
                    size="sm"
                    disabled={disabled}
                  />
                </td>

                <td>
                  <Form.Control
                    type="text"
                    value={modifier.condition}
                    onChange={(e) =>
                      updateModifier(modifier.id, 'condition', e.target.value)
                    }
                    placeholder='{"type": "..."}'
                    size="sm"
                    disabled={disabled}
                  />
                </td>

                <td className={styles.checkboxCell}>
                  <Form.Check
                    type="checkbox"
                    checked={modifier.active}
                    onChange={(e) =>
                      updateModifier(modifier.id, 'active', e.target.checked)
                    }
                    disabled={disabled}
                  />
                </td>

                <td className={styles.actionsCell}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeModifier(modifier.id)}
                    disabled={disabled}
                    title="Remove modifier"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Button
        variant="outline-primary"
        size="sm"
        onClick={addModifier}
        disabled={disabled}
        className={styles.addModifierBtn}
      >
        + Add Service Modifier
      </Button>
    </div>
  )
}

export default ServiceModifiersPanel
