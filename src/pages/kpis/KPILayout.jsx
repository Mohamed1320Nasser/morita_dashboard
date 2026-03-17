import React from 'react'
import { Outlet } from 'react-router-dom'
import { TabNavigation } from '../../components/dashboard'
import styles from './KPILayout.module.scss'

/**
 * KPILayout - Wrapper component for all KPI tabs
 * Provides tab navigation and consistent layout
 */
const KPILayout = () => {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: '📊',
      badge: null
    },
    {
      id: 'community',
      label: 'Community',
      icon: '👥',
      badge: null
    },
    {
      id: 'support',
      label: 'Support',
      icon: '🎫',
      badge: null
    },
    {
      id: 'operations',
      label: 'Operations',
      icon: '💼',
      badge: null
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: '💰',
      badge: null
    }
  ]

  return (
    <div className={styles.kpiLayout}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>📊 KPI Dashboard</h1>
          <p className={styles.subtitle}>
            Monitor key performance indicators across your platform
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation tabs={tabs} basePath="/kpis" />

      {/* Tab Content */}
      <div className={styles.content}>
        <Outlet />
      </div>
    </div>
  )
}

export default KPILayout
