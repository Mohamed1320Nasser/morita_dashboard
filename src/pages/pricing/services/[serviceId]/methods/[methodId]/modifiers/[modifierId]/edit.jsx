import React, { useState, useEffect } from 'react'
import styles from '../modifierForm.module.scss'
import Button from '@/components/atoms/buttons/button'
import { useRouter } from 'next/router'
import pricingController from '@/controllers/pricing'
import modifiersController from '@/controllers/modifiers'
import servicesController from '@/controllers/services'
import { notify } from '@/config/error'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import InputBox from '@/components/molecules/inputBox/inputBox'
import { toast } from 'react-hot-toast'

const CONDITION_TYPES = [
  { value: '', label: 'No Condition (Always Applied)' },
  { value: 'price_range', label: 'Price Range' },
  { value: 'custom_field', label: 'Custom Field' },
  { value: 'quantity_range', label: 'Quantity Range' },
]

const EditModifier = () => {
  const router = useRouter()
  const { serviceId, methodId, modifierId } = router.query
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [service, setService] = useState(null)
  const [pricingMethod, setPricingMethod] = useState(null)
  const [modifier, setModifier] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    modifierType: 'PERCENTAGE',
    value: '',
    priority: 0,
    active: true,
    conditionType: '',
    priceMin: '',
    priceMax: '',
    customFieldName: '',
    customFieldValue: '',
    quantityMin: '',
    quantityMax: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!serviceId || !methodId || !modifierId) return

    const fetchData = async () => {
      try {
        // Fetch service
        const serviceRes = await servicesController.getServiceById(serviceId)
        if (serviceRes.success && serviceRes.data?.service) {
          setService(serviceRes.data.service)
        }

        // Fetch pricing method
        const methodRes = await pricingController.getPricingMethodById(methodId)
        if (methodRes.success && methodRes.data?.pricingMethod) {
          setPricingMethod(methodRes.data.pricingMethod)
        }

        // Fetch modifier
        const modifierRes = await modifiersController.getModifierById(modifierId)
        if (modifierRes.success && modifierRes.data?.modifier) {
          const modifierData = modifierRes.data.modifier
          setModifier(modifierData)

          // Parse condition if exists
          let conditionData = {
            conditionType: '',
            priceMin: '',
            priceMax: '',
            customFieldName: '',
            customFieldValue: '',
            quantityMin: '',
            quantityMax: '',
          }

          if (modifierData.condition) {
            try {
              const conditionStr = String(modifierData.condition).trim()
              if (conditionStr && (conditionStr.startsWith('{') || conditionStr.startsWith('['))) {
                const condition = JSON.parse(conditionStr)
                conditionData.conditionType = condition.type || ''

                if (condition.type === 'price_range') {
                  conditionData.priceMin = condition.min || ''
                  conditionData.priceMax = condition.max || ''
                } else if (condition.type === 'custom_field') {
                  conditionData.customFieldName = condition.field || ''
                  conditionData.customFieldValue = String(condition.value || '')
                } else if (condition.type === 'quantity_range') {
                  conditionData.quantityMin = condition.min || ''
                  conditionData.quantityMax = condition.max || ''
                }
              }
            } catch (e) {
              console.error('Failed to parse condition:', e)
            }
          }

          setFormData({
            name: modifierData.name || '',
            modifierType: modifierData.modifierType || 'PERCENTAGE',
            value: String(modifierData.value || ''),
            priority: modifierData.priority || 0,
            active: modifierData.active !== undefined ? modifierData.active : true,
            ...conditionData,
          })
        } else {
          notify('Modifier not found')
          router.push(`/pricing/services/${serviceId}/methods/${methodId}/modifiers`)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        notify('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [serviceId, methodId, modifierId, router])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.value || isNaN(Number(formData.value))) {
      newErrors.value = 'Value must be a valid number'
    }

    if (formData.modifierType === 'PERCENTAGE') {
      const val = Number(formData.value)
      if (val < -100 || val > 1000) {
        newErrors.value = 'Percentage must be between -100% and 1000%'
      }
    }

    if (formData.conditionType === 'price_range') {
      if (!formData.priceMin || !formData.priceMax) {
        newErrors.priceRange = 'Both min and max prices are required'
      } else if (Number(formData.priceMin) >= Number(formData.priceMax)) {
        newErrors.priceRange = 'Min price must be less than max price'
      }
    }

    if (formData.conditionType === 'custom_field') {
      if (!formData.customFieldName.trim()) {
        newErrors.customField = 'Field name is required'
      }
    }

    if (formData.conditionType === 'quantity_range') {
      if (!formData.quantityMin || !formData.quantityMax) {
        newErrors.quantityRange = 'Both min and max quantities are required'
      } else if (Number(formData.quantityMin) >= Number(formData.quantityMax)) {
        newErrors.quantityRange = 'Min quantity must be less than max quantity'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const buildConditionJSON = () => {
    if (!formData.conditionType) return null

    if (formData.conditionType === 'price_range') {
      return JSON.stringify({
        type: 'price_range',
        min: Number(formData.priceMin),
        max: Number(formData.priceMax),
      })
    }

    if (formData.conditionType === 'custom_field') {
      let value = formData.customFieldValue
      if (value === 'true') value = true
      else if (value === 'false') value = false
      else if (!isNaN(value) && value !== '') value = Number(value)

      return JSON.stringify({
        type: 'custom_field',
        field: formData.customFieldName,
        value: value,
      })
    }

    if (formData.conditionType === 'quantity_range') {
      return JSON.stringify({
        type: 'quantity_range',
        min: Number(formData.quantityMin),
        max: Number(formData.quantityMax),
      })
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      notify('Please fix the validation errors')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        modifierType: formData.modifierType,
        value: Number(formData.value),
        priority: Number(formData.priority),
        active: formData.active,
        condition: buildConditionJSON(),
        methodId: methodId,
      }

      const res = await modifiersController.updateModifier(modifierId, payload)

      if (res.success) {
        toast.success('Modifier updated successfully')
        router.push(`/pricing/services/${serviceId}/methods/${methodId}/modifiers`)
      } else {
        notify(res.error?.message || 'Failed to update modifier')
      }
    } catch (error) {
      console.error('Error updating modifier:', error)
      notify('Failed to update modifier')
    } finally {
      setSubmitting(false)
    }
  }

  const renderConditionFields = () => {
    if (!formData.conditionType) return null

    if (formData.conditionType === 'price_range') {
      return (
        <div className={styles.conditionFields}>
          <h4>Price Range Condition</h4>
          <p className={styles.conditionHelp}>
            This modifier will only apply when the calculated price is within this range.
          </p>
          <div className={styles.row}>
            <div className={styles.col}>
              <InputBox
                label="Minimum Price ($)"
                type="number"
                step="0.01"
                value={formData.priceMin}
                valueChange={(value) => handleChange('priceMin', value)}
                placeholder="0.00"
              />
            </div>
            <div className={styles.col}>
              <InputBox
                label="Maximum Price ($)"
                type="number"
                step="0.01"
                value={formData.priceMax}
                valueChange={(value) => handleChange('priceMax', value)}
                placeholder="100.00"
              />
            </div>
          </div>
          {errors.priceRange && <span className={styles.error}>{errors.priceRange}</span>}
        </div>
      )
    }

    if (formData.conditionType === 'custom_field') {
      return (
        <div className={styles.conditionFields}>
          <h4>Custom Field Condition</h4>
          <p className={styles.conditionHelp}>
            This modifier will apply when a custom field matches the specified value.
            <br />
            Examples: hasFireCape=false, accountType=iron, level=99
          </p>
          <div className={styles.row}>
            <div className={styles.col}>
              <InputBox
                label="Field Name"
                type="text"
                value={formData.customFieldName}
                valueChange={(value) => handleChange('customFieldName', value)}
                placeholder="e.g., hasFireCape"
              />
            </div>
            <div className={styles.col}>
              <InputBox
                label="Field Value"
                type="text"
                value={formData.customFieldValue}
                valueChange={(value) => handleChange('customFieldValue', value)}
                placeholder="e.g., false"
              />
            </div>
          </div>
          {errors.customField && <span className={styles.error}>{errors.customField}</span>}
        </div>
      )
    }

    if (formData.conditionType === 'quantity_range') {
      return (
        <div className={styles.conditionFields}>
          <h4>Quantity Range Condition</h4>
          <p className={styles.conditionHelp}>
            This modifier will apply when the order quantity is within this range.
          </p>
          <div className={styles.row}>
            <div className={styles.col}>
              <InputBox
                label="Minimum Quantity"
                type="number"
                step="1"
                value={formData.quantityMin}
                valueChange={(value) => handleChange('quantityMin', value)}
                placeholder="1"
              />
            </div>
            <div className={styles.col}>
              <InputBox
                label="Maximum Quantity"
                type="number"
                step="1"
                value={formData.quantityMax}
                valueChange={(value) => handleChange('quantityMax', value)}
                placeholder="10"
              />
            </div>
          </div>
          {errors.quantityRange && <span className={styles.error}>{errors.quantityRange}</span>}
        </div>
      )
    }

    return null
  }

  if (loading) return <Loading />

  return (
    <div className={styles.modifierForm}>
      <PageHead
        parent="Modifiers"
        parentUrl={`/pricing/services/${serviceId}/methods/${methodId}/modifiers`}
        current="Edit Modifier"
      >
        <Head
          title={`Edit Modifier${modifier ? ` - ${modifier.name}` : ''}`}
          back={`/pricing/services/${serviceId}/methods/${methodId}/modifiers`}
        />
      </PageHead>
      <Container>
        {/* Context Header */}
        {pricingMethod && service && (
          <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {service.emoji && <span style={{ fontSize: '1.5rem' }}>{service.emoji}</span>}
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  {service.name} - {pricingMethod.name}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                  Editing modifier: {formData.name || 'Untitled'}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Basic Information */}
            <div className={styles.section}>
              <h3>Basic Information</h3>

              <InputBox
                label="Modifier Name"
                type="text"
                value={formData.name}
                valueChange={(value) => handleChange('name', value)}
                placeholder="e.g., No Fire Cape Penalty"
                error={errors.name}
                required
              />

              <div className={styles.row}>
                <div className={styles.col}>
                  <label className={styles.label}>
                    Modifier Type <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.select}
                    value={formData.modifierType}
                    onChange={(e) => handleChange('modifierType', e.target.value)}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount ($)</option>
                  </select>
                  <small className={styles.help}>
                    {formData.modifierType === 'PERCENTAGE'
                      ? 'Percentage increase/decrease (e.g., +20% or -10%)'
                      : 'Fixed dollar amount (e.g., +$50 or -$10)'}
                  </small>
                </div>

                <div className={styles.col}>
                  <InputBox
                    label={formData.modifierType === 'PERCENTAGE' ? 'Percentage Value' : 'Dollar Amount'}
                    type="number"
                    step={formData.modifierType === 'PERCENTAGE' ? '0.1' : '0.01'}
                    value={formData.value}
                    valueChange={(value) => handleChange('value', value)}
                    placeholder={formData.modifierType === 'PERCENTAGE' ? '20' : '50.00'}
                    error={errors.value}
                    required
                  />
                  <small className={styles.help}>
                    {formData.modifierType === 'PERCENTAGE'
                      ? 'Enter positive for increase, negative for decrease'
                      : 'Enter positive to add, negative to subtract'}
                  </small>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.col}>
                  <InputBox
                    label="Priority"
                    type="number"
                    step="1"
                    value={formData.priority}
                    valueChange={(value) => handleChange('priority', value)}
                    placeholder="0"
                  />
                  <small className={styles.help}>
                    Lower numbers = higher priority (applied first)
                  </small>
                </div>

                <div className={styles.col}>
                  <label className={styles.label}>Status</label>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      id="active"
                      checked={formData.active}
                      onChange={(e) => handleChange('active', e.target.checked)}
                    />
                    <label htmlFor="active">Active</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Condition Section */}
            <div className={styles.section}>
              <h3>Application Condition</h3>
              <p className={styles.sectionHelp}>
                Define when this modifier should be applied. Leave as "No Condition" to always apply.
              </p>

              <label className={styles.label}>Condition Type</label>
              <select
                className={styles.select}
                value={formData.conditionType}
                onChange={(e) => handleChange('conditionType', e.target.value)}
              >
                {CONDITION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {renderConditionFields()}
            </div>

            {/* Preview */}
            {pricingMethod && (
              <div className={styles.preview}>
                <h4>Preview</h4>
                <div className={styles.previewContent}>
                  <p>
                    <strong>Base Price:</strong> ${Number(pricingMethod.basePrice).toFixed(2)}
                  </p>
                  <p>
                    <strong>Modifier:</strong> {formData.name || 'Untitled'} (
                    {formData.modifierType === 'PERCENTAGE'
                      ? `${formData.value > 0 ? '+' : ''}${formData.value}%`
                      : `${formData.value > 0 ? '+' : ''}$${Math.abs(Number(formData.value)).toFixed(2)}`}
                    )
                  </p>
                  {formData.value && (
                    <p>
                      <strong>Example Final Price:</strong> $
                      {(() => {
                        const base = Number(pricingMethod.basePrice)
                        const val = Number(formData.value)
                        if (formData.modifierType === 'PERCENTAGE') {
                          return (base * (1 + val / 100)).toFixed(2)
                        }
                        return (base + val).toFixed(2)
                      })()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.actions}>
              <Button
                type="button"
                onClick={() => router.push(`/pricing/services/${serviceId}/methods/${methodId}/modifiers`)}
                secondary
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" primary disabled={submitting}>
                {submitting ? 'Updating...' : 'Update Modifier'}
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </div>
  )
}

export default EditModifier
