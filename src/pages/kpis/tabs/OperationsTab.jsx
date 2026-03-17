import React, { useState, useEffect } from 'react'
import { KPISection } from '../../../components/dashboard'
import Card from '../../../components/atoms/cards'
import LineChart from '../../../components/atoms/charts/LineChart'
import BarChart from '../../../components/atoms/charts/BarChart'
import PieChart from '../../../components/atoms/charts/PieChart'
import kpiController from '../../../controllers/kpi'
import { notify } from '../../../config/error'
import moment from 'moment'
import {
  IoWarning, IoCheckmarkCircle, IoTime, IoPeople, IoTrendingUp,
  IoAlertCircle, IoStatsChart, IoSwapHorizontal, IoBan
} from 'react-icons/io5'
import styles from './OperationsTab.module.scss'

/**
 * OperationsTab - Operations & Worker metrics
 * Contains: Order Issues, Completion Time, Service Requests, Service Conversion, Worker Performance, Worker Issues
 */
const OperationsTab = () => {
  // Order Issues State
  const [orderIssues, setOrderIssues] = useState(null)
  const [orderIssuesPeriod, setOrderIssuesPeriod] = useState('monthly')

  // Order Completion Time State
  const [completionTime, setCompletionTime] = useState(null)
  const [completionTimePeriod, setCompletionTimePeriod] = useState('monthly')

  // Service Requests State
  const [serviceRequests, setServiceRequests] = useState(null)
  const [serviceRequestsPeriod, setServiceRequestsPeriod] = useState('monthly')

  // Service Conversion State
  const [serviceConversion, setServiceConversion] = useState(null)
  const [serviceConversionPeriod, setServiceConversionPeriod] = useState('monthly')

  // Worker Performance State
  const [workerPerformance, setWorkerPerformance] = useState(null)
  const [workerPeriod, setWorkerPeriod] = useState('monthly')

  // Worker Issues State
  const [workerIssues, setWorkerIssues] = useState(null)
  const [workerIssuesPeriod, setWorkerIssuesPeriod] = useState('monthly')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllOperationsKPIs()
  }, [orderIssuesPeriod, completionTimePeriod, serviceRequestsPeriod, serviceConversionPeriod, workerPeriod, workerIssuesPeriod])

  const fetchAllOperationsKPIs = async () => {
    setLoading(true)
    await Promise.all([
      fetchOrderIssues(),
      fetchCompletionTime(),
      fetchServiceRequests(),
      fetchServiceConversion(),
      fetchWorkerPerformance(),
      fetchWorkerIssues()
    ])
    setLoading(false)
  }

  // ============================================
  // ORDER ISSUES KPI
  // ============================================

  const fetchOrderIssues = async () => {
    try {
      const res = await kpiController.getOrderIssues({ period: orderIssuesPeriod })

      if (res && res.error === false) {
        setOrderIssues(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load order issues data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading order issues data', type: 'error' })
    }
  }

  // ============================================
  // ORDER COMPLETION TIME KPI
  // ============================================

  const fetchCompletionTime = async () => {
    try {
      const res = await kpiController.getOrderCompletionTime({ period: completionTimePeriod })

      if (res && res.error === false) {
        setCompletionTime(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load completion time data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading completion time data', type: 'error' })
    }
  }

  // ============================================
  // SERVICE REQUESTS KPI
  // ============================================

  const fetchServiceRequests = async () => {
    try {
      const res = await kpiController.getServiceRequests({ period: serviceRequestsPeriod })

      if (res && res.error === false) {
        setServiceRequests(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load service requests data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading service requests data', type: 'error' })
    }
  }

  // ============================================
  // SERVICE CONVERSION KPI
  // ============================================

  const fetchServiceConversion = async () => {
    try {
      const res = await kpiController.getServiceRequestConversion({ period: serviceConversionPeriod })

      if (res && res.error === false) {
        setServiceConversion(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load service conversion data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading service conversion data', type: 'error' })
    }
  }

  // ============================================
  // WORKER PERFORMANCE KPI
  // ============================================

  const fetchWorkerPerformance = async () => {
    try {
      const res = await kpiController.getWorkerPerformance({ period: workerPeriod })

      if (res && res.error === false) {
        setWorkerPerformance(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load worker performance data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading worker performance data', type: 'error' })
    }
  }

  // ============================================
  // WORKER ISSUES KPI
  // ============================================

  const fetchWorkerIssues = async () => {
    try {
      const res = await kpiController.getWorkerIssues({ period: workerIssuesPeriod })

      if (res && res.error === false) {
        setWorkerIssues(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load worker issues data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading worker issues data', type: 'error' })
    }
  }

  // Extract data for Order Issues
  const issuesSummary = orderIssues?.summary || {}
  const issuesByCategory = orderIssues?.byCategory || []
  const issuesTrend = orderIssues?.trendData || []
  const recentIssues = orderIssues?.recentIssues || []

  // Extract data for Completion Time
  const completionSummary = completionTime?.summary || {}
  const completionDistribution = completionTime?.distribution || {}
  const completionByService = completionTime?.byService || []
  const fastestOrders = completionTime?.fastestOrders || []
  const slowestOrders = completionTime?.slowestOrders || []

  // Extract data for Service Requests
  const requestsSummary = serviceRequests?.summary || {}
  const requestsByService = serviceRequests?.byService || []
  const requestsTrend = serviceRequests?.trendData || []

  // Extract data for Service Conversion
  const conversionSummary = serviceConversion?.summary || {}
  const conversionByService = serviceConversion?.byService || []
  const conversionFunnel = serviceConversion?.funnel || []

  // Extract data for Worker Performance
  const workerSummary = workerPerformance?.summary || {}
  const topWorkers = workerPerformance?.topWorkers || []
  const workerStats = workerPerformance?.workerStats || []

  // Extract data for Worker Issues
  const workerIssuesSummary = workerIssues?.summary || {}
  const workerIssuesByCategory = workerIssues?.byCategory || []
  const problematicWorkers = workerIssues?.problematicWorkers || []

  return (
    <div className={styles.operationsTab}>
      <div className={styles.tabHeader}>
        <h1 className={styles.tabTitle}>💼 Operations Metrics</h1>
        <p className={styles.tabDescription}>
          Track order fulfillment, worker performance, and operational efficiency
        </p>
      </div>

      {/* ============================================
          ORDER ISSUES & REPORTS KPI
          ============================================ */}
      <KPISection
        title="Order Issues & Reports"
        icon="⚠️"
        description="Monitor order problems and issue resolution"
        defaultExpanded={true}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <div className={styles.periodSelector}>
            <button
              className={orderIssuesPeriod === 'weekly' ? styles.active : ''}
              onClick={() => setOrderIssuesPeriod('weekly')}
            >
              Weekly
            </button>
            <button
              className={orderIssuesPeriod === 'monthly' ? styles.active : ''}
              onClick={() => setOrderIssuesPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={orderIssuesPeriod === 'quarterly' ? styles.active : ''}
              onClick={() => setOrderIssuesPeriod('quarterly')}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoWarning />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{issuesSummary.totalIssues || 0}</div>
              <div className={styles.metricLabel}>Total Issues</div>
              <div className={styles.metricSubtext}>Reported problems</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.red}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{issuesSummary.unresolvedIssues || 0}</div>
              <div className={styles.metricLabel}>Unresolved Issues</div>
              <div className={styles.metricSubtext}>Needs attention</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {issuesSummary.resolutionRate ? `${issuesSummary.resolutionRate.toFixed(1)}%` : '0%'}
              </div>
              <div className={styles.metricLabel}>Resolution Rate</div>
              <div className={styles.metricSubtext}>Issues resolved</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {issuesSummary.avgResolutionTimeHours ? `${issuesSummary.avgResolutionTimeHours.toFixed(1)}h` : '0h'}
              </div>
              <div className={styles.metricLabel}>Avg Resolution Time</div>
              <div className={styles.metricSubtext}>Time to fix</div>
            </div>
          </div>
        </div>

        {/* Issues by Category */}
        {issuesByCategory.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Issues by Category</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={issuesByCategory.map(cat => ({
                  label: cat.category,
                  value: cat.count
                }))}
                color="#f97316"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Recent Issues */}
        {recentIssues.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Recent Issues</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIssues.slice(0, 10).map((issue, index) => (
                    <tr key={index}>
                      <td className={styles.orderNumber}>#{issue.orderNumber}</td>
                      <td><span className={styles.categoryBadge}>{issue.category}</span></td>
                      <td className={styles.description}>{issue.description}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${issue.isResolved ? styles.resolved : styles.pending}`}>
                          {issue.isResolved ? 'Resolved' : 'Pending'}
                        </span>
                      </td>
                      <td>{moment(issue.reportedAt).format('MMM DD, YYYY')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </KPISection>

      {/* ============================================
          ORDER COMPLETION TIME KPI
          ============================================ */}
      <KPISection
        title="Order Completion Time"
        icon="⏱️"
        description="Measure how long it takes to complete orders"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <div className={styles.periodSelector}>
            <button
              className={completionTimePeriod === 'weekly' ? styles.active : ''}
              onClick={() => setCompletionTimePeriod('weekly')}
            >
              Weekly
            </button>
            <button
              className={completionTimePeriod === 'monthly' ? styles.active : ''}
              onClick={() => setCompletionTimePeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={completionTimePeriod === 'quarterly' ? styles.active : ''}
              onClick={() => setCompletionTimePeriod('quarterly')}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {completionSummary.avgCompletionTimeHours ? `${completionSummary.avgCompletionTimeHours.toFixed(1)}h` : '0h'}
              </div>
              <div className={styles.metricLabel}>Avg Completion Time</div>
              <div className={styles.metricSubtext}>
                Median: {completionSummary.medianCompletionTimeHours?.toFixed(1) || 0}h
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{completionSummary.totalCompleted || 0}</div>
              <div className={styles.metricLabel}>Orders Completed</div>
              <div className={styles.metricSubtext}>This period</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {completionSummary.fastestCompletionHours ? `${completionSummary.fastestCompletionHours.toFixed(1)}h` : '0h'}
              </div>
              <div className={styles.metricLabel}>Fastest Completion</div>
              <div className={styles.metricSubtext}>Best time</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {completionSummary.slowestCompletionHours ? `${completionSummary.slowestCompletionHours.toFixed(1)}h` : '0h'}
              </div>
              <div className={styles.metricLabel}>Slowest Completion</div>
              <div className={styles.metricSubtext}>Needs improvement</div>
            </div>
          </div>
        </div>

        {/* Completion Distribution */}
        {completionDistribution && Object.keys(completionDistribution).length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Completion Time Distribution</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={[
                  { label: '< 12h', value: completionDistribution.under12h?.count || 0 },
                  { label: '12-24h', value: completionDistribution.hour12to24?.count || 0 },
                  { label: '1-2 days', value: completionDistribution.day1to2?.count || 0 },
                  { label: '2-3 days', value: completionDistribution.day2to3?.count || 0 },
                  { label: '3-7 days', value: completionDistribution.day3to7?.count || 0 },
                  { label: '> 7 days', value: completionDistribution.over7days?.count || 0 }
                ]}
                color="#3b82f6"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Completion by Service */}
        {completionByService.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Avg Completion Time by Service</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Orders</th>
                    <th>Avg Time</th>
                    <th>Median</th>
                  </tr>
                </thead>
                <tbody>
                  {completionByService.map((service, index) => (
                    <tr key={index}>
                      <td>{service.serviceName}</td>
                      <td>{service.orderCount}</td>
                      <td>{service.avgCompletionTimeHours.toFixed(1)}h</td>
                      <td>{service.medianCompletionTimeHours.toFixed(1)}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </KPISection>

      {/* ============================================
          SERVICE REQUEST MEASUREMENT KPI
          ============================================ */}
      <KPISection
        title="Service Request Measurement"
        icon="📊"
        description="Track service request volume and patterns"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <div className={styles.periodSelector}>
            <button
              className={serviceRequestsPeriod === 'weekly' ? styles.active : ''}
              onClick={() => setServiceRequestsPeriod('weekly')}
            >
              Weekly
            </button>
            <button
              className={serviceRequestsPeriod === 'monthly' ? styles.active : ''}
              onClick={() => setServiceRequestsPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={serviceRequestsPeriod === 'quarterly' ? styles.active : ''}
              onClick={() => setServiceRequestsPeriod('quarterly')}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{requestsSummary.totalRequests || 0}</div>
              <div className={styles.metricLabel}>Total Requests</div>
              <div className={styles.metricSubtext}>This period</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoTrendingUp />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {requestsSummary.avgRequestsPerDay ? requestsSummary.avgRequestsPerDay.toFixed(0) : 0}
              </div>
              <div className={styles.metricLabel}>Avg Requests/Day</div>
              <div className={styles.metricSubtext}>Daily average</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{requestsSummary.uniqueServices || 0}</div>
              <div className={styles.metricLabel}>Services Requested</div>
              <div className={styles.metricSubtext}>Unique services</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {requestsSummary.mostPopularService || 'N/A'}
              </div>
              <div className={styles.metricLabel}>Top Service</div>
              <div className={styles.metricSubtext}>Most requested</div>
            </div>
          </div>
        </div>

        {/* Requests by Service */}
        {requestsByService.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Requests by Service Type</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={requestsByService.slice(0, 10).map(service => ({
                  label: service.serviceName,
                  value: service.requestCount
                }))}
                color="#8b5cf6"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}
      </KPISection>

      {/* ============================================
          SERVICE REQUEST CONVERSION RATE KPI
          ============================================ */}
      <KPISection
        title="Service Request Conversion Rate"
        icon="🎯"
        description="Measure how many service requests convert to orders"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <div className={styles.periodSelector}>
            <button
              className={serviceConversionPeriod === 'weekly' ? styles.active : ''}
              onClick={() => setServiceConversionPeriod('weekly')}
            >
              Weekly
            </button>
            <button
              className={serviceConversionPeriod === 'monthly' ? styles.active : ''}
              onClick={() => setServiceConversionPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={serviceConversionPeriod === 'quarterly' ? styles.active : ''}
              onClick={() => setServiceConversionPeriod('quarterly')}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoSwapHorizontal />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {conversionSummary.conversionRate ? `${conversionSummary.conversionRate.toFixed(1)}%` : '0%'}
              </div>
              <div className={styles.metricLabel}>Conversion Rate</div>
              <div className={styles.metricSubtext}>Requests → Orders</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{conversionSummary.totalRequests || 0}</div>
              <div className={styles.metricLabel}>Total Requests</div>
              <div className={styles.metricSubtext}>This period</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{conversionSummary.convertedOrders || 0}</div>
              <div className={styles.metricLabel}>Converted Orders</div>
              <div className={styles.metricSubtext}>Successfully converted</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{conversionSummary.unconvertedRequests || 0}</div>
              <div className={styles.metricLabel}>Not Converted</div>
              <div className={styles.metricSubtext}>Lost opportunities</div>
            </div>
          </div>
        </div>

        {/* Conversion by Service */}
        {conversionByService.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Conversion Rate by Service</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Requests</th>
                    <th>Converted</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionByService.map((service, index) => (
                    <tr key={index}>
                      <td>{service.serviceName}</td>
                      <td>{service.requestCount}</td>
                      <td>{service.convertedCount}</td>
                      <td>
                        <span className={`${styles.conversionRate} ${service.conversionRate >= 50 ? styles.good : styles.needsWork}`}>
                          {service.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </KPISection>

      {/* ============================================
          WORKER PERFORMANCE METRICS KPI
          ============================================ */}
      <KPISection
        title="Worker Performance Metrics"
        icon="👷"
        description="Track worker efficiency, quality, and productivity"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <div className={styles.periodSelector}>
            <button
              className={workerPeriod === 'weekly' ? styles.active : ''}
              onClick={() => setWorkerPeriod('weekly')}
            >
              Weekly
            </button>
            <button
              className={workerPeriod === 'monthly' ? styles.active : ''}
              onClick={() => setWorkerPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={workerPeriod === 'quarterly' ? styles.active : ''}
              onClick={() => setWorkerPeriod('quarterly')}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoPeople />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{workerSummary.totalWorkers || 0}</div>
              <div className={styles.metricLabel}>Active Workers</div>
              <div className={styles.metricSubtext}>This period</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerSummary.avgOrdersPerWorker ? workerSummary.avgOrdersPerWorker.toFixed(1) : 0}
              </div>
              <div className={styles.metricLabel}>Avg Orders/Worker</div>
              <div className={styles.metricSubtext}>Productivity</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerSummary.avgCompletionTimeHours ? `${workerSummary.avgCompletionTimeHours.toFixed(1)}h` : '0h'}
              </div>
              <div className={styles.metricLabel}>Avg Completion Time</div>
              <div className={styles.metricSubtext}>Per worker</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerSummary.avgQualityRating ? workerSummary.avgQualityRating.toFixed(1) : 0}
              </div>
              <div className={styles.metricLabel}>Avg Quality Rating</div>
              <div className={styles.metricSubtext}>Out of 5.0</div>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        {topWorkers.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Top Performers</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Worker</th>
                    <th>Orders</th>
                    <th>Avg Time</th>
                    <th>Quality</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {topWorkers.slice(0, 10).map((worker, index) => (
                    <tr key={index}>
                      <td className={styles.rank}>#{index + 1}</td>
                      <td className={styles.workerName}>{worker.workerName || worker.discordUsername}</td>
                      <td>{worker.orderCount}</td>
                      <td>{worker.avgCompletionTimeHours.toFixed(1)}h</td>
                      <td>
                        <span className={styles.qualityRating}>
                          {worker.avgQualityRating ? worker.avgQualityRating.toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td className={styles.earnings}>${worker.totalEarnings?.toFixed(2) || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </KPISection>

      {/* ============================================
          WORKER ISSUE TRACKING KPI
          ============================================ */}
      <KPISection
        title="Worker Issue Tracking"
        icon="🔧"
        description="Monitor worker-related problems and complaints"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <div className={styles.periodSelector}>
            <button
              className={workerIssuesPeriod === 'weekly' ? styles.active : ''}
              onClick={() => setWorkerIssuesPeriod('weekly')}
            >
              Weekly
            </button>
            <button
              className={workerIssuesPeriod === 'monthly' ? styles.active : ''}
              onClick={() => setWorkerIssuesPeriod('monthly')}
            >
              Monthly
            </button>
            <button
              className={workerIssuesPeriod === 'quarterly' ? styles.active : ''}
              onClick={() => setWorkerIssuesPeriod('quarterly')}
            >
              Quarterly
            </button>
          </div>
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoWarning />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{workerIssuesSummary.totalIssues || 0}</div>
              <div className={styles.metricLabel}>Total Worker Issues</div>
              <div className={styles.metricSubtext}>Reported problems</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.red}`}>
            <div className={styles.metricIcon}>
              <IoBan />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{workerIssuesSummary.workersWithIssues || 0}</div>
              <div className={styles.metricLabel}>Workers with Issues</div>
              <div className={styles.metricSubtext}>Need monitoring</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerIssuesSummary.avgIssuesPerWorker ? workerIssuesSummary.avgIssuesPerWorker.toFixed(1) : 0}
              </div>
              <div className={styles.metricLabel}>Avg Issues/Worker</div>
              <div className={styles.metricSubtext}>Among problematic workers</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerIssuesSummary.mostCommonIssue || 'N/A'}
              </div>
              <div className={styles.metricLabel}>Top Issue Category</div>
              <div className={styles.metricSubtext}>Most common</div>
            </div>
          </div>
        </div>

        {/* Issues by Category */}
        {workerIssuesByCategory.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Issues by Category</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={workerIssuesByCategory.map(cat => ({
                  label: cat.category,
                  value: cat.count
                }))}
                color="#ef4444"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Problematic Workers */}
        {problematicWorkers.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Workers Requiring Attention</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Total Issues</th>
                    <th>Most Common Issue</th>
                    <th>Last Issue</th>
                  </tr>
                </thead>
                <tbody>
                  {problematicWorkers.slice(0, 10).map((worker, index) => (
                    <tr key={index}>
                      <td className={styles.workerName}>{worker.workerName || worker.discordUsername}</td>
                      <td className={styles.issueCount}>{worker.issueCount}</td>
                      <td><span className={styles.categoryBadge}>{worker.mostCommonCategory}</span></td>
                      <td>{moment(worker.lastIssueDate).format('MMM DD, YYYY')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </KPISection>
    </div>
  )
}

export default OperationsTab
