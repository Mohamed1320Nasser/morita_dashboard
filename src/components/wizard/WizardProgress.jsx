import React from 'react'
import styles from './WizardProgress.module.scss'

const WizardProgress = ({ steps, currentStep }) => {
  return (
    <div className={styles.container}>
      <div className={styles.progressBar}>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = stepNumber < currentStep
          const isPending = stepNumber > currentStep

          return (
            <div key={stepNumber} className={styles.step}>
              <div className={`${styles.stepIndicator} ${isCompleted ? styles.completed : ''} ${isActive ? styles.active : ''} ${isPending ? styles.pending : ''}`}>
                {isCompleted ? '✓' : stepNumber}
              </div>
              <div className={styles.stepLabel}>
                <div className={styles.stepName}>{step.name}</div>
                <div className={styles.stepDescription}>{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WizardProgress
