import React, { useState } from 'react'
import { Table, Form } from 'react-bootstrap'
import Button from '@/components/atoms/buttons/button'
import { notify } from '@/config/error'
import styles from './BatchPricingMethodsTable.module.scss'

const PRICING_UNITS = [
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'PER_LEVEL', label: 'Per Level' },
  { value: 'PER_KILL', label: 'Per Kill' },
  { value: 'PER_ITEM', label: 'Per Item' },
  { value: 'PER_HOUR', label: 'Per Hour' },
]

const BatchPricingMethodsTable = ({ serviceId, serviceName, onSubmit, onCancel }) => {
  const [pricingMethods, setPricingMethods] = useState([
    {
      id: 1,
      name: '',
      pricingUnit: 'FIXED',
      basePrice: '',
      startLevel: '',
      endLevel: '',
      description: '',
      displayOrder: 0,
      active: true
    }
  ])
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  const addRow = () => {
    const newId = Math.max(...pricingMethods.map(m => m.id)) + 1
    setPricingMethods([
      ...pricingMethods,
      {
        id: newId,
        name: '',
        pricingUnit: 'FIXED',
        basePrice: '',
        startLevel: '',
        endLevel: '',
        description: '',
        displayOrder: pricingMethods.length,
        active: true
      }
    ])
  }

  const removeRow = (id) => {
    if (pricingMethods.length === 1) {
      notify('At least one pricing method is required', 'warning')
      return
    }
    setPricingMethods(pricingMethods.filter(m => m.id !== id))
  }

  const updateRow = (id, field, value) => {
    setPricingMethods(pricingMethods.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ))
    // Clear validation error for this field
    setValidationErrors(prev => {
      const updated = { ...prev }
      delete updated[`${id}-${field}`]
      return updated
    })
  }

  const validatePricingMethods = () => {
    const errors = {}
    let hasErrors = false

    pricingMethods.forEach((method) => {
      // Name is required
      if (!method.name.trim()) {
        errors[`${method.id}-name`] = 'Required'
        hasErrors = true
      }

      // Base price is required and must be a number
      if (!method.basePrice || isNaN(parseFloat(method.basePrice))) {
        errors[`${method.id}-basePrice`] = 'Valid price required'
        hasErrors = true
      }

      // Check for duplicate names
      const duplicates = pricingMethods.filter(m =>
        m.id !== method.id &&
        m.name.trim().toLowerCase() === method.name.trim().toLowerCase()
      )
      if (duplicates.length > 0) {
        errors[`${method.id}-name`] = 'Duplicate name'
        hasErrors = true
      }

      // Validate levels for PER_LEVEL pricing
      if (method.pricingUnit === 'PER_LEVEL') {
        if (method.startLevel && method.endLevel) {
          const start = parseInt(method.startLevel)
          const end = parseInt(method.endLevel)
          if (start >= end) {
            errors[`${method.id}-endLevel`] = 'End must be > Start'
            hasErrors = true
          }
        }
      }
    })

    setValidationErrors(errors)
    return !hasErrors
  }

  const handleSubmit = async () => {
    if (!validatePricingMethods()) {
      notify('Please fix validation errors', 'error')
      return
    }

    setSubmitting(true)

    const payload = {
      serviceId,
      pricingMethods: pricingMethods.map(m => ({
        name: m.name.trim(),
        pricingUnit: m.pricingUnit,
        basePrice: parseFloat(m.basePrice),
        startLevel: m.startLevel ? parseInt(m.startLevel) : undefined,
        endLevel: m.endLevel ? parseInt(m.endLevel) : undefined,
        description: m.description.trim(),
        displayOrder: m.displayOrder,
        active: m.active
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
      const isLastRow = pricingMethods[pricingMethods.length - 1].id === rowId
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
        <h4>Add Multiple Pricing Methods to: <strong>{serviceName}</strong></h4>
        <p className={styles.hint}>
          💡 <strong>Tip:</strong> Use Tab key to navigate between fields. Press Tab on the last field to add a new row automatically.
        </p>
      </div>

      <div className={styles.tableWrapper}>
        <Table bordered hover responsive className={styles.pricingTable}>
          <thead>
            <tr>
              <th style={{ width: '4%' }}>#</th>
              <th style={{ width: '18%' }}>Method Name *</th>
              <th style={{ width: '12%' }}>Pricing Unit *</th>
              <th style={{ width: '10%' }}>Base Price *</th>
              <th style={{ width: '10%' }}>Start Level</th>
              <th style={{ width: '10%' }}>End Level</th>
              <th style={{ width: '20%' }}>Description</th>
              <th style={{ width: '8%' }}>Priority</th>
              <th style={{ width: '6%' }}>Active</th>
              <th style={{ width: '4%' }}></th>
            </tr>
          </thead>
          <tbody>
            {pricingMethods.map((method, index) => (
              <tr key={method.id} className={validationErrors[`${method.id}-name`] ? styles.errorRow : ''}>
                <td className={styles.rowNumber}>{index + 1}</td>

                <td>
                  <Form.Control
                    type="text"
                    value={method.name}
                    onChange={(e) => updateRow(method.id, 'name', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, method.id, 'name')}
                    isInvalid={!!validationErrors[`${method.id}-name`]}
                    placeholder="e.g., Standard"
                    data-row-id={method.id}
                    disabled={submitting}
                    size="sm"
                  />
                  {validationErrors[`${method.id}-name`] && (
                    <div className={styles.errorText}>
                      {validationErrors[`${method.id}-name`]}
                    </div>
                  )}
                </td>

                <td>
                  <Form.Select
                    value={method.pricingUnit}
                    onChange={(e) => updateRow(method.id, 'pricingUnit', e.target.value)}
                    disabled={submitting}
                    size="sm"
                  >
                    {PRICING_UNITS.map(unit => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </Form.Select>
                </td>

                <td>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={method.basePrice}
                    onChange={(e) => updateRow(method.id, 'basePrice', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, method.id, 'basePrice')}
                    isInvalid={!!validationErrors[`${method.id}-basePrice`]}
                    placeholder="0.00"
                    disabled={submitting}
                    size="sm"
                  />
                  {validationErrors[`${method.id}-basePrice`] && (
                    <div className={styles.errorText}>
                      {validationErrors[`${method.id}-basePrice`]}
                    </div>
                  )}
                </td>

                <td>
                  <Form.Control
                    type="text"
                    value={method.startLevel}
                    onChange={(e) => updateRow(method.id, 'startLevel', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, method.id, 'startLevel')}
                    placeholder={method.pricingUnit === 'PER_LEVEL' ? 'e.g., 1' : '-'}
                    disabled={submitting || method.pricingUnit !== 'PER_LEVEL'}
                    size="sm"
                  />
                </td>

                <td>
                  <Form.Control
                    type="text"
                    value={method.endLevel}
                    onChange={(e) => updateRow(method.id, 'endLevel', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, method.id, 'endLevel')}
                    isInvalid={!!validationErrors[`${method.id}-endLevel`]}
                    placeholder={method.pricingUnit === 'PER_LEVEL' ? 'e.g., 50' : '-'}
                    disabled={submitting || method.pricingUnit !== 'PER_LEVEL'}
                    size="sm"
                  />
                  {validationErrors[`${method.id}-endLevel`] && (
                    <div className={styles.errorText}>
                      {validationErrors[`${method.id}-endLevel`]}
                    </div>
                  )}
                </td>

                <td>
                  <Form.Control
                    as="textarea"
                    rows={1}
                    value={method.description}
                    onChange={(e) => updateRow(method.id, 'description', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, method.id, 'description')}
                    placeholder="Optional"
                    disabled={submitting}
                    size="sm"
                  />
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={method.displayOrder}
                    onChange={(e) => updateRow(method.id, 'displayOrder', parseInt(e.target.value) || 0)}
                    onKeyDown={(e) => handleKeyDown(e, method.id, 'displayOrder')}
                    disabled={submitting}
                    size="sm"
                  />
                </td>

                <td className={styles.checkboxCell}>
                  <Form.Check
                    type="checkbox"
                    checked={method.active}
                    onChange={(e) => updateRow(method.id, 'active', e.target.checked)}
                    onKeyDown={(e) => handleKeyDown(e, method.id, 'active')}
                    disabled={submitting}
                  />
                </td>

                <td>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => removeRow(method.id)}
                    disabled={pricingMethods.length === 1 || submitting}
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
          {pricingMethods.length} pricing method{pricingMethods.length !== 1 ? 's' : ''} ready to create
        </div>

        <div className={styles.buttons}>
          <Button cancel onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            primary
            onClick={handleSubmit}
            disabled={submitting || pricingMethods.length === 0}
          >
            {submitting ? 'Creating...' : `Create All (${pricingMethods.length})`}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BatchPricingMethodsTable
