import React from 'react'
import Card from '@/components/atoms/cards'
import Badge from '@/components/atoms/badge'
import SpendingTrendChart from '../charts/SpendingTrendChart'
import OrderVolumeChart from '../charts/OrderVolumeChart'
import BalanceHistoryChart from '../charts/BalanceHistoryChart'
import styles from './TabStyles.module.scss'

const OverviewTab = ({ profileData }) => {
  const { user, financial, loyalty, orders, charts, activity } = profileData

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  // Calculate total orders
  const totalOrders = (orders.asCustomer?.total || 0) + (orders.asWorker?.total || 0)

  return (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#3b82f6' }}>
              {formatCurrency(financial.totalSpent)}
            </div>
            <div className={styles.statLabel}>Total Spent</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#10b981' }}>
              {totalOrders}
            </div>
            <div className={styles.statLabel}>Total Orders</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#f59e0b' }}>
              {loyalty.currentTier?.name || 'None'}
            </div>
            <div className={styles.statLabel}>Loyalty Tier</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#8b5cf6' }}>
              {formatCurrency(financial.wallet?.balance || 0)}
            </div>
            <div className={styles.statLabel}>Wallet Balance</div>
          </div>
        </Card>
      </div>

      <div className={styles.chartsGrid}>
        <Card>
          <h3 className={styles.chartTitle}>Spending Trend (Last 30 Days)</h3>
          <SpendingTrendChart data={charts.spendingTrend} />
        </Card>

        <Card>
          <h3 className={styles.chartTitle}>Order Volume (Last 6 Months)</h3>
          <OrderVolumeChart data={charts.orderVolume} />
        </Card>
      </div>

      <Card>
        <h3 className={styles.chartTitle}>Balance History (Last 30 Days)</h3>
        <BalanceHistoryChart data={charts.balanceHistory} />
      </Card>

      {activity && (
        <Card>
          <h3 className={styles.sectionTitle}>Activity Summary</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Activity Level</span>
              <span className={styles.infoValue}>
                <Badge type={activity.activityLevel === 'High' ? 'success' : activity.activityLevel === 'Medium' ? 'warning' : 'secondary'}>
                  {activity.activityLevel || 'Low'}
                </Badge>
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Order Frequency</span>
              <span className={styles.infoValue}>{activity.orderFrequency || 'N/A'}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Avg Order Value</span>
              <span className={styles.infoValue}>{formatCurrency(orders.asCustomer?.avgOrderValue || 0)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Last Activity</span>
              <span className={styles.infoValue}>{activity.lastOrderDate || 'N/A'}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export default OverviewTab
