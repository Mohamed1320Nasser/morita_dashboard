import React from 'react'
import { IoSave, IoInformationCircle } from 'react-icons/io5'
import styles from './PayoutConfiguration.module.scss'

const PayoutForm = ({
  config,
  onChange,
  onSave,
  saving,
  getTotalPercentage
}) => {
  const total = getTotalPercentage()
  const isValid = total === 100

  const handleChange = (field, value) => {
    const numValue = parseFloat(value) || 0
    if (numValue < 0) return
    if (numValue > 100) return
    onChange(field, numValue)
  }

  const formatPreview = (percentage) => {
    const amount = (100 * percentage / 100).toFixed(2)
    return `$${amount}`
  }

  return (
    <div className={styles.payoutForm}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="worker-percentage">Worker Percentage</label>
            <div className={styles.tooltip}>
              <IoInformationCircle />
              <span className={styles.tooltipText}>Percentage paid directly to the worker completing the order</span>
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <input
              id="worker-percentage"
              type="number"
              min="0"
              max="100"
              step="1"
              value={config.workerPercentage}
              onChange={(e) => handleChange('workerPercentage', e.target.value)}
              className={styles.percentInput}
            />
            <span className={styles.percentSymbol}>%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${styles.worker}`}
              style={{ width: `${config.workerPercentage}%` }}
            />
          </div>
          <div className={styles.preview}>
            {formatPreview(config.workerPercentage)} per $100 order
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="support-percentage">Support Percentage</label>
            <div className={styles.tooltip}>
              <IoInformationCircle />
              <span className={styles.tooltipText}>Percentage paid to support team handling customer service</span>
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <input
              id="support-percentage"
              type="number"
              min="0"
              max="100"
              step="1"
              value={config.supportPercentage}
              onChange={(e) => handleChange('supportPercentage', e.target.value)}
              className={styles.percentInput}
            />
            <span className={styles.percentSymbol}>%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${styles.support}`}
              style={{ width: `${config.supportPercentage}%` }}
            />
          </div>
          <div className={styles.preview}>
            {formatPreview(config.supportPercentage)} per $100 order
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelRow}>
            <label htmlFor="system-percentage">System Percentage</label>
            <div className={styles.tooltip}>
              <IoInformationCircle />
              <span className={styles.tooltipText}>Percentage retained by the system for operational costs and profit</span>
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <input
              id="system-percentage"
              type="number"
              min="0"
              max="100"
              step="1"
              value={config.systemPercentage}
              onChange={(e) => handleChange('systemPercentage', e.target.value)}
              className={styles.percentInput}
            />
            <span className={styles.percentSymbol}>%</span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={`${styles.progressFill} ${styles.system}`}
              style={{ width: `${config.systemPercentage}%` }}
            />
          </div>
          <div className={styles.preview}>
            {formatPreview(config.systemPercentage)} per $100 order
          </div>
        </div>
      </div>

      <div className={`${styles.totalSummary} ${isValid ? styles.valid : styles.invalid}`}>
        <div className={styles.summaryContent}>
          <span className={styles.summaryLabel}>Total Percentage</span>
          <span className={styles.summaryValue}>{total.toFixed(1)}%</span>
        </div>
        {!isValid && (
          <div className={styles.validationMessage}>
            Total must equal 100% to save configuration
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <button
          className={`btn btn-primary ${styles.saveButton}`}
          onClick={onSave}
          disabled={saving || !isValid}
        >
          <IoSave />
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
}

export default PayoutForm
