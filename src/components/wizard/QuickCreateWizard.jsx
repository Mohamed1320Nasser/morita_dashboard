import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import WizardProgress from './WizardProgress'
import CategoryStep from './steps/CategoryStep'
import ServiceStep from './steps/ServiceStep'
import PricingMethodsStep from './steps/PricingMethodsStep'
import ModifiersStep from './steps/ModifiersStep'
import ReviewStep from './steps/ReviewStep'
import Button from '@/components/atoms/buttons/button'
import { valueForSubmit } from '@/utils/emoji'
import styles from './QuickCreateWizard.module.scss'

const STEPS = [
  { name: 'Category', description: 'Select or create' },
  { name: 'Service', description: 'Service details' },
  { name: 'Pricing', description: 'Add pricing methods' },
  { name: 'Modifiers', description: 'Optional modifiers' },
  { name: 'Review', description: 'Review & create' },
]

const QuickCreateWizard = ({ categories, onSubmit, submitting, prefilled }) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState({
    category: { mode: 'existing', existingId: categories[0]?.id || '' },
    service: {},
    methods: [],
    modifiers: {},
  })

  // Fix Bug #3 & #6: Dynamically filter steps based on prefilled data
  const activeSteps = prefilled?.category
    ? STEPS.filter(step => step.name !== 'Category')
    : STEPS

  const minStep = prefilled?.category ? 2 : 1

  // Load from localStorage on mount or use prefilled data
  useEffect(() => {
    if (prefilled && prefilled.category) {
      // Use prefilled data and skip to next step
      setWizardData(prev => ({
        ...prev,
        category: prefilled.category
      }))
      setCurrentStep(2) // Skip category step
    } else {
      const saved = localStorage.getItem('quickCreateWizard')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setWizardData(parsed)
        } catch (e) {
          console.error('Failed to parse saved wizard data:', e)
        }
      }
    }
  }, [prefilled])

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('quickCreateWizard', JSON.stringify(wizardData))
  }, [wizardData])

  const updateWizardData = (step, data) => {
    setWizardData((prev) => ({ ...prev, [step]: data }))
  }

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Fix Bonus Bug: Prevent back navigation to category step when prefilled
  const prevStep = () => {
    if (currentStep > minStep) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Category
        if (wizardData.category.mode === 'existing') {
          return !!wizardData.category.existingId
        } else {
          return !!wizardData.category.name
        }
      case 2: // Service
        return !!wizardData.service.name
      case 3: // Methods
        return wizardData.methods && wizardData.methods.length > 0 && wizardData.methods.every(m => m.name && m.basePrice >= 0)
      case 4: // Modifiers (optional)
        return true
      case 5: // Review
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    // Prepare payload
    const payload = {
      category: wizardData.category.mode === 'existing'
        ? { mode: 'existing', existingId: wizardData.category.existingId }
        : {
            mode: 'new',
            name: wizardData.category.name,
            emoji: valueForSubmit(wizardData.category.emoji),
            description: wizardData.category.description,
            active: wizardData.category.active,
          },
      service: {
        name: wizardData.service.name,
        emoji: valueForSubmit(wizardData.service.emoji),
        description: wizardData.service.description,
        displayOrder: wizardData.service.displayOrder,
        active: wizardData.service.active,
      },
      methods: wizardData.methods.map((method, index) => ({
        name: method.name,
        pricingUnit: method.pricingUnit,
        basePrice: parseFloat(method.basePrice),
        description: method.description,
        startLevel: method.startLevel,
        endLevel: method.endLevel,
        displayOrder: method.displayOrder,
        active: method.active,
        modifiers: (wizardData.modifiers[index] || []).map(mod => ({
          name: mod.name,
          modifierType: mod.modifierType,
          value: parseFloat(mod.value),
          displayType: mod.displayType,
          priority: mod.priority,
          active: mod.active,
        })),
      })),
    }

    const result = await onSubmit(payload)
    if (result && result.success) {
      // Clear localStorage on success
      localStorage.removeItem('quickCreateWizard')
      // Redirect handled by parent
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CategoryStep
            data={wizardData.category}
            categories={categories}
            onChange={(data) => updateWizardData('category', data)}
          />
        )
      case 2:
        return (
          <ServiceStep
            data={wizardData.service}
            onChange={(data) => updateWizardData('service', data)}
          />
        )
      case 3:
        return (
          <PricingMethodsStep
            data={wizardData.methods}
            onChange={(data) => updateWizardData('methods', data)}
          />
        )
      case 4:
        return (
          <ModifiersStep
            methods={wizardData.methods}
            data={wizardData.modifiers}
            onChange={(data) => updateWizardData('modifiers', data)}
          />
        )
      case 5:
        return (
          <ReviewStep
            wizardData={wizardData}
            categories={categories}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={styles.wizardContainer}>
      {/* Fix Bug #3: Show filtered steps in progress bar */}
      <WizardProgress steps={activeSteps} currentStep={currentStep} />

      <div className={styles.stepContent}>{renderStep()}</div>

      <div className={styles.navigationButtons}>
        <div>
          {/* Fix Bug #6: Only show back button if not at minimum step */}
          {currentStep > minStep && (
            <Button onClick={prevStep} secondary disabled={submitting}>
              ← Back
            </Button>
          )}
        </div>
        <div className={styles.rightButtons}>
          <Button onClick={() => router.push('/services')} secondary disabled={submitting}>
            Cancel
          </Button>
          {currentStep < STEPS.length ? (
            <Button onClick={nextStep} primary disabled={!canProceed() || submitting}>
              Next Step →
            </Button>
          ) : (
            <Button onClick={handleSubmit} primary disabled={!canProceed() || submitting}>
              {submitting ? 'Creating...' : 'Create Everything ✓'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuickCreateWizard
