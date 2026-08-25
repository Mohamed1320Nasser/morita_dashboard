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
const EXPENSE_CATEGORIES = [
  { value: 'SERVER_HOSTING', label: 'Server Hosting' },
  { value: 'PAYMENT_FEES', label: 'Payment Fees' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SOFTWARE_LICENSES', label: 'Software Licenses' },
  { value: 'DISCORD_BOT', label: 'Discord Bot' },
  { value: 'MODERATION', label: 'Moderation' },
  { value: 'REFUNDS', label: 'Refunds' },
  { value: 'CHARGEBACKS', label: 'Chargebacks' },
  { value: 'WITHDRAWAL_FEES', label: 'Withdrawal Fees' },
  { value: 'OTHER', label: 'Other' },
]

const todayISO = () => new Date().toISOString().substring(0, 10)

const emptyExpense = () => ({
  category: 'OTHER',
  amount: '',
  description: '',
  date: todayISO(),
  reference: '',
})

const FinancialTab = () => {
  const [financialOverview, setFinancialOverview] = useState(null)
  const [financialRange, setFinancialRange] = useState({ preset: 'this_month' })
  const [loading, setLoading] = useState(true)
  const [expenseList, setExpenseList] = useState([])
  const [expenseForm, setExpenseForm] = useState(emptyExpense())
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [savingExpense, setSavingExpense] = useState(false)

  useEffect(() => {
    fetchFinancialOverview()
    fetchExpenses()
  }, [financialRange])

  const fetchExpenses = async () => {
    try {
      const res = await kpiController.getExpenses({ ...toQuery(financialRange), limit: 50 })
      // The service nests the array under data.expenses alongside pagination.
      const payload = res?.data?.expenses || res?.data?.data?.expenses || []
      setExpenseList(Array.isArray(payload) ? payload : [])
    } catch (error) {
      console.error('Expense list error:', error)
      setExpenseList([])
    }
  }

  const handleSaveExpense = async () => {
    const amount = Number(expenseForm.amount)

    if (!String(expenseForm.amount).trim() || !Number.isFinite(amount) || amount <= 0) {
      notify({ message: 'Amount must be greater than zero', type: 'error' })
      return
    }
    if (!expenseForm.description.trim()) {
      notify({ message: 'Description is required', type: 'error' })
      return
    }
    if (!expenseForm.date) {
      notify({ message: 'Date is required', type: 'error' })
      return
    }

    setSavingExpense(true)
    try {
      const res = await kpiController.createExpense({
        category: expenseForm.category,
        amount: Math.round(amount * 100) / 100,
        description: expenseForm.description.trim(),
        date: new Date(`${expenseForm.date}T00:00:00.000Z`).toISOString(),
        reference: expenseForm.reference.trim() || undefined,
      })

      if (res && res.error === false) {
        notify({ message: 'Expense recorded', type: 'success' })
        setExpenseForm(emptyExpense())
        setShowExpenseForm(false)
        // Net profit shifts as soon as this lands, so pull both again.
        fetchFinancialOverview()
        fetchExpenses()
      } else {
        notify({ message: res?.msg || 'Failed to save expense', type: 'error' })
      }
    } catch (error) {
      console.error('Create expense error:', error)
      notify({ message: 'Error saving expense', type: 'error' })
    } finally {
      setSavingExpense(false)
    }
  }

  const handleDeleteExpense = async (id) => {
    try {
      const res = await kpiController.deleteExpense(id)
      if (res && res.error === false) {
        notify({ message: 'Expense deleted', type: 'success' })
        fetchFinancialOverview()
        fetchExpenses()
      } else {
        notify({ message: res?.msg || 'Failed to delete expense', type: 'error' })
      }
    } catch (error) {
      console.error('Delete expense error:', error)
      notify({ message: 'Error deleting expense', type: 'error' })
    }
  }

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

      {/* Operational Expenses */}
      <Card>
        <div className={styles.expenseHeader}>
          <h3 className={styles.sectionTitle}>🧾 Operational Expenses</h3>
          <button
            type="button"
            className={styles.addExpenseButton}
            onClick={() => setShowExpenseForm(prev => !prev)}
          >
            {showExpenseForm ? 'Cancel' : '+ Add Expense'}
          </button>
        </div>
        <p className={styles.expenseHint}>
          Costs paid outside an order. These count against net profit for the selected period.
        </p>

        {showExpenseForm && (
          <div className={styles.expenseForm}>
            <div className={styles.expenseFormGrid}>
              <div className={styles.expenseField}>
                <label>Amount (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className={styles.expenseField}>
                <label>Category</label>
                <select
                  value={expenseForm.category}
                  onChange={e => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className={styles.expenseField}>
                <label>Date</label>
                <input
                  type="date"
                  value={expenseForm.date}
                  onChange={e => setExpenseForm(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className={styles.expenseField}>
                <label>Reference (optional)</label>
                <input
                  type="text"
                  placeholder="Invoice or receipt number"
                  value={expenseForm.reference}
                  onChange={e => setExpenseForm(prev => ({ ...prev, reference: e.target.value }))}
                />
              </div>
              <div className={`${styles.expenseField} ${styles.expenseFieldWide}`}>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="What was this for?"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
            <button
              type="button"
              className={styles.saveExpenseButton}
              onClick={handleSaveExpense}
              disabled={savingExpense}
            >
              {savingExpense ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        )}

        {expenseList.length > 0 ? (
          <div className={styles.expenseTable}>
            {expenseList.map(expense => (
              <div key={expense.id} className={styles.expenseRow}>
                <div className={styles.expenseRowMain}>
                  <span className={styles.expenseRowCategory}>
                    {EXPENSE_CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                  </span>
                  <span className={styles.expenseRowDescription}>{expense.description}</span>
                </div>
                <div className={styles.expenseRowMeta}>
                  <span className={styles.expenseRowDate}>
                    {String(expense.date).substring(0, 10)}
                  </span>
                  <span className={styles.expenseRowAmount}>
                    ${Number(expense.amount).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    className={styles.deleteExpenseButton}
                    onClick={() => handleDeleteExpense(expense.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noData}>No operational expenses recorded for this period.</div>
        )}
      </Card>

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
