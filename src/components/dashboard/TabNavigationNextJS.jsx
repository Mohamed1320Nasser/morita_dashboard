import React from 'react'
import PropTypes from 'prop-types'
import styles from './TabNavigation.module.scss'

/**
 * TabNavigation - Tab-based navigation (Next.js version)
 * Uses state management instead of React Router
 */
const TabNavigation = ({ tabs = [], activeTab, onTabChange }) => {
  const handleTabClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId)
    }
  }

  const handleKeyDown = (e, tabId) => {
    // Keyboard navigation
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleTabClick(tabId)
    }

    // Arrow key navigation
    const currentIndex = tabs.findIndex(t => t.id === activeTab)

    if (e.key === 'ArrowRight') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % tabs.length
      handleTabClick(tabs[nextIndex].id)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length
      handleTabClick(tabs[prevIndex].id)
    }
  }

  return (
    <div className={styles.tabNavigation}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const tabClasses = [
            styles.tab,
            isActive ? styles['tab--active'] : ''
          ].filter(Boolean).join(' ')

          return (
            <button
              key={tab.id}
              className={tabClasses}
              onClick={() => handleTabClick(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
            >
              {tab.icon && <span className={styles.icon}>{tab.icon}</span>}
              <span className={styles.label}>{tab.label}</span>
              {tab.badge && (
                <span className={styles.badge}>{tab.badge}</span>
              )}
            </button>
          )
        })}
      </div>
      <div className={styles.indicator} />
    </div>
  )
}

TabNavigation.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired
}

export default TabNavigation
