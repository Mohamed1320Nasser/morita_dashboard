import React, { useState, useEffect } from 'react'
import { Table, Form, Collapse, Badge } from 'react-bootstrap'
import Button from '@/components/atoms/buttons/button'
import { notify } from '@/config/error'
import PricingMethodsPanel from './PricingMethodsPanel'
import ServiceModifiersPanel from './ServiceModifiersPanel'
import EmojiPickerPopover from '@/components/shared/EmojiPickerPopover'
import styles from './BatchServicesWithPricingTable.module.scss'

const LOCAL_STORAGE_KEY = 'batch_services_with_pricing_draft'

const BatchServicesWithPricingTable = ({
  categoryId,
  categoryName,
  onSubmit,
  onCancel,
}) => {
  const [services, setServices] = useState([
    {
      id: 1,
      name: '',
      emoji: '',
      imageUrl: '',
      description: '',
      displayOrder: 0,
      active: true,
      expandedPricing: false,
      expandedModifiers: false,
      pricingMethods: [],
      serviceModifiers: [],
    },
  ])
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  // Load from localStorage on mount only
  useEffect(() => {
    const storageKey = `${LOCAL_STORAGE_KEY}_${categoryId}`
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setServices(parsed)
      } catch (e) {
        console.error('Failed to parse saved data:', e)
      }
    }
  }, [categoryId])

  // Auto-save to localStorage on services change (debounced)
  useEffect(() => {
    const storageKey = `${LOCAL_STORAGE_KEY}_${categoryId}`
    const timeoutId = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(services))
    }, 1000) // Debounce 1 second

    return () => clearTimeout(timeoutId)
  }, [services, categoryId])

  const addService = () => {
    const newId = Math.max(...services.map((s) => s.id)) + 1
    setServices([
      ...services,
      {
        id: newId,
        name: '',
        emoji: '',
        imageUrl: '',
        description: '',
        displayOrder: services.length,
        active: true,
        expandedPricing: false,
        expandedModifiers: false,
        pricingMethods: [],
        serviceModifiers: [],
      },
    ])
  }

  const removeService = (id) => {
    if (services.length === 1) {
      notify('At least one service is required', 'warning')
      return
    }
    setServices(services.filter((s) => s.id !== id))
  }

  const updateService = (id, field, value) => {
    setServices(
      services.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    )
    // Clear validation error for this field
    setValidationErrors((prev) => {
      const updated = { ...prev }
      delete updated[`${id}-${field}`]
      return updated
    })
  }

  const togglePricingExpanded = (id) => {
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, expandedPricing: !s.expandedPricing } : s
      )
    )
  }

  const toggleModifiersExpanded = (id) => {
    setServices(
      services.map((s) =>
        s.id === id ? { ...s, expandedModifiers: !s.expandedModifiers } : s
      )
    )
  }

  const updatePricingMethods = (serviceId, pricingMethods) => {
    setServices(
      services.map((s) =>
        s.id === serviceId ? { ...s, pricingMethods } : s
      )
    )
  }

  const updateServiceModifiers = (serviceId, serviceModifiers) => {
    setServices(
      services.map((s) =>
        s.id === serviceId ? { ...s, serviceModifiers } : s
      )
    )
  }

  const validateServices = () => {
    const errors = {}
    let hasErrors = false

    services.forEach((service) => {
      // Service name is required
      if (!service.name.trim()) {
        errors[`${service.id}-name`] = 'Required'
        hasErrors = true
      }

      // Check for duplicate service names
      const duplicates = services.filter(
        (s) =>
          s.id !== service.id &&
          s.name.trim().toLowerCase() === service.name.trim().toLowerCase()
      )
      if (duplicates.length > 0) {
        errors[`${service.id}-name`] = 'Duplicate name'
        hasErrors = true
      }

      // Validate pricing methods if any
      if (service.pricingMethods && service.pricingMethods.length > 0) {
        service.pricingMethods.forEach((method) => {
          // Method name is required
          if (!method.name.trim()) {
            errors[`${service.id}-pricing-${method.id}-name`] = 'Required'
            hasErrors = true
          }

          // Base price is required
          if (!method.basePrice || isNaN(parseFloat(method.basePrice))) {
            errors[`${service.id}-pricing-${method.id}-basePrice`] =
              'Valid price required'
            hasErrors = true
          }

          // Check for duplicate method names within service
          const duplicateMethods = service.pricingMethods.filter(
            (m) =>
              m.id !== method.id &&
              m.name.trim().toLowerCase() === method.name.trim().toLowerCase()
          )
          if (duplicateMethods.length > 0) {
            errors[`${service.id}-pricing-${method.id}-name`] = 'Duplicate name'
            hasErrors = true
          }

          // Validate level ranges for PER_LEVEL
          if (method.pricingUnit === 'PER_LEVEL') {
            if (method.startLevel && method.endLevel) {
              const start = parseInt(method.startLevel)
              const end = parseInt(method.endLevel)
              if (start >= end) {
                errors[`${service.id}-pricing-${method.id}-endLevel`] =
                  'End must be > Start'
                hasErrors = true
              }
            }
          }
        })
      }
    })

    setValidationErrors(errors)
    return !hasErrors
  }

  const handleSubmit = async () => {
    if (!validateServices()) {
      notify('Please fix validation errors before submitting', 'error')
      return
    }

    setSubmitting(true)

    const payload = {
      categoryId,
      services: services.map((s) => ({
        name: s.name.trim(),
        emoji: s.emoji.trim() || undefined,
        imageUrl: s.imageUrl?.trim() || undefined,
        description: s.description.trim() || undefined,
        displayOrder: s.displayOrder,
        active: s.active,
        serviceModifiers:
          s.serviceModifiers && s.serviceModifiers.length > 0
            ? s.serviceModifiers.map((mod) => ({
                name: mod.name.trim(),
                modifierType: mod.modifierType,
                value: parseFloat(mod.value),
                condition: mod.condition?.trim() || undefined,
                displayType: mod.displayType || 'NORMAL',
                priority: mod.priority,
                active: mod.active,
              }))
            : undefined,
        pricingMethods:
          s.pricingMethods && s.pricingMethods.length > 0
            ? s.pricingMethods.map((m) => ({
                name: m.name.trim(),
                pricingUnit: m.pricingUnit,
                basePrice: parseFloat(m.basePrice),
                startLevel: m.startLevel ? parseInt(m.startLevel) : undefined,
                endLevel: m.endLevel ? parseInt(m.endLevel) : undefined,
                description: m.description?.trim() || undefined,
                displayOrder: m.displayOrder,
                active: m.active,
                modifiers:
                  m.modifiers && m.modifiers.length > 0
                    ? m.modifiers.map((mod) => ({
                        name: mod.name.trim(),
                        modifierType: mod.modifierType,
                        value: parseFloat(mod.value),
                        condition: mod.condition?.trim() || undefined,
                        displayType: mod.displayType || 'NORMAL',
                        priority: mod.priority,
                        active: mod.active,
                      }))
                    : undefined,
              }))
            : undefined,
      })),
    }

    const result = await onSubmit(payload)

    // Clear localStorage on success
    if (result && result.success) {
      const storageKey = `${LOCAL_STORAGE_KEY}_${categoryId}`
      localStorage.removeItem(storageKey)
    } else {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Clear localStorage
    const storageKey = `${LOCAL_STORAGE_KEY}_${categoryId}`
    localStorage.removeItem(storageKey)
    onCancel()
  }

  const handleKeyDown = (e, serviceId, field) => {
    // Tab on last field of last row = add new row
    if (e.key === 'Tab' && !e.shiftKey && field === 'active') {
      const isLastRow = services[services.length - 1].id === serviceId
      if (isLastRow) {
        e.preventDefault()
        addService()
        // Focus on first field of new row after short delay
        setTimeout(() => {
          const newRowInput = document.querySelector(
            `input[data-service-id="${serviceId + 1}"]`
          )
          if (newRowInput) newRowInput.focus()
        }, 50)
      }
    }
  }

  const getTotalCounts = () => {
    let totalPricingMethods = 0
    let totalPricingModifiers = 0
    let totalServiceModifiers = 0

    services.forEach((service) => {
      if (service.pricingMethods) {
        totalPricingMethods += service.pricingMethods.length
        service.pricingMethods.forEach((method) => {
          if (method.modifiers) {
            totalPricingModifiers += method.modifiers.length
          }
        })
      }
      if (service.serviceModifiers) {
        totalServiceModifiers += service.serviceModifiers.length
      }
    })

    return { totalPricingMethods, totalPricingModifiers, totalServiceModifiers }
  }

  const { totalPricingMethods, totalPricingModifiers, totalServiceModifiers } = getTotalCounts()

  return (
    <div className={styles.batchTable}>
      <div className={styles.header}>
        <h4>
          Add Multiple Services to: <strong>{categoryName}</strong>
        </h4>
      </div>

      <div className={styles.tableWrapper}>
        <Table bordered hover responsive className={styles.servicesTable}>
          <thead>
            <tr>
              <th style={{ width: '3%' }}>#</th>
              <th style={{ width: '15%' }}>Service Name *</th>
              <th style={{ width: '6%' }}>Emoji</th>
              <th style={{ width: '15%' }}>Image URL</th>
              <th style={{ width: '15%' }}>Description</th>
              <th style={{ width: '6%' }}>Priority</th>
              <th style={{ width: '5%' }}>Active</th>
              <th style={{ width: '12%' }}>Modifiers</th>
              <th style={{ width: '12%' }}>Pricing</th>
              <th style={{ width: '3%' }}></th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <React.Fragment key={service.id}>
                <tr
                  className={
                    validationErrors[`${service.id}-name`] ? styles.errorRow : ''
                  }
                >
                  <td className={styles.rowNumber}>{index + 1}</td>

                  <td>
                    <Form.Control
                      type="text"
                      value={service.name}
                      onChange={(e) =>
                        updateService(service.id, 'name', e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, service.id, 'name')}
                      isInvalid={!!validationErrors[`${service.id}-name`]}
                      placeholder="e.g., Fire Cape"
                      data-service-id={service.id}
                      disabled={submitting}
                      size="sm"
                    />
                    {validationErrors[`${service.id}-name`] && (
                      <div className={styles.errorText}>
                        {validationErrors[`${service.id}-name`]}
                      </div>
                    )}
                  </td>

                  <td>
                    <EmojiPickerPopover
                      value={service.emoji}
                      onChange={(emoji) =>
                        updateService(service.id, 'emoji', emoji)
                      }
                      disabled={submitting}
                    />
                  </td>

                  <td>
                    <Form.Control
                      type="text"
                      value={service.imageUrl}
                      onChange={(e) =>
                        updateService(service.id, 'imageUrl', e.target.value)
                      }
                      placeholder="https://oldschool.runescape.wiki/images/..."
                      disabled={submitting}
                      size="sm"
                    />
                  </td>

                  <td>
                    <Form.Control
                      type="text"
                      value={service.description}
                      onChange={(e) =>
                        updateService(service.id, 'description', e.target.value)
                      }
                      placeholder="Optional description"
                      disabled={submitting}
                      size="sm"
                    />
                  </td>

                  <td>
                    <Form.Control
                      type="number"
                      value={service.displayOrder}
                      onChange={(e) =>
                        updateService(
                          service.id,
                          'displayOrder',
                          parseInt(e.target.value) || 0
                        )
                      }
                      disabled={submitting}
                      size="sm"
                    />
                  </td>

                  <td className={styles.checkboxCell}>
                    <Form.Check
                      type="checkbox"
                      checked={service.active}
                      onChange={(e) =>
                        updateService(service.id, 'active', e.target.checked)
                      }
                      onKeyDown={(e) => handleKeyDown(e, service.id, 'active')}
                      disabled={submitting}
                    />
                  </td>

                  <td className={styles.modifiersCell}>
                    <Button
                      variant={
                        service.serviceModifiers && service.serviceModifiers.length > 0
                          ? 'info'
                          : 'outline-secondary'
                      }
                      size="sm"
                      onClick={() => toggleModifiersExpanded(service.id)}
                      disabled={submitting}
                      className={styles.modifiersBtn}
                    >
                      {service.serviceModifiers && service.serviceModifiers.length > 0 ? (
                        <>
                          <Badge bg="light" text="dark" className={styles.badge}>
                            {service.serviceModifiers.length}
                          </Badge>{' '}
                          {service.expandedModifiers ? '▼ Hide' : '▶ Edit'}
                        </>
                      ) : (
                        <>{service.expandedModifiers ? '▼ Hide' : '+ Add'}</>
                      )}
                    </Button>
                  </td>

                  <td className={styles.pricingCell}>
                    <Button
                      variant={
                        service.pricingMethods && service.pricingMethods.length > 0
                          ? 'success'
                          : 'outline-primary'
                      }
                      size="sm"
                      onClick={() => togglePricingExpanded(service.id)}
                      disabled={submitting}
                      className={styles.pricingBtn}
                    >
                      {service.pricingMethods && service.pricingMethods.length > 0 ? (
                        <>
                          <Badge bg="light" text="dark" className={styles.badge}>
                            {service.pricingMethods.length}
                          </Badge>{' '}
                          {service.expandedPricing ? '▼ Hide' : '▶ Edit'}
                        </>
                      ) : (
                        <>{service.expandedPricing ? '▼ Hide' : '+ Add'}</>
                      )}
                    </Button>
                  </td>

                  <td className={styles.actionsCell}>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeService(service.id)}
                      disabled={submitting}
                      title="Remove service"
                    >
                      ×
                    </button>
                  </td>
                </tr>

                {/* Expanded Service Modifiers Panel */}
                <tr>
                  <td colSpan="9" className={styles.expandedCell}>
                    <Collapse in={service.expandedModifiers}>
                      <div>
                        <ServiceModifiersPanel
                          serviceModifiers={service.serviceModifiers}
                          onUpdate={(modifiers) =>
                            updateServiceModifiers(service.id, modifiers)
                          }
                          disabled={submitting}
                        />
                      </div>
                    </Collapse>
                  </td>
                </tr>

                {/* Expanded Pricing Methods Panel */}
                <tr>
                  <td colSpan="9" className={styles.expandedCell}>
                    <Collapse in={service.expandedPricing}>
                      <div>
                        <PricingMethodsPanel
                          pricingMethods={service.pricingMethods}
                          onUpdate={(methods) =>
                            updatePricingMethods(service.id, methods)
                          }
                          disabled={submitting}
                        />
                      </div>
                    </Collapse>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </div>

      <div className={styles.actions}>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={addService}
          disabled={submitting}
          className={styles.addRowBtn}
        >
          + Add Service
        </Button>

        <div className={styles.summary}>
          <span className={styles.summaryText}>
            {services.length} service{services.length !== 1 ? 's' : ''},{' '}
            {totalServiceModifiers} service modifier
            {totalServiceModifiers !== 1 ? 's' : ''},{' '}
            {totalPricingMethods} pricing method
            {totalPricingMethods !== 1 ? 's' : ''},{' '}
            {totalPricingModifiers} pricing modifier
            {totalPricingModifiers !== 1 ? 's' : ''} ready
          </span>
        </div>

        <div className={styles.submitActions}>
          <Button variant="light" onClick={handleCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating...' : `Create All (${services.length})`}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BatchServicesWithPricingTable
