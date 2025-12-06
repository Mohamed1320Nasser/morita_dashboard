import React, { useEffect, useState } from 'react'
import styles from './serviceAnalytics.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import adminController from '@/controllers/admin'
import LineChart from '@/components/atoms/charts/LineChart'
import BarChart from '@/components/atoms/charts/BarChart'
import moment from 'moment'
import { IoTrendingUp, IoCart, IoCash, IoStatsChart, IoEye } from 'react-icons/io5'

const ServiceAnalyticsPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [topServices, setTopServices] = useState([])
  const [categoryStats, setCategoryStats] = useState([])
  const [revenueTrend, setRevenueTrend] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  const [isCustomRange, setIsCustomRange] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortBy, setSortBy] = useState('revenue')
  const [selectedService, setSelectedService] = useState(null)

  useEffect(() => {
    fetchAnalytics()
  }, [selectedPeriod, isCustomRange, startDate, endDate, sortBy])

  const fetchAnalytics = async () => {
    try {
      setPageLoading(true)

      // Prepare date parameters
      let dateParams = {}
      if (isCustomRange && startDate && endDate) {
        dateParams = { startDate, endDate }
      } else {
        dateParams = { period: selectedPeriod }
      }

      const [overviewRes, topServicesRes, categoryRes, trendRes] = await Promise.all([
        adminController.getServiceOverview(isCustomRange ? { startDate, endDate } : {}),
        adminController.getTopServices({ ...dateParams, limit: 10, sortBy }),
        adminController.getCategoryStats(isCustomRange ? { startDate, endDate } : {}),
        adminController.getServiceRevenueTrend(dateParams),
      ])

      if (overviewRes && overviewRes.success) {
        setOverview(overviewRes.data)
      }

      if (topServicesRes && topServicesRes.success) {
        setTopServices(topServicesRes.data)
      }

      if (categoryRes && categoryRes.success) {
        setCategoryStats(categoryRes.data)
      }

      if (trendRes && trendRes.success) {
        const chartData = Array.isArray(trendRes.data)
          ? trendRes.data.map((item) => ({
              label: moment(item.date).format('MMM DD'),
              value: item.revenue || 0,
              count: item.orderCount || 0,
            }))
          : []
        setRevenueTrend(chartData)
      }
    } catch (e) {
      console.log('Error loading service analytics', e)
    } finally {
      setPageLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const getPeriodText = () => {
    if (isCustomRange && startDate && endDate) {
      return `${moment(startDate).format('MMM DD, YYYY')} - ${moment(endDate).format('MMM DD, YYYY')}`
    }
    return `Last ${selectedPeriod} days`
  }

  const viewServiceDetails = async (serviceId) => {
    try {
      const dateParams = isCustomRange && startDate && endDate ? { startDate, endDate } : {}
      const res = await adminController.getServiceDetails(serviceId, dateParams)
      if (res && res.success) {
        setSelectedService(res.data)
      }
    } catch (e) {
      console.log('Error loading service details', e)
    }
  }

  const closeServiceDetails = () => {
    setSelectedService(null)
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.serviceAnalytics}>
      <PageHead current="Service Analytics">
        <Head title="Service Analytics" noButton>
          Performance insights and revenue tracking by service
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

        {/* Custom Date Range */}
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

        {/* Overview Metrics */}
        {overview && (
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.blue}`}>
                <IoStatsChart />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>{overview.activeServices}</div>
                <div className={styles.metricLabel}>Active Services</div>
                <div className={styles.metricSubtext}>{overview.totalServices} total services</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.green}`}>
                <IoCart />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>{overview.totalOrders}</div>
                <div className={styles.metricLabel}>Total Orders</div>
                <div className={styles.metricSubtext}>{getPeriodText()}</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.purple}`}>
                <IoCash />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>{formatCurrency(overview.totalRevenue)}</div>
                <div className={styles.metricLabel}>Total Revenue</div>
                <div className={styles.metricSubtext}>From completed orders</div>
              </div>
            </div>

            <div className={styles.metricCard}>
              <div className={`${styles.metricIcon} ${styles.orange}`}>
                <IoTrendingUp />
              </div>
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>{formatCurrency(overview.averageOrderValue)}</div>
                <div className={styles.metricLabel}>Avg Order Value</div>
                <div className={styles.metricSubtext}>Per completed order</div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Trend Chart */}
        <Card>
          <h3 className={styles.chartTitle}>Service Revenue Trend</h3>
          <div className={styles.chartContainer}>
            <LineChart
              data={revenueTrend}
              color="#3b82f6"
              height={300}
              showArea={true}
              showGrid={true}
              formatValue={(value) => `$${parseFloat(value || 0).toFixed(0)}`}
            />
          </div>
        </Card>

        {/* Sort Controls */}
        <div className={styles.sortControls}>
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={styles.sortSelect}>
            <option value="revenue">Revenue</option>
            <option value="orders">Order Count</option>
            <option value="avgValue">Avg Order Value</option>
            <option value="completionRate">Completion Rate</option>
          </select>
        </div>

        {/* Top Services Table */}
        <Card>
          <h3 className={styles.chartTitle}>Top Performing Services</h3>
          <div className={styles.tableContainer}>
            <table className={styles.servicesTable}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Service Name</th>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                  <th>Avg Value</th>
                  <th>Completion Rate</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {topServices.map((service, index) => (
                  <tr key={service.serviceId}>
                    <td className={styles.rank}>
                      <div className={`${styles.rankBadge} ${index < 3 ? styles.top3 : ''}`}>
                        #{index + 1}
                      </div>
                    </td>
                    <td className={styles.serviceName}>{service.serviceName}</td>
                    <td>{service.categoryName}</td>
                    <td>{service.orderCount}</td>
                    <td className={styles.revenue}>{formatCurrency(service.totalRevenue)}</td>
                    <td>{formatCurrency(service.averageOrderValue)}</td>
                    <td>
                      <div className={styles.completionRate}>
                        <div className={styles.rateBar}>
                          <div
                            className={styles.rateBarFill}
                            style={{ width: `${service.completionRate}%` }}
                          />
                        </div>
                        <span>{service.completionRate}%</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => viewServiceDetails(service.serviceId)}
                      >
                        <IoEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Category Distribution */}
        {categoryStats.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Orders by Category</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={categoryStats.map((cat) => ({
                  label: cat.categoryName,
                  value: cat.orderCount,
                }))}
                color="#22c55e"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Category Stats Table */}
        <Card>
          <h3 className={styles.chartTitle}>Category Performance</h3>
          <div className={styles.tableContainer}>
            <table className={styles.categoryTable}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>% of Total</th>
                  <th>Revenue</th>
                  <th>Avg Value</th>
                  <th>Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {categoryStats.map((category) => (
                  <tr key={category.categoryId}>
                    <td className={styles.categoryName}>{category.categoryName}</td>
                    <td>{category.orderCount}</td>
                    <td>{category.orderPercentage}%</td>
                    <td className={styles.revenue}>{formatCurrency(category.revenue)}</td>
                    <td>{formatCurrency(category.averageOrderValue)}</td>
                    <td>{category.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>

      {/* Service Details Modal */}
      {selectedService && (
        <div className={styles.modal} onClick={closeServiceDetails}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedService.service.name}</h2>
              <button className={styles.closeBtn} onClick={closeServiceDetails}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.serviceDetailGrid}>
                <div className={styles.detailCard}>
                  <h4>Orders</h4>
                  <p className={styles.bigNumber}>{selectedService.orders.total}</p>
                  <div className={styles.detailBreakdown}>
                    <span>Completed: {selectedService.orders.completed}</span>
                    <span>In Progress: {selectedService.orders.inProgress}</span>
                    <span>Pending: {selectedService.orders.pending}</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <h4>Revenue</h4>
                  <p className={styles.bigNumber}>{formatCurrency(selectedService.revenue.total)}</p>
                  <div className={styles.detailBreakdown}>
                    <span>Avg: {formatCurrency(selectedService.revenue.average)}</span>
                    <span>Worker Payouts: {formatCurrency(selectedService.revenue.workerPayouts)}</span>
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <h4>Performance</h4>
                  <p className={styles.bigNumber}>{selectedService.performance.completionRate}%</p>
                  <div className={styles.detailBreakdown}>
                    <span>Avg Completion: {selectedService.performance.avgCompletionTime}h</span>
                    <span>Cancellation Rate: {selectedService.performance.cancellationRate}%</span>
                  </div>
                </div>
              </div>

              {selectedService.timeline && selectedService.timeline.length > 0 && (
                <div className={styles.timelineSection}>
                  <h4>Revenue Timeline</h4>
                  <LineChart
                    data={selectedService.timeline.map((item) => ({
                      label: moment(item.date).format('MMM DD'),
                      value: item.revenue || 0,
                      count: item.orderCount || 0,
                    }))}
                    color="#a855f7"
                    height={200}
                    showArea={true}
                    showGrid={true}
                    formatValue={(value) => `$${parseFloat(value || 0).toFixed(0)}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceAnalyticsPage
