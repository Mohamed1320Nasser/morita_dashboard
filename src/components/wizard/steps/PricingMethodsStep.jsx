import React, { useState, useEffect } from 'react'
import InputBox from '@/components/molecules/inputBox/inputBox'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import styles from './Step.module.scss'

const PRICING_UNITS = [
  { value: 'FIXED', label: 'Fixed Price', description: 'One-time flat price' },
  { value: 'PER_LEVEL', label: 'Per Level', description: 'Price per level gained' },
  { value: 'PER_KILL', label: 'Per Kill', description: 'Price per boss kill' },
  { value: 'PER_ITEM', label: 'Per Item', description: 'Price per item collected' },
  { value: 'PER_HOUR', label: 'Per Hour', description: 'Hourly rate' },
]

const PricingMethodsStep = ({ data, onChange }) => {
  const [methods, setMethods] = useState(data && data.length > 0 ? data : [{
    name: 'Standard',
    groupName: '',
    pricingUnit: 'FIXED',
    basePrice: 0,
    description: '',
    startLevel: null,
    endLevel: null,
    displayOrder: 0,
    active: true,
  }])

  useEffect(() => {
    onChange(methods)
  }, [methods])

  const addMethod = () => {
    setMethods([...methods, {
      name: '',
      groupName: '',
      pricingUnit: 'FIXED',
      basePrice: 0,
      description: '',
      startLevel: null,
      endLevel: null,
      displayOrder: methods.length,
      active: true,
    }])
  }

  const removeMethod = (index) => {
    if (methods.length === 1) {
      alert('You need at least one pricing method')
      return
    }
    setMethods(methods.filter((_, i) => i !== index))
  }

  const updateMethod = (index, field, value) => {
    const updated = [...methods]
    updated[index] = { ...updated[index], [field]: value }
    setMethods(updated)
  }

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Pricing Methods</h2>
      <p className={styles.stepDescription}>
        Add one or more pricing methods for this service. You can add modifiers in the next step.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {methods.map((method, index) => (
          <div key={index} className={styles.methodCard}>
            <div className={styles.methodHeader}>
              <div className={styles.methodTitle}>Method {index + 1}</div>
              {methods.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMethod(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>

            <div className={styles.formFields}>
              <div className={styles.row}>
                <InputBox
                  label="Method Name *"
                  placeholder="e.g., Standard, Express"
                  value={method.name}
                  valueChange={(v) => updateMethod(index, 'name', v)}
                />
                <InputBox
                  label={
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Group Name (Optional)</span>
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
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: '#e0e0e0',
                          color: '#666',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'help',
                          userSelect: 'none'
                        }}>
                          i
                        </span>
                      </OverlayTrigger>
                    </span>
                  }
                  placeholder="e.g., ARMA - Armadyl"
                  value={method.groupName || ''}
                  valueChange={(v) => updateMethod(index, 'groupName', v)}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Pricing Unit *</label>
                  <select
                    value={method.pricingUnit}
                    onChange={(e) => updateMethod(index, 'pricingUnit', e.target.value)}
                    className={styles.select}
                  >
                    {PRICING_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <small style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {PRICING_UNITS.find(u => u.value === method.pricingUnit)?.description}
                  </small>
                </div>
                <div className={styles.formGroup}></div>
              </div>

              <div className={styles.row}>
                <InputBox
                  label="Base Price *"
                  placeholder="0.00"
                  value={method.basePrice}
                  valueChange={(v) => updateMethod(index, 'basePrice', parseFloat(v) || 0)}
                  type="number"
                  step="0.01"
                />
                <InputBox
                  label="Priority"
                  placeholder="0"
                  value={method.displayOrder}
                  valueChange={(v) => updateMethod(index, 'displayOrder', parseInt(v) || 0)}
                  type="number"
                />
              </div>

              {method.pricingUnit === 'PER_LEVEL' && (
                <div className={styles.row}>
                  <InputBox
                    label="Start Level (optional)"
                    placeholder="e.g., 1"
                    value={method.startLevel || ''}
                    valueChange={(v) => updateMethod(index, 'startLevel', v ? parseInt(v) : null)}
                    type="number"
                  />
                  <InputBox
                    label="End Level (optional)"
                    placeholder="e.g., 99"
                    value={method.endLevel || ''}
                    valueChange={(v) => updateMethod(index, 'endLevel', v ? parseInt(v) : null)}
                    type="number"
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Description (optional)</label>
                <textarea
                  rows={2}
                  value={method.description}
                  onChange={(e) => updateMethod(index, 'description', e.target.value)}
                  className={styles.textarea}
                  placeholder="Optional description for this pricing method"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={method.active}
                    onChange={(e) => updateMethod(index, 'active', e.target.checked)}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addMethod}
        className={styles.addButton}
        style={{ marginTop: '16px' }}
      >
        + Add Another Pricing Method
      </button>
    </div>
  )
}

export default PricingMethodsStep
