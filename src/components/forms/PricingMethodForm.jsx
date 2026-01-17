import React, { useEffect, useState, useRef } from 'react'
import PageTitle from '@/components/atoms/labels/pageTitle'
import InputBox from '@/components/molecules/inputBox/inputBox'
import Button from '@/components/atoms/buttons/button'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import grid from './forms.module.scss'

const PRICING_UNITS = [
  { value: 'FIXED', label: 'Fixed Price' },
  { value: 'PER_LEVEL', label: 'Per Level' },
  { value: 'PER_KILL', label: 'Per Kill' },
  { value: 'PER_ITEM', label: 'Per Item' },
  { value: 'PER_HOUR', label: 'Per Hour' },
]

const PricingMethodForm = ({
  title,
  initial = {},
  submitting = false,
  onCancel,
  onSubmit,
  serviceId: serviceIdProp,
  service = null
}) => {
  const [form, setForm] = useState({
    name: initial.name || '',
    groupName: initial.groupName || '',
    description: initial.description || '',
    basePrice: initial.basePrice || '',
    pricingUnit: initial.pricingUnit || initial.unit || 'FIXED',
    startLevel: initial.startLevel || '',
    endLevel: initial.endLevel || '',
    displayOrder: initial.displayOrder || 0,
    active: initial.active ?? true,
    serviceId: initial.serviceId || serviceIdProp || '',
    shortcuts: initial.shortcuts ? (Array.isArray(initial.shortcuts) ? initial.shortcuts.join(', ') : initial.shortcuts) : ''
  })

  const lastInitialRef = useRef(JSON.stringify({
    name: initial.name,
    groupName: initial.groupName,
    description: initial.description,
    basePrice: initial.basePrice,
    pricingUnit: initial.pricingUnit || initial.unit,
    startLevel: initial.startLevel,
    endLevel: initial.endLevel,
    displayOrder: initial.displayOrder,
    active: initial.active,
    serviceId: initial.serviceId || serviceIdProp,
    id: initial.id,
    shortcuts: initial.shortcuts,
  }))

  // Sync when initial prop changes (edit mode)
  useEffect(() => {
    const hasInitialData = initial.name || initial.id || (initial.basePrice !== undefined && initial.basePrice !== null && initial.basePrice !== '')

    // Don't sync if we're in create mode (no initial data and no serviceId)
    if (!hasInitialData && !serviceIdProp) {
      return
    }

    const currentKey = JSON.stringify({
      name: initial.name,
      groupName: initial.groupName,
      description: initial.description,
      basePrice: initial.basePrice,
      pricingUnit: initial.pricingUnit || initial.unit,
      startLevel: initial.startLevel,
      endLevel: initial.endLevel,
      displayOrder: initial.displayOrder,
      active: initial.active,
      serviceId: initial.serviceId || serviceIdProp,
      id: initial.id,
      shortcuts: initial.shortcuts,
    })

    // Only sync if the initial data actually changed
    if (currentKey !== lastInitialRef.current) {
      console.log('[PricingMethodForm] Syncing form with initial data:', initial)
      lastInitialRef.current = currentKey

      // Convert basePrice to string for input field (handles number or Decimal type)
      const basePriceStr = initial.basePrice !== undefined && initial.basePrice !== null && initial.basePrice !== ''
        ? String(initial.basePrice)
        : ''

      setForm({
        name: initial.name || '',
        groupName: initial.groupName || '',
        description: initial.description || '',
        basePrice: basePriceStr,
        pricingUnit: initial.pricingUnit || initial.unit || 'FIXED',
        startLevel: initial.startLevel || '',
        endLevel: initial.endLevel || '',
        displayOrder: initial.displayOrder || 0,
        active: initial.active ?? true,
        serviceId: initial.serviceId || serviceIdProp || '',
        shortcuts: initial.shortcuts ? (Array.isArray(initial.shortcuts) ? initial.shortcuts.join(', ') : initial.shortcuts) : ''
      })

      console.log('[PricingMethodForm] Form state updated:', {
        name: initial.name || '',
        basePrice: basePriceStr,
        pricingUnit: initial.pricingUnit || initial.unit || 'FIXED',
      })
    }
  }, [initial.name, initial.groupName, initial.description, initial.basePrice, initial.pricingUnit, initial.unit, initial.startLevel, initial.endLevel, initial.displayOrder, initial.active, initial.serviceId, initial.id, initial.shortcuts, serviceIdProp])

  const update = (key) => (value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Backend now accepts numbers directly (with @Transform decorators)
    // basePrice is validated with @IsPositive, so ensure it's a positive number
    const payload = {
      ...form,
      basePrice: parseFloat(form.basePrice) || 0,
      startLevel: form.startLevel ? parseInt(form.startLevel) : null,
      endLevel: form.endLevel ? parseInt(form.endLevel) : null,
      displayOrder: parseInt(form.displayOrder) || 0,
      active: form.active ?? true,
      shortcuts: Array.isArray(form.shortcuts)
        ? form.shortcuts
        : (form.shortcuts || '').split(',').map(s => s.trim()).filter(Boolean)
    }

    // Validate
    if (!payload.name.trim()) {
      alert('Please enter a pricing method name')
      return
    }

    if (!payload.serviceId) {
      alert('Service ID is required')
      return
    }

    if (payload.basePrice <= 0) {
      alert('Base price must be greater than 0')
      return
    }

    // Validate level ranges if provided
    if (payload.startLevel && payload.startLevel < 1) {
      alert('Start level must be at least 1')
      return
    }

    if (payload.endLevel && payload.endLevel < 1) {
      alert('End level must be at least 1')
      return
    }

    if (payload.startLevel && payload.endLevel && payload.startLevel >= payload.endLevel) {
      alert('Start level must be less than end level')
      return
    }

    onSubmit(payload)
  }

  return (
    <div className={grid.wrap}>
      {title && <PageTitle title={title} />}
      <form onSubmit={handleSubmit}>
        <div className={grid.grid}>
          {/* Row 1 */}
          <InputBox
            label="Pricing Method Name *"
            value={form.name}
            valueChange={update('name')}
            placeholder="e.g., Standard, Express, Perfect Olm (Trio)"
            type="text"
          />

          <InputBox
            label="Shortcuts (Optional)"
            value={form.shortcuts}
            valueChange={update('shortcuts')}
            placeholder="e.g., cox, raids1"
            type="text"
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
            value={form.groupName}
            valueChange={update('groupName')}
            placeholder="e.g., ARMA - Armadyl, BANDOS - Bandos"
            type="text"
          />

          {/* Row 2 */}
          <div>
            <label style={{ display: 'block', marginBottom: 6 }}>Pricing Unit *</label>
            <select
              value={form.pricingUnit}
              onChange={(e) => update('pricingUnit')(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #f6f6f6',
                backgroundColor: '#f6f6f6',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            >
              {PRICING_UNITS.map(unit => (
                <option key={unit.value} value={unit.value}>{unit.label}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
              {form.pricingUnit === 'FIXED' && 'Single fixed price (e.g., $150 for Infernal Cape)'}
              {form.pricingUnit === 'PER_LEVEL' && 'Price per level gained (e.g., $0.00007 per XP for Agility)'}
              {form.pricingUnit === 'PER_KILL' && 'Price per boss kill or completion'}
              {form.pricingUnit === 'PER_ITEM' && 'Price per item collected or obtained'}
              {form.pricingUnit === 'PER_HOUR' && 'Hourly rate for time-based services'}
            </div>
          </div>

          <InputBox
            label="Base Price *"
            value={String(form.basePrice)}
            valueChange={(val) => update('basePrice')(val)}
            placeholder={form.pricingUnit === 'FIXED' ? "e.g., 150" : "e.g., 0.00007"}
            type="number"
          />

          {/* Row 3 */}
          <InputBox
            label="Start Level (Optional)"
            value={String(form.startLevel || '')}
            valueChange={(val) => update('startLevel')(val ? parseInt(val) : '')}
            placeholder="e.g., 1, 40, 50"
            type="number"
          />

          <InputBox
            label="End Level (Optional)"
            value={String(form.endLevel || '')}
            valueChange={(val) => update('endLevel')(val ? parseInt(val) : '')}
            placeholder="e.g., 40, 50, 99"
            type="number"
          />

          {/* Row 4 */}
          <InputBox
            label="Priority"
            value={String(form.displayOrder)}
            valueChange={(val) => update('displayOrder')(parseInt(val) || 0)}
            placeholder="0"
            type="number"
          />

          <div></div>

          {/* Row 5: Description spans 2 */}
          <div className={grid.span2}>
            <label style={{ display: 'block', marginBottom: 6 }}>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => update('description')(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid #f6f6f6',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
              placeholder="Optional description"
            />
          </div>

          {/* Row 6: actions */}
          <div className={grid.actionsRow + ' ' + grid.span2}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => update('active')(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span>Active</span>
            </label>
            <div className={grid.actionsRight}>
              <Button type="button" onClick={onCancel} secondary disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" primary disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PricingMethodForm

