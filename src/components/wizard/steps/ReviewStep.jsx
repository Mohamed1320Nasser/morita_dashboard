import React from 'react'
import styles from './Step.module.scss'

const ReviewStep = ({ wizardData, categories }) => {
  const { category, service, methods, modifiers } = wizardData

  const categoryInfo = category?.mode === 'existing'
    ? categories.find(c => c.id === category.existingId)
    : { name: category?.name, emoji: category?.emoji }

  const totalModifiers = Object.values(modifiers || {}).reduce((sum, mods) => sum + mods.length, 0)

  // Helper to safely display emoji (handles both string and object formats)
  const displayEmoji = (emoji) => {
    if (!emoji) return ''
    if (typeof emoji === 'string') return emoji
    if (emoji.unicode) return emoji.unicode
    if (emoji.native) return emoji.native
    return ''
  }

  return (
    <div className={styles.stepContainer}>
      <h2 className={styles.stepTitle}>Review & Create</h2>
      <p className={styles.stepDescription}>
        Review your configuration before creating. Everything can be edited later.
      </p>

      <div className={styles.reviewSummary}>
        {/* Category */}
        <div className={styles.reviewSection}>
          <div className={styles.reviewHeading}>
            {displayEmoji(categoryInfo?.emoji)} Category
            {category?.mode === 'new' && <span className={styles.reviewBadge}>NEW</span>}
          </div>
          <div className={styles.reviewItem}>
            <strong>{categoryInfo?.name}</strong>
            {category?.description && (
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                {category.description}
              </div>
            )}
          </div>
        </div>

        {/* Service */}
        <div className={styles.reviewSection}>
          <div className={styles.reviewHeading}>
            {displayEmoji(service?.emoji)} Service <span className={styles.reviewBadge}>NEW</span>
          </div>
          <div className={styles.reviewItem}>
            <strong>{service?.name}</strong>
            {service?.description && (
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                {service.description}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              Priority: {service?.displayOrder || 0} | {service?.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Pricing Methods */}
        <div className={styles.reviewSection}>
          <div className={styles.reviewHeading}>
            💰 Pricing Methods
            <span className={styles.reviewBadge}>{methods?.length || 0}</span>
          </div>
          {methods && methods.length > 0 ? (
            methods.map((method, index) => (
              <div key={index} className={styles.reviewItem}>
                <strong>{method.name}</strong>
                <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                  {method.pricingUnit === 'FIXED' && `Fixed price: $${method.basePrice}`}
                  {method.pricingUnit === 'PER_LEVEL' && `$${method.basePrice} per level`}
                  {method.pricingUnit === 'PER_KILL' && `$${method.basePrice} per kill`}
                  {method.pricingUnit === 'PER_ITEM' && `$${method.basePrice} per item`}
                  {method.pricingUnit === 'PER_HOUR' && `$${method.basePrice} per hour`}
                  {method.startLevel && method.endLevel && ` (Levels ${method.startLevel}-${method.endLevel})`}
                </div>
                {modifiers && modifiers[index] && modifiers[index].length > 0 && (
                  <div style={{ fontSize: '12px', color: '#4F46E5', marginTop: '6px' }}>
                    ↳ {modifiers[index].length} modifier{modifiers[index].length !== 1 ? 's' : ''}:
                    {modifiers[index].map((mod, mi) => (
                      <span key={mi} style={{ marginLeft: '8px' }}>
                        {mod.name} ({mod.modifierType === 'PERCENTAGE' ? `${mod.value > 0 ? '+' : ''}${mod.value}%` : `${mod.value > 0 ? '+' : ''}$${Math.abs(mod.value)}`})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.reviewItem} style={{ color: '#999' }}>
              No pricing methods added
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className={styles.reviewSection} style={{ borderTop: '2px solid #e0e0e0', paddingTop: '16px' }}>
          <div className={styles.reviewHeading}>📊 Summary</div>
          <div className={styles.reviewItem}>
            <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
              <div>
                <strong>{category?.mode === 'new' ? '1' : '0'}</strong> Category{category?.mode === 'new' ? ' (new)' : ''}
              </div>
              <div>
                <strong>1</strong> Service (new)
              </div>
              <div>
                <strong>{methods?.length || 0}</strong> Pricing Method{methods?.length !== 1 ? 's' : ''}
              </div>
              <div>
                <strong>{totalModifiers}</strong> Modifier{totalModifiers !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', fontSize: '14px', color: '#166534' }}>
        <strong>✓ Ready to create!</strong> Click "Create Everything" to save all items.
      </div>
    </div>
  )
}

export default ReviewStep
