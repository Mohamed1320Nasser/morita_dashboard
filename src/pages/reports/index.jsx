import React, { useEffect, useState } from 'react'
import styles from './reports.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import LineChart from '@/components/atoms/charts/LineChart'
import BarChart from '@/components/atoms/charts/BarChart'
import moment from 'moment'
import { IoTrendingUp, IoTrendingDown, IoPeople, IoWallet } from 'react-icons/io5'

const ReportsPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [orderVolumeData, setOrderVolumeData] = useState([])
  const [transactionVolumeData, setTransactionVolumeData] = useState([])
  const [userGrowthData, setUserGrowthData] = useState([])
  const [workerPerformance, setWorkerPerformance] = useState([])
  const [performanceMetrics, setPerformanceMetrics] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [isCustomRange, setIsCustomRange] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Prepare parameters for API call
        let volumeParams;
        if (isCustomRange && startDate && endDate) {
          volumeParams = { startDate, endDate };
        } else {
          volumeParams = { days: selectedPeriod };
        }

        const [orderVolumeRes, performanceRes] = await Promise.all([
          adminController.getOrderVolumeStats(volumeParams),
          fetch('/api/admin/system/metrics/performance')
            .then((r) => r.json())
            .catch(() => null),
        ])

        if (orderVolumeRes && orderVolumeRes.success) {
          const chartData = orderVolumeRes.data.map((item) => ({
            label: moment(item.date).format('MMM DD'),
            value: item.value || 0,
            count: item.count || 0,
          }))
          setOrderVolumeData(chartData)
        }

        if (performanceRes && performanceRes.success) {
          setPerformanceMetrics(performanceRes.data)
        }
      } catch (e) {
        console.log('Error loading reports', e)
      } finally {
        setPageLoading(false)
      }
    }

    fetchReports()
  }, [selectedPeriod, isCustomRange, startDate, endDate])

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${Math.round(minutes)}m`
    return `${(minutes / 60).toFixed(1)}h`
  }

  const getPeriodText = () => {
    if (isCustomRange && startDate && endDate) {
      return `${moment(startDate).format('MMM DD, YYYY')} - ${moment(endDate).format('MMM DD, YYYY')}`
    }
    return `Last ${selectedPeriod} days`
  }

  const getDaysInPeriod = () => {
    if (isCustomRange && startDate && endDate) {
      const start = moment(startDate)
      const end = moment(endDate)
      return end.diff(start, 'days') + 1
    }
    return selectedPeriod
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.reports}>
      <PageHead current="Reports & Analytics">
        <Head title="Reports & Analytics" noButton>
          System insights and performance metrics
        </Head>
      </PageHead>
      <Container>
        {/* Period Selector */}
        <div className={styles.periodSelector}>
          <button
            className={`${styles.periodBtn} ${!isCustomRange && selectedPeriod === 7 ? styles.active : ''}`}
            onClick={() => {
              setIsCustomRange(false)
              setSelectedPeriod(7)
            }}
          >
            Last 7 Days
          </button>
          <button
            className={`${styles.periodBtn} ${!isCustomRange && selectedPeriod === 30 ? styles.active : ''}`}
            onClick={() => {
              setIsCustomRange(false)
              setSelectedPeriod(30)
            }}
          >
            Last 30 Days
          </button>
          <button
            className={`${styles.periodBtn} ${!isCustomRange && selectedPeriod === 90 ? styles.active : ''}`}
            onClick={() => {
              setIsCustomRange(false)
              setSelectedPeriod(90)
            }}
          >
            Last 90 Days
          </button>
          <button
            className={`${styles.periodBtn} ${isCustomRange ? styles.active : ''}`}
            onClick={() => setIsCustomRange(true)}
          >
            Custom Range
          </button>
        </div>

        {/* Custom Date Range Inputs */}
        {isCustomRange && (
          <div className={styles.customDateRange}>
            <div className={styles.dateInputGroup}>
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={endDate || moment().format('YYYY-MM-DD')}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.dateInputGroup}>
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                max={moment().format('YYYY-MM-DD')}
                className={styles.dateInput}
              />
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {performanceMetrics && (
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.blue}`}>
                <IoTrendingUp />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>{performanceMetrics.successRate}%</div>
                <div className={styles.metricLabel}>Success Rate</div>
                <div className={styles.metricSubtext}>
                  {performanceMetrics.completedOrders} completed, {performanceMetrics.cancelledOrders} cancelled
                </div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.green}`}>
                <IoTrendingUp />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>
                  {formatTime(performanceMetrics.avgTimeToComplete)}
                </div>
                <div className={styles.metricLabel}>Avg Completion Time</div>
                <div className={styles.metricSubtext}>From assignment to completion</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.purple}`}>
                <IoTrendingUp />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>
                  {formatTime(performanceMetrics.avgTimeToAssign)}
                </div>
                <div className={styles.metricLabel}>Avg Assignment Time</div>
                <div className={styles.metricSubtext}>From creation to assignment</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.orange}`}>
                <IoTrendingUp />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>
                  {formatTime(performanceMetrics.avgTimeToConfirm)}
                </div>
                <div className={styles.metricLabel}>Avg Confirmation Time</div>
                <div className={styles.metricSubtext}>From completion to confirmation</div>
              </div>
            </div>
          </div>
        )}

        {/* Order Volume Chart */}
        <Card>
          <h3 className={styles.chartTitle}>Order Revenue Trend</h3>
          <div className={styles.chartContainer}>
            <LineChart
              data={orderVolumeData}
              color="#3b82f6"
              height={300}
              showArea={true}
              showGrid={true}
              formatValue={(value) => `$${parseFloat(value || 0).toFixed(0)}`}
            />
          </div>
          <div className={styles.chartLegend}>
            <div className={styles.legendItem}>
              <div className={styles.legendDot} style={{ background: '#3b82f6' }} />
              <span>Total Revenue</span>
            </div>
          </div>
        </Card>

        {/* Order Count Bar Chart */}
        <Card>
          <h3 className={styles.chartTitle}>Order Volume (Count)</h3>
          <div className={styles.chartContainer}>
            <BarChart
              data={orderVolumeData.map((d) => ({ label: d.label, value: d.count }))}
              color="#22c55e"
              height={300}
              showGrid={true}
              showValues={true}
            />
          </div>
        </Card>

        {/* Summary Stats */}
        <div className={styles.summaryGrid}>
          <Card>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h4>Total Revenue</h4>
                <IoTrendingUp style={{ color: '#22c55e', fontSize: '1.5rem' }} />
              </div>
              <div className={styles.summaryValue}>
                {formatCurrency(
                  orderVolumeData.reduce((sum, d) => sum + d.value, 0)
                )}
              </div>
              <div className={styles.summarySubtext}>
                {getPeriodText()} • {orderVolumeData.reduce((sum, d) => sum + d.count, 0)} orders
              </div>
            </div>
          </Card>

          <Card>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h4>Average Order Value</h4>
                <IoWallet style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
              </div>
              <div className={styles.summaryValue}>
                {formatCurrency(
                  orderVolumeData.reduce((sum, d) => sum + d.value, 0) /
                    (orderVolumeData.reduce((sum, d) => sum + d.count, 0) || 1)
                )}
              </div>
              <div className={styles.summarySubtext}>Based on completed orders</div>
            </div>
          </Card>

          <Card>
            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h4>Daily Average</h4>
                <IoTrendingUp style={{ color: '#a855f7', fontSize: '1.5rem' }} />
              </div>
              <div className={styles.summaryValue}>
                {formatCurrency(
                  orderVolumeData.reduce((sum, d) => sum + d.value, 0) / (getDaysInPeriod() || 1)
                )}
              </div>
              <div className={styles.summarySubtext}>
                {(orderVolumeData.reduce((sum, d) => sum + d.count, 0) / (getDaysInPeriod() || 1)).toFixed(1)} orders/day
              </div>
            </div>
          </Card>
        </div>

        {/* Instructions for data collection */}
        <Card>
          <div className={styles.infoBox}>
            <h4>📊 Analytics Information</h4>
            <p>
              This reports page shows system-wide analytics and performance metrics. Data is updated in real-time based on order completions, transactions, and user activity.
            </p>
            <ul>
              <li><strong>Order Revenue Trend:</strong> Shows the total revenue generated from completed orders over time</li>
              <li><strong>Order Volume:</strong> Displays the number of orders created per day</li>
              <li><strong>Performance Metrics:</strong> Average times for order assignment, completion, and confirmation</li>
              <li><strong>Success Rate:</strong> Ratio of completed orders to cancelled orders</li>
            </ul>
          </div>
        </Card>
      </Container>
    </div>
  )
}


export default ReportsPage
