import React, { useState, useEffect } from 'react'
import { KPISection } from '../../../components/dashboard'
import Card from '../../../components/atoms/cards'
import kpiController from '../../../controllers/kpi'
import DateRange, { toQuery } from '../../../components/molecules/dateRange'
import { notify } from '../../../config/error'
import { IoCash, IoTrendingUp, IoWallet, IoStatsChart } from 'react-icons/io5'
import styles from './FinancialTab.module.scss'

/**
 * FinancialTab - Financial & Profit metrics
 * Contains: Revenue, Expenses, Net Profit
 */
const FinancialTab = () => {
  const [financialOverview, setFinancialOverview] = useState(null)
  const [financialRange, setFinancialRange] = useState({ preset: 'this_month' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialOverview()
  }, [financialRange])

  const fetchFinancialOverview = async () => {
    setLoading(true)
    try {
      const res = await kpiController.getFinancialOverview(toQuery(financialRange))

      if (res && res.error === false) {
        setFinancialOverview(res.data || {})
      } else {
        setFinancialOverview({})
        notify({ message: res?.msg || 'Failed to load financial data', type: 'error' })
      }
    } catch (error) {
      console.error('Financial overview error:', error)
      setFinancialOverview({})
      notify({ message: 'Error loading financial data', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const summary = financialOverview?.summary || {}
  const expenses = financialOverview?.expenses || {}
  const systemWallet = financialOverview?.systemWallet || {}

  return (
    <div className={styles.financialTab}>
      {/* Header */}
      <div className={styles.tabHeader}>
        <h1 className={styles.tabTitle}>💰 Financial Metrics</h1>
        <p className={styles.tabDescription}>
          Monitor revenue, expenses, profitability, and financial health
        </p>
      </div>

      {/* Financial Overview KPI */}
      <KPISection
        title="Revenue, Expenses & Net Profit"
        icon="💰"
        description="Complete financial overview with revenue breakdown, operational expenses, and profit analysis"
        defaultExpanded={true}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <DateRange value={financialRange} onChange={setFinancialRange} />
        </div>

        {loading ? (
          <div className={styles.loading}>Loading financial data...</div>
        ) : financialOverview && summary ? (
          <>
            {/* Summary Metrics Grid */}
            <div className={styles.metricsGrid}>
              {/* Total Revenue */}
              <div className={`${styles.metricCard} ${styles.blue}`}>
                <div className={styles.metricIcon}>
                  <IoCash />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    ${summary.totalRevenue?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'}
                  </div>
                  <div className={styles.metricLabel}>Total Revenue</div>
                  <div className={styles.metricSubtext}>
                    {summary.totalOrders || 0} orders • Avg: ${summary.avgOrderValue?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* Gross Profit */}
              <div className={`${styles.metricCard} ${styles.green}`}>
                <div className={styles.metricIcon}>
                  <IoTrendingUp />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    ${summary.grossProfit?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'}
                  </div>
                  <div className={styles.metricLabel}>Gross Profit</div>
                  <div className={styles.metricSubtext}>
                    Margin: {summary.grossProfitMargin || 0}% (15% of revenue)
                  </div>
                </div>
              </div>

              {/* Total Expenses */}
              <div className={`${styles.metricCard} ${styles.red}`}>
                <div className={styles.metricIcon}>
                  <IoStatsChart />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    ${summary.totalExpenses?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'}
                  </div>
                  <div className={styles.metricLabel}>Total Expenses</div>
                  <div className={styles.metricSubtext}>
                    Workers: ${expenses.workerPayouts?.toFixed(2) || '0.00'} • OpEx: ${expenses.operational?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className={`${styles.metricCard} ${summary.netProfit >= 0 ? styles.green : styles.red}`}>
                <div className={styles.metricIcon}>
                  <IoWallet />
                </div>
                <div className={styles.metricContent}>
                  <div className={styles.metricValue}>
                    ${summary.netProfit?.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }) || '0.00'}
                  </div>
                  <div className={styles.metricLabel}>Net Profit</div>
                  <div className={styles.metricSubtext}>
                    Margin: {summary.netProfitMargin?.toFixed(2) || 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* System Wallet Balance */}
            {systemWallet && systemWallet.balance !== undefined && (
              <div className={styles.walletCard}>
                <div className={styles.walletHeader}>
                  <span className={styles.walletLabel}>💳 System Wallet Balance</span>
                  <span className={styles.walletBalance}>
                    ${systemWallet.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'} {systemWallet.currency || 'USD'}
                  </span>
                </div>
              </div>
            )}

            {/* Expense Breakdown */}
            {expenses && Object.keys(expenses).length > 0 && (
              <Card>
                <h3 className={styles.sectionTitle}>💸 Expense Breakdown</h3>
                <div className={styles.expenseGrid}>
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseName}>Worker Payouts (80%)</span>
                    <span className={styles.expenseValue}>
                      ${expenses.workerPayouts?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </div>
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseName}>Support Team Payouts (5%)</span>
                    <span className={styles.expenseValue}>
                      ${expenses.supportPayouts?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </div>
                  <div className={styles.expenseItem}>
                    <span className={styles.expenseName}>Operational Expenses</span>
                    <span className={styles.expenseValue}>
                      ${expenses.operational?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </div>
                  <div className={`${styles.expenseItem} ${styles.total}`}>
                    <span className={styles.expenseName}>Total Expenses</span>
                    <span className={styles.expenseValue}>
                      ${summary.totalExpenses?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* No Data Message */}
            {summary.totalRevenue === 0 && (
              <div className={styles.noDataCard}>
                <div className={styles.noDataIcon}>💰</div>
                <p className={styles.noDataTitle}>No revenue data for this period</p>
                <p className={styles.noDataText}>Financial data will appear once orders are completed.</p>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noData}>No financial data available</div>
        )}
      </KPISection>

      {/* Financial Insights Card */}
      <Card>
        <h3 className={styles.insightTitle}>💡 Financial Insights</h3>
        <p className={styles.insightText}>
          The financial dashboard provides a complete picture of your platform's economic health:
        </p>
        <ul className={styles.insightList}>
          <li><strong>Revenue Tracking:</strong> Monitor income from all completed orders</li>
          <li><strong>Cost Management:</strong> Track all operational expenses including worker payouts (80%), support team payouts (5%), and other operational costs</li>
          <li><strong>Profit Analysis:</strong> Understand your true profitability after all costs with 15% gross margin</li>
          <li><strong>System Wallet:</strong> Real-time balance tracking for available funds</li>
          <li><strong>Trend Analysis:</strong> Identify financial patterns over different time periods (daily, weekly, monthly, quarterly, yearly)</li>
        </ul>
      </Card>
    </div>
  )
}

export default FinancialTab
