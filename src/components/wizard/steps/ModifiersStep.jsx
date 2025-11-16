import React, { useState, useEffect } from 'react'
import InputBox from '@/components/molecules/inputBox/inputBox'
import styles from './Step.module.scss'

const MODIFIER_TYPES = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed Amount' },
]

const DISPLAY_TYPES = [
  { value: 'NORMAL', label: 'Normal', color: '#666' },
  { value: 'UPCHARGE', label: 'Upcharge (Red)', color: '#EF4444' },
  { value: 'NOTE', label: 'Note (Green)', color: '#10B981' },
  { value: 'WARNING', label: 'Warning (Yellow)', color: '#F59E0B' },
]

const ModifiersStep = ({ methods, data, onChange }) => {
  const [skip, setSkip] = useState(false)
  const [expandedMethod, setExpandedMethod] = useState(null)
  const [modifiers, setModifiers] = useState(data || {})

  useEffect(() => {
    if (!skip) {
      onChange(modifiers)
    } else {
      onChange({})
    }
  }, [modifiers, skip])

  const addModifier = (methodIndex) => {
    const methodModifiers = modifiers[methodIndex] || []
    setModifiers({
      ...modifiers,
      [methodIndex]: [...methodModifiers, {
        name: '',
        modifierType: 'PERCENTAGE',
        value: 0,
        displayType: 'NORMAL',
        priority: methodModifiers.length,
        active: true,
      }],
    })
  }

  const removeModifier = (methodIndex, modifierIndex) => {
    const methodModifiers = modifiers[methodIndex] || []
    setModifiers({
      ...modifiers,
      [methodIndex]: methodModifiers.filter((_, i) => i !== modifierIndex),
    })
  }

  const updateModifier = (methodIndex, modifierIndex, field, value) => {
    const methodModifiers = [...(modifiers[methodIndex] || [])]
    methodModifiers[modifierIndex] = { ...methodModifiers[modifierIndex], [field]: value }
    setModifiers({
      ...modifiers,
      [methodIndex]: methodModifiers,
    })
  }

  const toggleExpanded = (methodIndex) => {
    setExpandedMethod(expandedMethod === methodIndex ? null : methodIndex)
  }

  if (skip) {
    return (
      <div className={styles.stepContainer}>
        <h2 className={styles.stepTitle}>Pricing Modifiers (Optional)</h2>
        <p className={styles.stepDescription}>
          Modifiers are optional. You can add them later after creating the service.
        </p>

        <div className={styles.skipCheckbox}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={skip}
              onChange={(e) => setSkip(e.target.checked)}
            />
            <span><strong>Skip modifiers for now</strong> (you can add them later)</span>
          </label>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Pricing Modifiers (Optional)</h2>
      <p className={styles.stepDescription}>
        Add optional modifiers to adjust prices dynamically (e.g., rush orders, discounts)
      </p>

      <div style={{ marginBottom: '20px' }}>
        {methods.map((method, methodIndex) => {
          const methodModifiers = modifiers[methodIndex] || []
          const isExpanded = expandedMethod === methodIndex

          return (
            <div key={methodIndex} className={styles.collapsibleSection}>
              <div
                className={styles.collapsibleHeader}
                onClick={() => toggleExpanded(methodIndex)}
              >
                <div className={styles.collapsibleTitle}>
                  {method.name || `Method ${methodIndex + 1}`}
                  {methodModifiers.length > 0 && (
                    <span className={styles.reviewBadge}>{methodModifiers.length} modifier{methodModifiers.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                <span className={`${styles.collapsibleIcon} ${isExpanded ? styles.expanded : ''}`}>
                  ▼
                </span>
              </div>

              {isExpanded && (
                <div className={styles.collapsibleContent}>
                  {methodModifiers.length === 0 ? (
                    <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>
                      No modifiers added yet for this method
                    </p>
                  ) : (
                    <div style={{ marginBottom: '16px' }}>
                      {methodModifiers.map((modifier, modifierIndex) => (
                        <div key={modifierIndex} className={styles.methodCard} style={{ marginBottom: '12px' }}>
                          <div className={styles.methodHeader}>
                            <div className={styles.methodTitle}>Modifier {modifierIndex + 1}</div>
                            <button
                              type="button"
                              onClick={() => removeModifier(methodIndex, modifierIndex)}
                              className={styles.removeButton}
                            >
                              Remove
                            </button>
                          </div>

                          <div className={styles.formFields}>
                            <div className={styles.row}>
                              <InputBox
                                label="Modifier Name *"
                                placeholder="e.g., Rush Order"
                                value={modifier.name}
                                valueChange={(v) => updateModifier(methodIndex, modifierIndex, 'name', v)}
                              />
                              <div className={styles.formGroup}>
                                <label>Type *</label>
                                <select
                                  value={modifier.modifierType}
                                  onChange={(e) => updateModifier(methodIndex, modifierIndex, 'modifierType', e.target.value)}
                                  className={styles.select}
                                >
                                  {MODIFIER_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className={styles.row}>
                              <InputBox
                                label={`Value * ${modifier.modifierType === 'PERCENTAGE' ? '(%)' : '($)'}`}
                                placeholder="0"
                                value={modifier.value}
                                valueChange={(v) => updateModifier(methodIndex, modifierIndex, 'value', parseFloat(v) || 0)}
                                type="number"
                                step={modifier.modifierType === 'PERCENTAGE' ? '1' : '0.01'}
                              />
                              <div className={styles.formGroup}>
                                <label>Display Type</label>
                                <select
                                  value={modifier.displayType}
                                  onChange={(e) => updateModifier(methodIndex, modifierIndex, 'displayType', e.target.value)}
                                  className={styles.select}
                                >
                                  {DISPLAY_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                      {type.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className={styles.row}>
                              <InputBox
                                label="Priority"
                                placeholder="0"
                                value={modifier.priority}
                                valueChange={(v) => updateModifier(methodIndex, modifierIndex, 'priority', parseInt(v) || 0)}
                                type="number"
                              />
                              <div className={styles.formGroup}>
                                <label className={styles.checkboxLabel}>
                                  <input
                                    type="checkbox"
                                    checked={modifier.active}
                                    onChange={(e) => updateModifier(methodIndex, modifierIndex, 'active', e.target.checked)}
                                  />
                                  <span>Active</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => addModifier(methodIndex)}
                    className={`${styles.addButton} ${styles.secondary}`}
                  >
                    + Add Modifier to {method.name || `Method ${methodIndex + 1}`}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.skipCheckbox}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={skip}
            onChange={(e) => setSkip(e.target.checked)}
          />
          <span><strong>Skip modifiers for now</strong> (you can add them later)</span>
        </label>
      </div>
    </div>
  )
}

export default ModifiersStep
