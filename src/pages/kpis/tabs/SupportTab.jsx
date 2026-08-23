import React, { useState, useEffect } from 'react'
import { KPISection } from '../../../components/dashboard'
import Card from '../../../components/atoms/cards'
import LineChart from '../../../components/atoms/charts/LineChart'
import BarChart from '../../../components/atoms/charts/BarChart'
import kpiController from '../../../controllers/kpi'
import DateRange, { toQuery } from '../../../components/molecules/dateRange'
import { notify } from '../../../config/error'
import moment from 'moment'
import {
  IoSpeedometer, IoCheckmarkCircle, IoChatbubbles, IoAlertCircle,
  IoPeople, IoSwapHorizontal, IoTime
} from 'react-icons/io5'
import styles from './SupportTab.module.scss'

/**
 * SupportTab - Support & Customer Service metrics
 * Contains: Response Time, Ticket Conversion, Peak Times, Reply Speed
 */
const SupportTab = () => {
  // Support Response Time State
  const [supportResponseTime, setSupportResponseTime] = useState(null)
  const [supportRange, setSupportRange] = useState({ preset: 'this_month' })
  const [slaTarget, setSlaTarget] = useState(15)

  // Ticket Conversion State
  const [ticketConversion, setTicketConversion] = useState(null)
  const [conversionRange, setConversionRange] = useState({ preset: 'this_month' })

  // Peak Times State
  const [peakTimes, setPeakTimes] = useState(null)
  const [peakTimesRange, setPeakTimesRange] = useState({ preset: 'this_month' })

  // Reply Speed State
  const [replySpeed, setReplySpeed] = useState(null)
  const [replySpeedRange, setReplySpeedRange] = useState({ preset: 'this_month' })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllSupportKPIs()
  }, [supportRange, slaTarget, conversionRange, peakTimesRange, replySpeedRange])

  const fetchAllSupportKPIs = async () => {
    setLoading(true)
    await Promise.all([
      fetchSupportResponseTime(),
      fetchTicketConversion(),
      fetchPeakTimes(),
      fetchReplySpeed()
    ])
    setLoading(false)
  }

  // ============================================
  // SUPPORT RESPONSE TIME KPI
  // ============================================

  const fetchSupportResponseTime = async () => {
    try {
      const res = await kpiController.getSupportResponseTime({
        period: supportRange,
        slaTarget
      })

      if (res && res.error === false) {
        setSupportResponseTime(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load support response time data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading support response time data', type: 'error' })
    }
  }

  // ============================================
  // TICKET-TO-ORDER CONVERSION KPI
  // ============================================

  const fetchTicketConversion = async () => {
    try {
      const res = await kpiController.getTicketToOrderConversion(toQuery(conversionRange))

      if (res && res.error === false) {
        setTicketConversion(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load ticket conversion data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading ticket conversion data', type: 'error' })
    }
  }

  // ============================================
  // PEAK TICKET TIMES KPI
  // ============================================

  const fetchPeakTimes = async () => {
    try {
      const res = await kpiController.getPeakTicketTimes(toQuery(peakTimesRange))

      if (res && res.error === false) {
        setPeakTimes(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load peak times data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading peak times data', type: 'error' })
    }
  }

  // ============================================
  // SUPPORT REPLY SPEED KPI
  // ============================================

  const fetchReplySpeed = async () => {
    try {
      const res = await kpiController.getSupportReplySpeed(toQuery(replySpeedRange))

      if (res && res.error === false) {
        setReplySpeed(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load reply speed data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading reply speed data', type: 'error' })
    }
  }

  // Extract data for Support Response Time
  const supportSummary = supportResponseTime?.summary || {}
  const responseDistribution = supportResponseTime?.distribution || {}
  const ticketsWithoutResponse = supportResponseTime?.ticketsWithoutResponse || []
  const slowestResponses = supportResponseTime?.slowestResponses || []
  const supportAgentPerformance = supportResponseTime?.supportAgentPerformance || []
  const responseByTicketType = supportResponseTime?.responseByTicketType || []
  const responseByDay = supportResponseTime?.responseByDay || []

  // Extract data for Ticket Conversion
  const conversionSummary = ticketConversion?.summary || {}
  const conversionDistribution = ticketConversion?.distribution || {}
  const conversionByTicketType = ticketConversion?.conversionByTicketType || []
  const conversionByService = ticketConversion?.conversionByService || []
  const fastestConversions = ticketConversion?.fastestConversions || []
  const slowestConversions = ticketConversion?.slowestConversions || []

  // Extract data for Peak Times
  const peakSummary = peakTimes?.summary || {}
  const hourlyDistribution = peakTimes?.hourlyDistribution || []
  const dayOfWeekDistribution = peakTimes?.dailyDistribution || []
  // Generate peak and quiet hours from hourlyDistribution
  const peakHours = [...(peakTimes?.hourlyDistribution || [])]
    .sort((a, b) => b.count - a.count)
    .filter(item => item.count > 0)
  const quietHours = [...(peakTimes?.hourlyDistribution || [])]
    .sort((a, b) => a.count - b.count)
    .filter(item => item.count >= 0)

  // Extract data for Reply Speed
  const replySummary = replySpeed?.summary || {}
  const replyDistribution = replySpeed?.distribution || {}
  const agentReplyPerformance = replySpeed?.replySpeedByAgent || []
  const slowestReplies = replySpeed?.slowestReplies || []

  return (
    <div className={styles.supportTab}>
      <div className={styles.tabHeader}>
        <h1 className={styles.tabTitle}>🎫 Support Metrics</h1>
        <p className={styles.tabDescription}>
          Monitor support response times, ticket conversion, peak activity periods, and reply speed
        </p>
      </div>

      {/* ============================================
          SUPPORT FIRST RESPONSE TIME KPI
          ============================================ */}
      <KPISection
        title="Support First Response Time"
        icon="⏱️"
        description="Track how quickly support team responds to new tickets"
        defaultExpanded={true}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <DateRange value={supportRange} onChange={setSupportRange} />

          <div className={styles.slaControl}>
            <label htmlFor="slaTarget">SLA Target (minutes):</label>
            <input
              id="slaTarget"
              type="number"
              min="1"
              max="240"
              value={slaTarget}
              onChange={(e) => setSlaTarget(Number(e.target.value))}
              className={styles.slaInput}
            />
          </div>
        </div>

        {/* Primary KPI Cards */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoSpeedometer />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {supportSummary.averageResponseTimeMinutes
                  ? `${supportSummary.averageResponseTimeMinutes.toFixed(1)}m`
                  : '0m'}
              </div>
              <div className={styles.metricLabel}>Avg Response Time</div>
              <div className={styles.metricSubtext}>
                Median: {supportSummary.medianResponseTimeMinutes?.toFixed(1) || 0}m
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {supportSummary.slaComplianceRate
                  ? `${supportSummary.slaComplianceRate.toFixed(1)}%`
                  : '0%'}
              </div>
              <div className={styles.metricLabel}>SLA Compliance</div>
              <div className={styles.metricSubtext}>
                Target: {'<'} {supportSummary.slaTargetMinutes || slaTarget} minutes
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoChatbubbles />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{supportSummary.ticketsWithResponse || 0}</div>
              <div className={styles.metricLabel}>Tickets Responded</div>
              <div className={styles.metricSubtext}>
                Total: {supportSummary.totalTickets || 0} tickets
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{supportSummary.ticketsWithoutResponse || 0}</div>
              <div className={styles.metricLabel}>Unanswered Tickets</div>
              <div className={styles.metricSubtext}>
                {supportSummary.totalTickets > 0
                  ? `${((supportSummary.ticketsWithoutResponse / supportSummary.totalTickets) * 100).toFixed(1)}%`
                  : '0%'} of total
              </div>
            </div>
          </div>
        </div>

        {/* Response Time Distribution */}
        {responseDistribution && Object.keys(responseDistribution).length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Response Time Distribution</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={[
                  { label: '< 5 min', value: responseDistribution.under5min?.count || 0 },
                  { label: '5-15 min', value: responseDistribution.min5to15?.count || 0 },
                  { label: '15-30 min', value: responseDistribution.min15to30?.count || 0 },
                  { label: '30-60 min', value: responseDistribution.min30to60?.count || 0 },
                  { label: '1-4 hours', value: responseDistribution.over1hour?.count || 0 },
                  { label: '> 4 hours', value: responseDistribution.over4hours?.count || 0 }
                ]}
                color="#3b82f6"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Support Agent Performance */}
        {supportAgentPerformance.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>
              <IoPeople /> Support Agent Performance
            </h3>
            <div className={styles.tableContainer}>
              <table className={styles.agentTable}>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Tickets</th>
                    <th>Avg Response</th>
                    <th>Median</th>
                    <th>SLA Rate</th>
                    <th>Fastest</th>
                    <th>Slowest</th>
                  </tr>
                </thead>
                <tbody>
                  {supportAgentPerformance.map((agent) => (
                    <tr key={agent.supportUserId}>
                      <td className={styles.agentName}>
                        <div>{agent.supportName}</div>
                        {agent.discordUsername && (
                          <div className={styles.discordTag}>@{agent.discordUsername}</div>
                        )}
                      </td>
                      <td className={styles.ticketCount}>{agent.ticketsResponded}</td>
                      <td className={styles.avgResponse}>
                        {agent.averageResponseTimeMinutes?.toFixed(1) || 0}m
                      </td>
                      <td>{agent.medianResponseTimeMinutes?.toFixed(1) || 0}m</td>
                      <td>
                        <span
                          className={`${styles.slaRate} ${
                            (agent.slaComplianceRate || 0) >= 90
                              ? styles.excellent
                              : (agent.slaComplianceRate || 0) >= 70
                              ? styles.good
                              : styles.needsImprovement
                          }`}
                        >
                          {agent.slaComplianceRate?.toFixed(1) || 0}%
                        </span>
                      </td>
                      <td className={styles.fastest}>{agent.fastestResponseMinutes?.toFixed(1) || 0}m</td>
                      <td className={styles.slowest}>{agent.slowestResponseMinutes?.toFixed(1) || 0}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Unanswered Tickets Alert */}
        {ticketsWithoutResponse.length > 0 && (
          <Card>
            <div className={styles.alertCard}>
              <div className={styles.alertHeader}>
                <IoAlertCircle className={styles.alertIcon} />
                <h3>Unanswered Tickets ({ticketsWithoutResponse.length})</h3>
              </div>
              <div className={styles.tableContainer}>
                <table className={styles.unansweredTable}>
                  <thead>
                    <tr>
                      <th>Ticket #</th>
                      <th>Type</th>
                      <th>Created</th>
                      <th>Time Elapsed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketsWithoutResponse.slice(0, 10).map((ticket) => (
                      <tr key={ticket.ticketId}>
                        <td className={styles.ticketNumber}>#{ticket.ticketNumber}</td>
                        <td>
                          <span className={styles.ticketTypeBadge}>{ticket.ticketType}</span>
                        </td>
                        <td>{moment(ticket.ticketCreatedAt).format('MMM DD, YYYY HH:mm')}</td>
                        <td className={styles.timeElapsed}>
                          {moment(ticket.ticketCreatedAt).fromNow()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}

        {/* Response Time by Ticket Type */}
        {responseByTicketType.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Response Time by Ticket Type</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Ticket Type</th>
                    <th>Count</th>
                    <th>Avg Response</th>
                    <th>Median</th>
                    <th>SLA Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {responseByTicketType.map((type) => (
                    <tr key={type.ticketType}>
                      <td>
                        <span className={styles.ticketTypeBadge}>{type.ticketType}</span>
                      </td>
                      <td>{type.ticketCount}</td>
                      <td>{type.averageResponseTimeMinutes?.toFixed(1) || 0}m</td>
                      <td>{type.medianResponseTimeMinutes?.toFixed(1) || 0}m</td>
                      <td>
                        <span
                          className={`${styles.slaRate} ${
                            (type.slaComplianceRate || 0) >= 90
                              ? styles.excellent
                              : (type.slaComplianceRate || 0) >= 70
                              ? styles.good
                              : styles.needsImprovement
                          }`}
                        >
                          {type.slaComplianceRate?.toFixed(1) || 0}%
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
          TICKET-TO-ORDER CONVERSION TIME KPI
          ============================================ */}
      <KPISection
        title="Ticket-to-Order Conversion Time"
        icon="💱"
        description="Track how quickly support tickets convert into orders"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Selector */}
        <div className={styles.controls}>
          <DateRange value={conversionRange} onChange={setConversionRange} />
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoSwapHorizontal />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {conversionSummary.averageConversionMinutes
                  ? `${conversionSummary.averageConversionMinutes.toFixed(0)}m`
                  : '0m'}
              </div>
              <div className={styles.metricLabel}>Avg Conversion Time</div>
              <div className={styles.metricSubtext}>
                Median: {conversionSummary.medianConversionMinutes?.toFixed(0) || 0}m
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{conversionSummary.ticketsWithOrders || 0}</div>
              <div className={styles.metricLabel}>Converted Tickets</div>
              <div className={styles.metricSubtext}>
                {conversionSummary.conversionRate?.toFixed(1) || 0}% conversion rate
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {conversionSummary.fastestConversionMinutes
                  ? `${conversionSummary.fastestConversionMinutes.toFixed(0)}m`
                  : '0m'}
              </div>
              <div className={styles.metricLabel}>Fastest Conversion</div>
              <div className={styles.metricSubtext}>Best time</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoTime />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {conversionSummary.slowestConversionMinutes
                  ? `${conversionSummary.slowestConversionMinutes.toFixed(0)}m`
                  : '0m'}
              </div>
              <div className={styles.metricLabel}>Slowest Conversion</div>
              <div className={styles.metricSubtext}>Needs improvement</div>
            </div>
          </div>
        </div>

        {/* Conversion Distribution */}
        {conversionDistribution && Object.keys(conversionDistribution).length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Conversion Time Distribution</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={[
                  { label: '< 5 min', value: conversionDistribution.under5min?.count || 0 },
                  { label: '5-15 min', value: conversionDistribution.min5to15?.count || 0 },
                  { label: '15-30 min', value: conversionDistribution.min15to30?.count || 0 },
                  { label: '30-60 min', value: conversionDistribution.min30to60?.count || 0 },
                  { label: '> 1 hour', value: conversionDistribution.over1hour?.count || 0 },
                  { label: '> 1 day', value: conversionDistribution.over1day?.count || 0 }
                ]}
                color="#06b6d4"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Conversion by Ticket Type and Service */}
        <div className={styles.twoColumnGrid}>
          {conversionByTicketType.length > 0 && (
            <Card>
              <h3 className={styles.chartTitle}>Conversion by Ticket Type</h3>
              <div className={styles.tableContainer}>
                <table className={styles.compactTable}>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Converted</th>
                      <th>Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversionByTicketType.map((type) => (
                      <tr key={type.ticketType}>
                        <td><span className={styles.ticketTypeBadge}>{type.ticketType}</span></td>
                        <td>{Math.round(type.ticketCount * (type.conversionRate / 100))}</td>
                        <td>{type.avgConversionMinutes?.toFixed(0) || 0}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {conversionByService.length > 0 && (
            <Card>
              <h3 className={styles.chartTitle}>Conversion by Service</h3>
              <div className={styles.tableContainer}>
                <table className={styles.compactTable}>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Converted</th>
                      <th>Avg Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversionByService.map((service, index) => (
                      <tr key={index}>
                        <td>{service.serviceName}</td>
                        <td>{service.orderCount}</td>
                        <td>{service.avgConversionMinutes?.toFixed(0) || 0}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </KPISection>

      {/* ============================================
          PEAK TICKET TIMES KPI
          ============================================ */}
      <KPISection
        title="Peak Ticket Times"
        icon="📅"
        description="Identify when support requests are most common"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Selector */}
        <div className={styles.controls}>
          <DateRange value={peakTimesRange} onChange={setPeakTimesRange} />
        </div>

        {/* Hourly Distribution */}
        {hourlyDistribution.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Tickets by Hour of Day</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={hourlyDistribution.map(item => ({
                  label: `${item.hour}:00`,
                  value: item.count
                }))}
                color="#f97316"
                height={300}
                showGrid={true}
                showValues={false}
              />
            </div>
          </Card>
        )}

        {/* Day of Week Distribution */}
        {dayOfWeekDistribution.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Tickets by Day of Week</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={dayOfWeekDistribution.map(item => ({
                  label: item.dayName,
                  value: item.count
                }))}
                color="#8b5cf6"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Peak & Quiet Hours */}
        <div className={styles.twoColumnGrid}>
          {peakHours.length > 0 && (
            <Card>
              <h3 className={styles.chartTitle}>Peak Hours</h3>
              <div className={styles.peakTimesList}>
                {peakHours.slice(0, 5).map((item, index) => (
                  <div key={index} className={styles.peakTimeItem}>
                    <div className={styles.peakTimeLabel}>
                      #{index + 1} - {item.hour}:00 - {item.hour + 1}:00
                    </div>
                    <div className={styles.peakTimeValue}>{item.count} tickets</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {quietHours.length > 0 && (
            <Card>
              <h3 className={styles.chartTitle}>Quietest Hours</h3>
              <div className={styles.peakTimesList}>
                {quietHours.slice(0, 5).map((item, index) => (
                  <div key={index} className={styles.peakTimeItem}>
                    <div className={styles.peakTimeLabel}>
                      #{index + 1} - {item.hour}:00 - {item.hour + 1}:00
                    </div>
                    <div className={styles.peakTimeValue}>{item.count} tickets</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </KPISection>

      {/* ============================================
          SUPPORT REPLY SPEED KPI
          ============================================ */}
      <KPISection
        title="Support Reply Speed (Follow-up Messages)"
        icon="⚡"
        description="Track how quickly support responds to customer follow-ups"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Selector */}
        <div className={styles.controls}>
          <DateRange value={replySpeedRange} onChange={setReplySpeedRange} />
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoSpeedometer />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {replySummary.averageReplyMinutes
                  ? `${replySummary.averageReplyMinutes.toFixed(1)}m`
                  : '0m'}
              </div>
              <div className={styles.metricLabel}>Avg Reply Speed</div>
              <div className={styles.metricSubtext}>
                Median: {replySummary.medianReplyMinutes?.toFixed(1) || 0}m
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoChatbubbles />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{replySummary.totalSupportReplies || 0}</div>
              <div className={styles.metricLabel}>Total Replies</div>
              <div className={styles.metricSubtext}>Follow-up messages</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {replySummary.fastestReplyMinutes
                  ? `${replySummary.fastestReplyMinutes.toFixed(1)}m`
                  : '0m'}
              </div>
              <div className={styles.metricLabel}>Fastest Reply</div>
              <div className={styles.metricSubtext}>Best time</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoAlertCircle />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {replySummary.slowestReplyMinutes
                  ? `${replySummary.slowestReplyMinutes.toFixed(1)}m`
                  : '0m'}
              </div>
              <div className={styles.metricLabel}>Slowest Reply</div>
              <div className={styles.metricSubtext}>Needs attention</div>
            </div>
          </div>
        </div>

        {/* Reply Time Distribution */}
        {replyDistribution && Object.keys(replyDistribution).length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Reply Speed Distribution</h3>
            <div className={styles.chartContainer}>
              <BarChart
                data={[
                  { label: '< 5 min', value: replyDistribution.under5min?.count || 0 },
                  { label: '5-15 min', value: replyDistribution.min5to15?.count || 0 },
                  { label: '15-30 min', value: replyDistribution.min15to30?.count || 0 },
                  { label: '30-60 min', value: replyDistribution.min30to60?.count || 0 },
                  { label: '1-6 hours', value: replyDistribution.hour1to6?.count || 0 },
                  { label: '> 6 hours', value: replyDistribution.over6hours?.count || 0 }
                ]}
                color="#10b981"
                height={300}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>
        )}

        {/* Agent Reply Performance */}
        {agentReplyPerformance.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Agent Reply Performance</h3>
            <div className={styles.tableContainer}>
              <table className={styles.compactTable}>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Replies</th>
                    <th>Avg Time</th>
                  </tr>
                </thead>
                <tbody>
                  {agentReplyPerformance.slice(0, 10).map((agent) => (
                    <tr key={agent.agentId}>
                      <td className={styles.agentName}>{agent.agentName}</td>
                      <td>{agent.totalReplies}</td>
                      <td>{agent.avgReplyMinutes?.toFixed(1) || 0}m</td>
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

export default SupportTab
