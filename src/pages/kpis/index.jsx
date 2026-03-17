import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import TabNavigation from '../../components/dashboard/TabNavigationNextJS'
import OverviewTab from './tabs/OverviewTab'
import CommunityTab from './tabs/CommunityTab'
import SupportTab from './tabs/SupportTab'
import OperationsTab from './tabs/OperationsTab'
import FinancialTab from './tabs/FinancialTab'
import styles from './KPILayout.module.scss'

const KpisPage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')

  // Sync with URL query param
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab)
    }
  }, [router.query.tab])

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'support', label: 'Support', icon: '🎫' },
    { id: 'operations', label: 'Operations', icon: '💼' },
    { id: 'financial', label: 'Financial', icon: '💰' }
  ]

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    // Update URL (optional - makes tabs shareable)
    router.push(`/kpis?tab=${tabId}`, undefined, { shallow: true })
  }

  // Render active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />
      case 'community':
        return <CommunityTab />
      case 'support':
        return <SupportTab />
      case 'operations':
        return <OperationsTab />
      case 'financial':
        return <FinancialTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <div className={styles.kpiLayout}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>📊 KPI Dashboard</h1>
          <p className={styles.subtitle}>
            Monitor key performance indicators across your platform
          </p>
        </div>
      </div>

      {/* Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Content */}
      <div className={styles.content}>
        {renderContent()}
      </div>
    </div>
  )
}

export default KpisPage
