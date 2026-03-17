import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styles from './KPISection.module.scss'

/**
 * KPISection - Collapsible section container for KPI content
 *
 * @example
 * <KPISection
 *   title="Worker Performance"
 *   icon="👷"
 *   description="Track worker efficiency metrics"
 *   defaultExpanded={true}
 *   actions={[
 *     { label: 'Export CSV', onClick: handleExport },
 *     { label: 'Filter', onClick: openFilters }
 *   ]}
 * >
 *   <YourContentHere />
 * </KPISection>
 */
const KPISection = ({
  title,
  icon = null,
  description = null,
  children,
  defaultExpanded = true,
  collapsible = true,
  actions = [],
  headerRight = null,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded)
    }
  }

  const sectionClasses = [
    styles.kpiSection,
    className
  ].filter(Boolean).join(' ')

  const headerClasses = [
    styles.header,
    collapsible ? styles['header--collapsible'] : ''
  ].join(' ')

  return (
    <div className={sectionClasses}>
      <div className={headerClasses} onClick={toggleExpanded}>
        <div className={styles.headerLeft}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>{title}</h2>
            {description && (
              <p className={styles.description}>{description}</p>
            )}
          </div>
        </div>

        <div className={styles.headerRight}>
          {headerRight}

          {actions.length > 0 && (
            <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={styles.actionButton}
                  onClick={action.onClick}
                  title={action.label}
                >
                  {action.icon && <span>{action.icon}</span>}
                  <span className={styles.actionLabel}>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          {collapsible && (
            <button
              className={styles.collapseButton}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
            >
              <span className={isExpanded ? styles.iconExpanded : styles.iconCollapsed}>
                {isExpanded ? '▼' : '▶'}
              </span>
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className={styles.content}>
          {children}
        </div>
      )}
    </div>
  )
}

KPISection.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  description: PropTypes.string,
  children: PropTypes.node.isRequired,
  defaultExpanded: PropTypes.bool,
  collapsible: PropTypes.bool,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired
    })
  ),
  headerRight: PropTypes.node,
  className: PropTypes.string
}

export default KPISection
