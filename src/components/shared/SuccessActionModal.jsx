import React from 'react'
import { Modal } from 'react-bootstrap'
import { useRouter } from 'next/router'
import Button from '@/components/atoms/buttons/button'
import styles from './SuccessActionModal.module.scss'

const SuccessActionModal = ({
  show,
  onHide,
  title = 'Success!',
  message,
  itemType, // 'category' or 'service'
  itemId,
  itemName,
  categoryId // for services
}) => {
  const router = useRouter()

  const handleQuickCreate = () => {
    if (itemType === 'category') {
      router.push(`/quick-create?categoryId=${itemId}`)
    } else if (itemType === 'service') {
      router.push(`/pricing/services/${itemId}/methods/new`)
    }
    onHide()
  }

  const handleBatchAdd = () => {
    if (itemType === 'category') {
      // Navigate to batch service creator (Phase 2A implemented)
      router.push(`/categories/${itemId}/add-services`)
    } else if (itemType === 'service' && categoryId) {
      router.push(`/services/new?categoryId=${categoryId}`)
    }
    onHide()
  }

  const handleBatchPricing = () => {
    console.log('[SuccessActionModal] handleBatchPricing:', { itemType, itemId })
    if (itemType === 'service' && itemId) {
      onHide()
      router.push(`/services/${itemId}/add-pricing-methods`)
    } else {
      console.error('[SuccessActionModal] Missing itemId or wrong itemType:', { itemType, itemId })
      onHide()
    }
  }

  const handleGoToList = () => {
    if (itemType === 'category') {
      router.push('/categories')
    } else if (itemType === 'service') {
      router.push('/services')
    }
    onHide()
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      className={styles.successModal}
    >
      <Modal.Body className={styles.modalBody}>
        <div className={styles.successIcon}>
          <div className={styles.iconCircle}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#10B981" fillOpacity="0.1"/>
              <path d="M20 24L22 26L28 20" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>
          {message || `${itemType === 'category' ? 'Category' : 'Service'} "${itemName}" created successfully!`}
        </p>

        <div className={styles.actions}>
          <p className={styles.actionsTitle}>What would you like to do next?</p>

          {itemType === 'category' && (
            <>
              <button className={styles.actionCard} onClick={handleQuickCreate}>
                <div className={styles.actionIcon}>⚡</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>Quick Create Service</div>
                  <div className={styles.actionDescription}>Add one complete service with pricing</div>
                </div>
              </button>

              <button className={styles.actionCard} onClick={handleBatchAdd}>
                <div className={styles.actionIcon}>📦</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>Add Multiple Services</div>
                  <div className={styles.actionDescription}>Bulk add services with pricing and modifiers</div>
                </div>
              </button>

              <button className={styles.actionCard} onClick={handleGoToList}>
                <div className={styles.actionIcon}>📋</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>Go to Categories List</div>
                  <div className={styles.actionDescription}>I'll add services later</div>
                </div>
              </button>
            </>
          )}

          {itemType === 'service' && (
            <>
              <button className={styles.actionCard} onClick={handleQuickCreate}>
                <div className={styles.actionIcon}>💰</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>Add Pricing Method</div>
                  <div className={styles.actionDescription}>Add one pricing option</div>
                </div>
              </button>

              <button className={styles.actionCard} onClick={handleBatchPricing}>
                <div className={styles.actionIcon}>📦</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>Add Multiple Pricing Methods</div>
                  <div className={styles.actionDescription}>Bulk add pricing options to this service</div>
                </div>
              </button>

              <button className={styles.actionCard} onClick={handleBatchAdd}>
                <div className={styles.actionIcon}>➕</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>Add Another Service</div>
                  <div className={styles.actionDescription}>Create another service in this category</div>
                </div>
              </button>

              <button className={styles.actionCard} onClick={handleGoToList}>
                <div className={styles.actionIcon}>📋</div>
                <div className={styles.actionContent}>
                  <div className={styles.actionLabel}>Go to Services List</div>
                  <div className={styles.actionDescription}>View all services</div>
                </div>
              </button>
            </>
          )}
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default SuccessActionModal
