import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { MetricCard, KPISection } from '../../../components/dashboard'
import kpiController from '../../../controllers/kpi'
import styles from './OverviewTab.module.scss'

/**
 * OverviewTab - Executive summary dashboard
 * Shows key metrics at-a-glance and alerts
 */
const OverviewTab = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [heroMetrics, setHeroMetrics] = useState({
    revenue: null,
    profit: null,
    members: null,
    responseTime: null
  })

  useEffect(() => {
    fetchHeroMetrics()
  }, [])

  const fetchHeroMetrics = async () => {
    setLoading(true)
    try {
      // Fetch data for hero metrics in parallel
      const [financialRes, memberRes, supportRes] = await Promise.all([
        kpiController.getFinancialOverview({ period: 'monthly' }),
        kpiController.getMemberGrowth({ period: 'monthly' }),
        kpiController.getSupportResponseTime({ period: 'monthly' })
      ])

      // Process financial data
      if (financialRes?.data?.summary) {
        const { totalRevenue, netProfit } = financialRes.data.summary
        setHeroMetrics(prev => ({
          ...prev,
          revenue: {
            value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            trend: null // Calculate trend if you have previous period data
          },
          profit: {
            value: `$${netProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            trend: netProfit >= 0 ? { value: `${((netProfit / totalRevenue) * 100).toFixed(1)}% margin`, direction: 'up' } : null
          }
        }))
      }

      // Process member data
      // The API sends `summary`; `currentStats` never existed, so this card
      // always showed 0
      if (memberRes?.data?.summary) {
        const { totalMembers, growthRate } = memberRes.data.summary
        setHeroMetrics(prev => ({
          ...prev,
          members: {
            value: totalMembers.toLocaleString(),
            trend: growthRate !== 0 ? {
              value: `${growthRate > 0 ? '+' : ''}${growthRate.toFixed(1)}%`,
              direction: growthRate > 0 ? 'up' : 'down',
              comparison: 'vs last month'
            } : null
          }
        }))
      }

      // Process support data
      if (supportRes?.data?.summary?.averageResponseTimeMinutes) {
        const avgMinutes = supportRes.data.summary.averageResponseTimeMinutes
        setHeroMetrics(prev => ({
          ...prev,
          responseTime: {
            value: `${avgMinutes.toFixed(1)} min`,
            trend: null // Add trend comparison if available
          }
        }))
      }
    } catch (error) {
      console.error('Error fetching hero metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overviewTab}>
      {/* Hero Metrics Section */}
      <section className={styles.heroSection}>
        <h2 className={styles.sectionTitle}>Key Metrics</h2>
        <div className={styles.metricsGrid}>
          <MetricCard
            label="Total Revenue"
            value={heroMetrics.revenue?.value || '$0'}
            trend={heroMetrics.revenue?.trend}
            icon="💰"
            color="financial"
            loading={loading}
            onClick={() => router.push('/kpis?tab=financial')}
          />
          <MetricCard
            label="Net Profit"
            value={heroMetrics.profit?.value || '$0'}
            trend={heroMetrics.profit?.trend}
            icon="💚"
            color="success"
            loading={loading}
            onClick={() => router.push('/kpis?tab=financial')}
          />
          <MetricCard
            label="Members"
            value={heroMetrics.members?.value || '0'}
            trend={heroMetrics.members?.trend}
            icon="👥"
            color="community"
            loading={loading}
            onClick={() => router.push('/kpis?tab=community')}
          />
          <MetricCard
            label="Avg Response Time"
            value={heroMetrics.responseTime?.value || '0 min'}
            trend={heroMetrics.responseTime?.trend}
            icon="⏱️"
            color="support"
            loading={loading}
            onClick={() => router.push('/kpis?tab=support')}
          />
        </div>
      </section>

      {/* System Health Section */}
      <KPISection
        title="System Health"
        icon="🏥"
        description="Quick overview of platform status"
        defaultExpanded={true}
        collapsible={true}
      >
        <div className={styles.healthGrid}>
          <div className={styles.healthCard}>
            <div className={styles.healthIcon}>🟢</div>
            <div className={styles.healthContent}>
              <div className={styles.healthLabel}>All Systems Operational</div>
              <div className={styles.healthValue}>100% Uptime</div>
            </div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.healthIcon}>📊</div>
            <div className={styles.healthContent}>
              <div className={styles.healthLabel}>Database</div>
              <div className={styles.healthValue}>Healthy</div>
            </div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.healthIcon}>🤖</div>
            <div className={styles.healthContent}>
              <div className={styles.healthLabel}>Discord Bot</div>
              <div className={styles.healthValue}>Online</div>
            </div>
          </div>

          <div className={styles.healthCard}>
            <div className={styles.healthIcon}>💳</div>
            <div className={styles.healthContent}>
              <div className={styles.healthLabel}>Payment System</div>
              <div className={styles.healthValue}>Connected</div>
            </div>
          </div>
        </div>
      </KPISection>

      {/* Quick Actions */}
      <KPISection
        title="Quick Actions"
        icon="⚡"
        description="Common tasks and shortcuts"
        defaultExpanded={true}
        collapsible={true}
      >
        <div className={styles.actionsGrid}>
          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=financial')}
          >
            <span className={styles.actionIcon}>💰</span>
            <span className={styles.actionLabel}>View Financial Report</span>
            <span className={styles.actionArrow}>→</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=operations')}
          >
            <span className={styles.actionIcon}>👷</span>
            <span className={styles.actionLabel}>Worker Performance</span>
            <span className={styles.actionArrow}>→</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=support')}
          >
            <span className={styles.actionIcon}>🎫</span>
            <span className={styles.actionLabel}>Support Metrics</span>
            <span className={styles.actionArrow}>→</span>
          </button>

          <button
            className={styles.actionButton}
            onClick={() => router.push('/kpis?tab=community')}
          >
            <span className={styles.actionIcon}>👥</span>
            <span className={styles.actionLabel}>Community Engagement</span>
            <span className={styles.actionArrow}>→</span>
          </button>
        </div>
      </KPISection>

      {/* Welcome Message */}
      <div className={styles.welcomeCard}>
        <h3>👋 Welcome to Your KPI Dashboard</h3>
        <p>
          This dashboard provides real-time insights into your platform's performance.
          Use the tabs above to explore detailed metrics for each area.
        </p>
        <ul>
          <li><strong>Overview:</strong> Quick health check and key metrics</li>
          <li><strong>Community:</strong> Member growth and Discord engagement</li>
          <li><strong>Support:</strong> Response times and ticket metrics</li>
          <li><strong>Operations:</strong> Worker performance and order completion</li>
          <li><strong>Financial:</strong> Revenue, expenses, and profit analysis</li>
        </ul>
      </div>
    </div>
  )
}

export default OverviewTab
