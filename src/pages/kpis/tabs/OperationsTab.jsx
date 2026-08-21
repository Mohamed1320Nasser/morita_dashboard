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
  const statusDistribution = orderIssues?.statusDistribution || []
  const priorityDistribution = orderIssues?.priorityDistribution || []
  const issuesByService = orderIssues?.issuesByService || []
  const resolutionPerformance = orderIssues?.resolutionPerformance || []
  const unresolvedIssues = orderIssues?.unresolvedIssues || []

  // Extract data for Completion Time
  const completionSummary = completionTime?.summary || {}
  const completionDistribution = completionTime?.distribution || {}
  const completionByService = completionTime?.serviceBreakdown || []
  const fastestOrders = completionTime?.fastest || []
  const slowestOrders = completionTime?.slowest || []

  // Extract data for Service Requests
  const requestsSummary = serviceRequests?.summary || {}
  const servicePerformance = serviceRequests?.servicePerformance || []
  const categoryPerformance = serviceRequests?.categoryPerformance || []

  // Extract data for Service Conversion
  const conversionSummary = serviceConversion?.summary || {}
  const conversionServiceBreakdown = serviceConversion?.serviceBreakdown || []
  const conversionCategoryBreakdown = serviceConversion?.categoryBreakdown || []
  const conversionTimeline = serviceConversion?.conversionTimeline || []
  const topConvertingServices = serviceConversion?.topConvertingServices || []
  const lowConvertingServices = serviceConversion?.lowConvertingServices || []

  // Extract data for Worker Performance
  const workerSummary = workerPerformance?.summary || {}
  const topWorkers = workerPerformance?.topWorkers || []
  const workerStats = workerPerformance?.workerStats || []

  // Extract data for Worker Issues
  const workerIssuesSummary = workerIssues?.summary || {}
  const workerStatsData = workerIssues?.workerStats || []
  const recentIssuesData = workerIssues?.recentIssues || []

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
              <div className={styles.metricValue}>{issuesSummary.openIssues || 0}</div>
              <div className={styles.metricLabel}>Open Issues</div>
              <div className={styles.metricSubtext}>Needs attention</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{issuesSummary.resolvedIssues || 0}</div>
              <div className={styles.metricLabel}>Resolved Issues</div>
              <div className={styles.metricSubtext}>Successfully fixed</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {issuesSummary.averageResolutionMinutes ? `${(issuesSummary.averageResolutionMinutes / 60).toFixed(1)}h` : '0h'}
              </div>
              <div className={styles.metricLabel}>Avg Resolution Time</div>
              <div className={styles.metricSubtext}>Time to fix</div>
            </div>
          </div>
        </div>

        {/* Issues by Priority */}
        {priorityDistribution.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Issues by Priority</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={priorityDistribution.map(item => ({
                  label: item.priority,
                  value: item.count
                }))}
                color="#f97316"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Issues by Service */}
        {issuesByService.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Issues by Service</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Issues</th>
                    <th>Issue Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {issuesByService.slice(0, 10).map((service, index) => (
                    <tr key={index}>
                      <td>{service.serviceName}</td>
                      <td>{service.issueCount}</td>
                      <td>
                        <span className={`${styles.conversionRate} ${service.issueRate >= 50 ? styles.needsWork : styles.good}`}>
                          {service.issueRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Unresolved Issues */}
        {unresolvedIssues.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Unresolved Issues</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Priority</th>
                    <th>Description</th>
                    <th>Reported By</th>
                    <th>Age</th>
                    <th>Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {unresolvedIssues.slice(0, 10).map((issue, index) => (
                    <tr key={index}>
                      <td className={styles.orderNumber}>#{issue.orderId}</td>
                      <td>
                        <span className={`${styles.categoryBadge} ${
                          issue.priority === 'HIGH' ? styles.highPriority :
                          issue.priority === 'MEDIUM' ? styles.mediumPriority :
                          styles.lowPriority
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className={styles.description}>{issue.issueDescription}</td>
                      <td>{issue.reportedBy}</td>
                      <td>{issue.ageInDays} {issue.ageInDays === 1 ? 'day' : 'days'}</td>
                      <td>{moment(issue.createdAt).format('MMM DD, YYYY')}</td>
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
                {completionSummary.avgActualHours ? `${completionSummary.avgActualHours.toFixed(2)}h` : '0h'}
              </div>
              <div className={styles.metricLabel}>Avg Completion Time</div>
              <div className={styles.metricSubtext}>
                {completionSummary.totalCompletedOrders || 0} orders
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{completionSummary.onTimeOrders || 0}</div>
              <div className={styles.metricLabel}>On-Time Orders</div>
              <div className={styles.metricSubtext}>
                {completionSummary.onTimeRate ? `${completionSummary.onTimeRate.toFixed(1)}%` : '0%'} on-time rate
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{completionSummary.earlyOrders || 0}</div>
              <div className={styles.metricLabel}>Early Completions</div>
              <div className={styles.metricSubtext}>Ahead of schedule</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{completionSummary.lateOrders || 0}</div>
              <div className={styles.metricLabel}>Late Orders</div>
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
                    <th>Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {completionByService.map((service, index) => (
                    <tr key={index}>
                      <td>{service.serviceName}</td>
                      <td>{service.totalOrders}</td>
                      <td>{service.avgActualHours.toFixed(2)}h</td>
                      <td>
                        {service.avgEstimatedHours > 0
                          ? `${service.avgEfficiency.toFixed(1)}%`
                          : 'N/A'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Fastest Orders */}
        {fastestOrders.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>⚡ Fastest Completed Orders</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Service</th>
                    <th>Worker</th>
                    <th>Completion Time</th>
                  </tr>
                </thead>
                <tbody>
                  {fastestOrders.map((order, index) => (
                    <tr key={index}>
                      <td>#{order.orderNumber}</td>
                      <td>{order.serviceName}</td>
                      <td>{order.workerName}</td>
                      <td className={styles.successText}>
                        {order.actualHours ? Number(order.actualHours).toFixed(2) : '0.00'}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Slowest Orders */}
        {slowestOrders.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>🐌 Slowest Completed Orders</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Service</th>
                    <th>Worker</th>
                    <th>Completion Time</th>
                  </tr>
                </thead>
                <tbody>
                  {slowestOrders.map((order, index) => (
                    <tr key={index}>
                      <td>#{order.orderNumber}</td>
                      <td>{order.serviceName}</td>
                      <td>{order.workerName}</td>
                      <td className={styles.warningText}>
                        {order.actualHours ? Number(order.actualHours).toFixed(2) : '0.00'}h
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
        {servicePerformance.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Service Performance</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Inquiries</th>
                    <th>Conversions</th>
                    <th>Conv. Rate</th>
                    <th>Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {servicePerformance.map((service, index) => (
                    <tr key={index}>
                      <td>{service.serviceName}</td>
                      <td>{service.categoryName}</td>
                      <td>{service.inquiries}</td>
                      <td>{service.conversions}</td>
                      <td>{service.conversionRate.toFixed(1)}%</td>
                      <td>{service.avgTimeToConvertMinutes.toFixed(1)}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Category Performance */}
        {categoryPerformance.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Category Performance</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={categoryPerformance.map(cat => ({
                  label: cat.categoryName,
                  value: cat.inquiries
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
        {conversionServiceBreakdown.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Conversion Rate by Service</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Category</th>
                    <th>Requests</th>
                    <th>Converted</th>
                    <th>Rate</th>
                    <th>Revenue</th>
                    <th>Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {conversionServiceBreakdown.map((service, index) => (
                    <tr key={index}>
                      <td>{service.serviceName}</td>
                      <td>{service.categoryName}</td>
                      <td>{service.requests}</td>
                      <td>{service.conversions}</td>
                      <td>
                        <span className={`${styles.conversionRate} ${service.conversionRate >= 50 ? styles.good : styles.needsWork}`}>
                          {service.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td>${service.revenue.toFixed(2)}</td>
                      <td>{service.avgConversionTimeMinutes.toFixed(1)}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Top/Low Converting Services */}
        {(topConvertingServices.length > 0 || lowConvertingServices.length > 0) && (
          <div className={styles.twoColumnGrid}>
            {topConvertingServices.length > 0 && (
              <Card>
                <h3 className={styles.chartTitle}>🏆 Top Converting Services</h3>
                <div className={styles.tableContainer}>
                  <table className={styles.compactTable}>
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topConvertingServices.slice(0, 5).map((service, index) => (
                        <tr key={index}>
                          <td>{service.serviceName}</td>
                          <td className={styles.successText}>{service.conversionRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            {lowConvertingServices.length > 0 && (
              <Card>
                <h3 className={styles.chartTitle}>📉 Low Converting Services</h3>
                <div className={styles.tableContainer}>
                  <table className={styles.compactTable}>
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowConvertingServices.slice(0, 5).map((service, index) => (
                        <tr key={index}>
                          <td>{service.serviceName}</td>
                          <td className={styles.warningText}>{service.conversionRate.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
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
              <div className={styles.metricSubtext}>{workerSummary.totalOrdersProcessed || 0} orders processed</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                ${workerSummary.totalRevenue ? workerSummary.totalRevenue.toFixed(2) : '0.00'}
              </div>
              <div className={styles.metricLabel}>Total Revenue</div>
              <div className={styles.metricSubtext}>This period</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerSummary.avgCompletionTime ? `${workerSummary.avgCompletionTime.toFixed(1)}m` : '0m'}
              </div>
              <div className={styles.metricLabel}>Avg Completion Time</div>
              <div className={styles.metricSubtext}>Per worker (minutes)</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoStatsChart />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerSummary.totalWorkers > 0
                  ? (workerSummary.totalOrdersProcessed / workerSummary.totalWorkers).toFixed(1)
                  : 0}
              </div>
              <div className={styles.metricLabel}>Avg Orders/Worker</div>
              <div className={styles.metricSubtext}>Productivity</div>
            </div>
          </div>
        </div>

        {/* Worker Performance Table */}
        {workerStats.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Worker Performance Details</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Total Orders</th>
                    <th>Completed</th>
                    <th>Active</th>
                    <th>Avg Time</th>
                    <th>Success Rate</th>
                    <th>Revenue</th>
                    <th>Avg Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {workerStats.map((worker, index) => (
                    <tr key={index}>
                      <td className={styles.workerName}>
                        {worker.workerName || worker.discordUsername || `Worker ${worker.workerId}`}
                      </td>
                      <td>{worker.totalOrders}</td>
                      <td className={styles.successText}>{worker.completedOrders}</td>
                      <td>{worker.activeOrders}</td>
                      <td>{worker.avgCompletionMinutes ? worker.avgCompletionMinutes.toFixed(1) : '0.0'}m</td>
                      <td>
                        <span className={`${worker.successRate >= 80 ? styles.successText : worker.successRate >= 50 ? styles.warningText : styles.errorText}`}>
                          {worker.successRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className={styles.successText}>${worker.revenue.toFixed(2)}</td>
                      <td>${worker.avgOrderValue.toFixed(2)}</td>
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
              <div className={styles.metricLabel}>Customer Complaints</div>
              <div className={styles.metricSubtext}>
                {workerIssuesSummary.openIssues || 0} open, {(workerIssuesSummary.resolvedIssues || 0) + (workerIssuesSummary.closedIssues || 0)} closed
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.red}`}>
            <div className={styles.metricIcon}>
              <IoBan />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{workerIssuesSummary.urgentIssues || 0}</div>
              <div className={styles.metricLabel}>Urgent Issues</div>
              <div className={styles.metricSubtext}>{workerIssuesSummary.highPriorityIssues || 0} high priority</div>
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
              <div className={styles.metricLabel}>Avg Complaints/Worker</div>
              <div className={styles.metricSubtext}>{workerIssuesSummary.totalWorkers || 0} total workers</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {workerIssuesSummary.avgResolutionTimeHours
                  ? `${workerIssuesSummary.avgResolutionTimeHours.toFixed(1)}h`
                  : 'N/A'}
              </div>
              <div className={styles.metricLabel}>Avg Resolution Time</div>
              <div className={styles.metricSubtext}>{workerIssuesSummary.inReviewIssues || 0} in review</div>
            </div>
          </div>
        </div>

        {/* Worker Statistics */}
        {workerStatsData.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Customer Complaints by Worker</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Complaints</th>
                    <th>Open</th>
                    <th>Closed</th>
                    <th>Urgent</th>
                    <th>Avg Resolution</th>
                    <th>Complaint Rate</th>
                    <th>Last Complaint</th>
                  </tr>
                </thead>
                <tbody>
                  {workerStatsData.slice(0, 10).map((worker, index) => (
                    <tr key={worker.workerId || index}>
                      <td className={styles.workerName}>
                        {worker.workerName}
                      </td>
                      <td className={styles.issueCount}>{worker.totalIssues}</td>
                      <td>{worker.openIssues}</td>
                      <td className={styles.successText}>{worker.resolvedIssues}</td>
                      <td className={worker.urgentIssues > 0 ? styles.errorText : ''}>
                        {worker.urgentIssues}
                      </td>
                      <td>
                        {worker.avgResolutionHours
                          ? `${worker.avgResolutionHours.toFixed(1)}h`
                          : 'N/A'}
                      </td>
                      <td className={worker.issueRate > 20 ? styles.warningText : ''}>
                        {typeof worker.issueRate === 'number'
                          ? `${worker.issueRate.toFixed(1)}% (${worker.ordersWithIssues}/${worker.ordersInPeriod})`
                          : 'N/A'}
                      </td>
                      <td>{moment(worker.lastIssueDate).format('MMM DD, YYYY')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Recent Issues */}
        {recentIssuesData.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Recent Issues (Last 10)</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Worker</th>
                    <th>Service</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Resolution Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIssuesData.map((issue, index) => (
                    <tr key={issue.issueId || index}>
                      <td>#{issue.orderId?.toString().slice(-4) || 'N/A'}</td>
                      <td className={styles.workerName}>
                        {issue.workerName}
                      </td>
                      <td>{issue.serviceName}</td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {issue.description}
                      </td>
                      <td>
                        <span className={`${styles.categoryBadge} ${
                          issue.status === 'RESOLVED' ? styles.successText :
                          issue.status === 'IN_REVIEW' ? styles.warningText :
                          issue.status === 'OPEN' ? styles.errorText : ''
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.categoryBadge} ${
                          issue.priority === 'URGENT' ? styles.errorText :
                          issue.priority === 'HIGH' ? styles.warningText : ''
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td>{moment(issue.createdAt).format('MMM DD, HH:mm')}</td>
                      <td>
                        {issue.resolutionTimeHours
                          ? `${issue.resolutionTimeHours.toFixed(1)}h`
                          : 'Pending'}
                      </td>
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
