import React, { useState } from 'react'
import { Table, Form, Badge, OverlayTrigger, Tooltip } from 'react-bootstrap'
import Button from '@/components/atoms/buttons/button'
import { notify } from '@/config/error'
import ModifiersModal from './ModifiersModal'
import styles from './PricingMethodsPanel.module.scss'

const PRICING_UNITS = [
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'PER_LEVEL', label: 'Per Level' },
  { value: 'PER_KILL', label: 'Per Kill' },
  { value: 'PER_ITEM', label: 'Per Item' },
  { value: 'PER_HOUR', label: 'Per Hour' },
]

const PricingMethodsPanel = ({
  pricingMethods = [],
  onUpdate,
  disabled = false,
}) => {
  const [validationErrors, setValidationErrors] = useState({})
  const [modifierModalState, setModifierModalState] = useState({
    show: false,
    methodId: null,
    methodName: '',
  })

  const addMethod = () => {
    const newId = Math.max(...pricingMethods.map((m) => m.id), 0) + 1
    const updatedMethods = [
      ...pricingMethods,
      {
        id: newId,
        name: '',
        groupName: '',
        pricingUnit: 'FIXED',
        basePrice: '',
        startLevel: '',
        endLevel: '',
        description: '',
        displayOrder: pricingMethods.length,
        active: true,
        modifiers: [],
      },
    ]
    onUpdate(updatedMethods)
  }

  const removeMethod = (id) => {
    const updatedMethods = pricingMethods.filter((m) => m.id !== id)
    onUpdate(updatedMethods)
  }

  const updateMethod = (id, field, value) => {
    const updatedMethods = pricingMethods.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    )
    onUpdate(updatedMethods)

    // Clear validation error for this field
    setValidationErrors((prev) => {
      const updated = { ...prev }
      delete updated[`${id}-${field}`]
      return updated
    })
  }

  const openModifiersModal = (methodId, methodName) => {
    setModifierModalState({
      show: true,
      methodId,
      methodName,
    })
  }

  const closeModifiersModal = () => {
    setModifierModalState({
      show: false,
      methodId: null,
      methodName: '',
    })
  }

  const saveModifiers = (modifiers) => {
    const updatedMethods = pricingMethods.map((m) =>
      m.id === modifierModalState.methodId ? { ...m, modifiers } : m
    )
    onUpdate(updatedMethods)
    closeModifiersModal()
    notify('Modifiers saved successfully', 'success')
  }

  if (pricingMethods.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No pricing methods added yet.</p>
        <Button variant="primary" size="sm" onClick={addMethod} disabled={disabled}>
          + Add Pricing Method
        </Button>
      </div>
    )
  }

  const currentMethod = pricingMethods.find((m) => m.id === modifierModalState.methodId)

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>💰 Pricing Methods</span>
        <span className={styles.panelSubtitle}>Configure pricing options for this service</span>
      </div>
      <div className={styles.tableWrapper}>
        <Table bordered hover responsive size="sm" className={styles.methodsTable}>
          <thead>
            <tr>
              <th style={{ width: '3%' }}>#</th>
              <th style={{ width: '15%' }}>Method Name *</th>
              <th style={{ width: '13%' }}>
                Group Name{' '}
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip>
                      Group related pricing methods together (e.g., all ARMA methods, all BANDOS methods). Methods with the same group name will be displayed together in Discord.
                    </Tooltip>
                  }
                >
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0',
                    color: '#666',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    cursor: 'help',
                    userSelect: 'none',
                    marginLeft: '4px'
                  }}>
                    i
                  </span>
                </OverlayTrigger>
              </th>
              <th style={{ width: '11%' }}>Pricing Unit *</th>
              <th style={{ width: '9%' }}>Base Price *</th>
              <th style={{ width: '7%' }}>Start Lvl</th>
              <th style={{ width: '7%' }}>End Lvl</th>
              <th style={{ width: '13%' }}>Description</th>
              <th style={{ width: '7%' }}>Priority</th>
              <th style={{ width: '5%' }}>Active</th>
              <th style={{ width: '11%' }}>Modifiers</th>
              <th style={{ width: '3%' }}></th>
            </tr>
          </thead>
          <tbody>
            {pricingMethods.map((method, index) => (
              <tr
                key={method.id}
                className={
                  validationErrors[`${method.id}-name`] ? styles.errorRow : ''
                }
              >
                <td className={styles.rowNumber}>{index + 1}</td>

                <td>
                  <Form.Control
                    type="text"
                    value={method.name}
                    onChange={(e) => updateMethod(method.id, 'name', e.target.value)}
                    isInvalid={!!validationErrors[`${method.id}-name`]}
                    placeholder="e.g., Standard"
                    size="sm"
                    disabled={disabled}
                  />
                  {validationErrors[`${method.id}-name`] && (
                    <div className={styles.errorText}>
                      {validationErrors[`${method.id}-name`]}
                    </div>
                  )}
                </td>

                <td>
                  <Form.Control
                    type="text"
                    value={method.groupName || ''}
                    onChange={(e) => updateMethod(method.id, 'groupName', e.target.value)}
                    placeholder="e.g., ARMA - Armadyl"
                    size="sm"
                    disabled={disabled}
                  />
                </td>

                <td>
                  <Form.Select
                    value={method.pricingUnit}
                    onChange={(e) =>
                      updateMethod(method.id, 'pricingUnit', e.target.value)
                    }
                    size="sm"
                    disabled={disabled}
                  >
                    {PRICING_UNITS.map((unit) => (
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
                    onChange={(e) =>
                      updateMethod(method.id, 'basePrice', e.target.value)
                    }
                    isInvalid={!!validationErrors[`${method.id}-basePrice`]}
                    placeholder="0.00"
                    size="sm"
                    disabled={disabled}
                  />
                  {validationErrors[`${method.id}-basePrice`] && (
                    <div className={styles.errorText}>
                      {validationErrors[`${method.id}-basePrice`]}
                    </div>
                  )}
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={method.startLevel}
                    onChange={(e) =>
                      updateMethod(method.id, 'startLevel', e.target.value)
                    }
                    placeholder={method.pricingUnit === 'PER_LEVEL' ? '1' : '-'}
                    size="sm"
                    disabled={disabled || method.pricingUnit !== 'PER_LEVEL'}
                  />
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={method.endLevel}
                    onChange={(e) =>
                      updateMethod(method.id, 'endLevel', e.target.value)
                    }
                    placeholder={method.pricingUnit === 'PER_LEVEL' ? '99' : '-'}
                    size="sm"
                    disabled={disabled || method.pricingUnit !== 'PER_LEVEL'}
                  />
                </td>

                <td>
                  <Form.Control
                    type="text"
                    value={method.description}
                    onChange={(e) =>
                      updateMethod(method.id, 'description', e.target.value)
                    }
                    placeholder="Optional"
                    size="sm"
                    disabled={disabled}
                  />
                </td>

                <td>
                  <Form.Control
                    type="number"
                    value={method.displayOrder}
                    onChange={(e) =>
                      updateMethod(
                        method.id,
                        'displayOrder',
                        parseInt(e.target.value) || 0
                      )
                    }
                    size="sm"
                    disabled={disabled}
                  />
                </td>

                <td className={styles.checkboxCell}>
                  <Form.Check
                    type="checkbox"
                    checked={method.active}
                    onChange={(e) =>
                      updateMethod(method.id, 'active', e.target.checked)
                    }
                    disabled={disabled}
                  />
                </td>

                <td className={styles.modifiersCell}>
                  <Button
                    variant={
                      method.modifiers && method.modifiers.length > 0
                        ? 'success'
                        : 'outline-secondary'
                    }
                    size="sm"
                    onClick={() => openModifiersModal(method.id, method.name)}
                    disabled={disabled}
                    className={styles.modifiersBtn}
                  >
                    {method.modifiers && method.modifiers.length > 0 ? (
                      <>
                        <Badge bg="light" text="dark" className={styles.badge}>
                          {method.modifiers.length}
                        </Badge>{' '}
                        Edit
                      </>
                    ) : (
                      '+ Add'
                    )}
                  </Button>
                </td>

                <td className={styles.actionsCell}>
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeMethod(method.id)}
                    disabled={disabled}
                    title="Remove method"
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
        onClick={addMethod}
        disabled={disabled}
        className={styles.addMethodBtn}
      >
        + Add Pricing Method
      </Button>

      {/* Modifiers Modal */}
      <ModifiersModal
        show={modifierModalState.show}
        onHide={closeModifiersModal}
        methodName={modifierModalState.methodName || 'Pricing Method'}
        initialModifiers={currentMethod?.modifiers || []}
        onSave={saveModifiers}
      />
    </div>
  )
}

export default PricingMethodsPanel
