import React, { useState, useEffect } from 'react'
import { KPISection } from '../../../components/dashboard'
import Card from '../../../components/atoms/cards'
import LineChart from '../../../components/atoms/charts/LineChart'
import BarChart from '../../../components/atoms/charts/BarChart'
import PieChart from '../../../components/atoms/charts/PieChart'
import kpiController from '../../../controllers/kpi'
import DateRange, { toQuery } from '../../../components/molecules/dateRange'
import { notify } from '../../../config/error'
import moment from 'moment'
import {
  IoTrendingUp, IoTrendingDown, IoPeople, IoLogIn, IoLogOut,
  IoBan, IoWarning, IoRepeat, IoChatbubbles, IoSparkles
} from 'react-icons/io5'
import styles from './CommunityTab.module.scss'

/**
 * CommunityTab - Community & Member metrics
 * Contains: Member Growth, Repeat Customers, Discord Engagement
 */
const CommunityTab = () => {
  // Member Growth State
  const [memberGrowth, setMemberGrowth] = useState(null)
  const [growthRange, setGrowthRange] = useState({ preset: 'this_month' })

  // Repeat Customers State
  const [repeatCustomers, setRepeatCustomers] = useState(null)
  const [repeatRange, setRepeatRange] = useState({ preset: 'all' })

  // Discord Engagement State
  const [discordEngagement, setDiscordEngagement] = useState(null)
  const [engagementRange, setEngagementRange] = useState({ preset: 'this_month' })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllCommunityKPIs()
  }, [growthRange, repeatRange, engagementRange])

  const fetchAllCommunityKPIs = async () => {
    setLoading(true)
    await Promise.all([
      fetchMemberGrowth(),
      fetchRepeatCustomers(),
      fetchDiscordEngagement()
    ])
    setLoading(false)
  }

  // ============================================
  // MEMBER GROWTH KPI
  // ============================================

  const fetchMemberGrowth = async () => {
    try {
      const res = await kpiController.getMemberGrowth(toQuery(growthRange))

      if (res && res.error === false) {
        setMemberGrowth(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load member growth data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading member growth data', type: 'error' })
    }
  }

  const getGrowthIcon = (netGrowth) => {
    if (netGrowth > 0) return <IoTrendingUp />
    if (netGrowth < 0) return <IoTrendingDown />
    return <IoPeople />
  }

  const getGrowthColor = (netGrowth) => {
    if (netGrowth > 0) return styles.green
    if (netGrowth < 0) return styles.red
    return styles.gray
  }

  const getPeriodText = () => {
    const query = toQuery(growthRange)
    if (!query.startDate) return 'All time'
    return `${moment(query.startDate).format('MMM DD')} - ${moment(
      query.endDate || new Date()
    ).format('MMM DD')}`
  }

  // ============================================
  // REPEAT CUSTOMERS KPI
  // ============================================

  const fetchRepeatCustomers = async () => {
    try {
      const res = await kpiController.getRepeatCustomers(toQuery(repeatRange))

      if (res && res.error === false) {
        setRepeatCustomers(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load repeat customers data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading repeat customers data', type: 'error' })
    }
  }

  // ============================================
  // DISCORD ENGAGEMENT KPI
  // ============================================

  const fetchDiscordEngagement = async () => {
    try {
      const res = await kpiController.getDiscordEngagement(toQuery(engagementRange))

      if (res && res.error === false) {
        setDiscordEngagement(res.data)
      } else {
        notify({ message: res?.msg || 'Failed to load Discord engagement data', type: 'error' })
      }
    } catch (error) {
      notify({ message: 'Error loading Discord engagement data', type: 'error' })
    }
  }

  // Extract data
  const summary = memberGrowth?.summary || {}
  const breakdown = memberGrowth?.breakdown || {}
  const dailyData = memberGrowth?.dailyData || []
  const leaveReasons = memberGrowth?.leaveReasons || []

  const repeatSummary = repeatCustomers?.summary || {}
  const distribution = repeatCustomers?.distribution || {}
  const topCustomers = repeatCustomers?.topCustomers || []
  const cohortAnalysis = repeatCustomers?.cohortAnalysis || []

  // DEBUG: Log cohort data
  if (cohortAnalysis.length > 0) {
    console.log('Cohort Analysis Data:', cohortAnalysis)
  }

  const engagementSummary = discordEngagement?.summary || {}
  const topEngagedUsers = discordEngagement?.topUsers || []
  const channelActivity = discordEngagement?.topChannels || []
  const engagementTrend = discordEngagement?.dailyTrend || []
  const activeRanks = discordEngagement?.activeRanks || []

  return (
    <div className={styles.communityTab}>
      <div className={styles.tabHeader}>
        <h1 className={styles.tabTitle}>👥 Community Metrics</h1>
        <p className={styles.tabDescription}>
          Track member growth, customer loyalty, and Discord community engagement
        </p>
      </div>

      {/* ============================================
          MEMBER GROWTH RATE KPI
          ============================================ */}
      <KPISection
        title="Member Growth Rate"
        icon="📊"
        description="Track member joins, leaves, kicks, bans, and net growth over time"
        defaultExpanded={true}
        collapsible={true}
      >
        {/* Period Controls */}
        <div className={styles.controls}>
          <DateRange value={growthRange} onChange={setGrowthRange} />
        </div>

        {/* Primary KPI Cards */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoPeople />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{summary.totalMembers || 0}</div>
              <div className={styles.metricLabel}>Total Members</div>
              <div className={styles.metricSubtext}>Current server population</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoLogIn />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{summary.joins || 0}</div>
              <div className={styles.metricLabel}>New Joins</div>
              <div className={styles.metricSubtext}>{getPeriodText()}</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoLogOut />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{summary.totalLeaves || 0}</div>
              <div className={styles.metricLabel}>Total Leaves</div>
              <div className={styles.metricSubtext}>
                {summary.leaves || 0} voluntary • {summary.kicks || 0} kicks • {summary.bans || 0} bans
              </div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${getGrowthColor(summary.netGrowth)}`}>
            <div className={styles.metricIcon}>
              {getGrowthIcon(summary.netGrowth)}
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>
                {summary.netGrowth > 0 ? '+' : ''}{summary.netGrowth || 0}
              </div>
              <div className={styles.metricLabel}>Net Growth</div>
              <div className={styles.metricSubtext}>
                Growth Rate: {summary.growthRate > 0 ? '+' : ''}{summary.growthRate || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Growth Trend Chart */}
        <Card>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Member Activity Trend</h3>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendColor} style={{ background: '#22c55e' }}></span>
                Joins
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendColor} style={{ background: '#ef4444' }}></span>
                Leaves
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendColor} style={{ background: '#3b82f6' }}></span>
                Net Growth
              </span>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {dailyData.length > 0 ? (
              <LineChart
                data={dailyData.map(item => ({
                  label: moment(item.date).format('MMM DD'),
                  joins: item.joins,
                  leaves: item.leaves + item.kicks + item.bans,
                  netGrowth: item.netGrowth
                }))}
                color="#3b82f6"
                height={350}
                showArea={false}
                showGrid={true}
                multi={true}
                lines={[
                  { key: 'joins', color: '#22c55e', name: 'Joins' },
                  { key: 'leaves', color: '#ef4444', name: 'Leaves' },
                  { key: 'netGrowth', color: '#3b82f6', name: 'Net Growth' }
                ]}
              />
            ) : (
              <div className={styles.noData}>No data available for selected period</div>
            )}
          </div>
        </Card>

        {/* Leave Type Breakdown */}
        <div className={styles.twoColumnGrid}>
          <Card>
            <h3 className={styles.chartTitle}>Leave Type Distribution</h3>
            <div className={styles.chartContainer} style={{ padding: '0', minHeight: '350px' }}>
              <BarChart
                data={[
                  { label: 'Voluntary', value: breakdown.voluntaryLeaves?.count || 0 },
                  { label: 'Kicks', value: breakdown.kicks?.count || 0 },
                  { label: 'Bans', value: breakdown.bans?.count || 0 }
                ]}
                color="#f97316"
                height={350}
                showGrid={true}
                showValues={true}
              />
            </div>
          </Card>

          <Card>
            <h3 className={styles.chartTitle}>Growth Metrics</h3>
            <div className={styles.metricsTable}>
              <div className={styles.metricRow}>
                <span className={styles.metricName}>Churn Rate</span>
                <span className={`${styles.metricBadge} ${styles.warning}`}>
                  {summary.churnRate || 0}%
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricName}>Growth Rate</span>
                <span className={`${styles.metricBadge} ${summary.growthRate > 0 ? styles.success : styles.danger}`}>
                  {summary.growthRate > 0 ? '+' : ''}{summary.growthRate || 0}%
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricName}>Join Rate</span>
                <span className={styles.metricBadge}>
                  {breakdown.joins?.percentage || 0}%
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricName}>Voluntary Leave Rate</span>
                <span className={styles.metricBadge}>
                  {breakdown.voluntaryLeaves?.percentage || 0}%
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricName}>Kick Rate</span>
                <span className={styles.metricBadge}>
                  {breakdown.kicks?.percentage || 0}%
                </span>
              </div>
              <div className={styles.metricRow}>
                <span className={styles.metricName}>Ban Rate</span>
                <span className={styles.metricBadge}>
                  {breakdown.bans?.percentage || 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Leave Reasons Table */}
        {leaveReasons.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>
              <IoWarning /> Recent Kicks & Bans (With Reasons)
            </h3>
            <div className={styles.tableContainer}>
              <table className={styles.reasonsTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Username</th>
                    <th>Type</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveReasons.slice(0, 20).map((item, index) => (
                    <tr key={index}>
                      <td>{moment(item.timestamp).format('MMM DD, YYYY HH:mm')}</td>
                      <td className={styles.username}>{item.username}</td>
                      <td>
                        <span className={`${styles.typeBadge} ${item.eventType === 'BAN' ? styles.ban : styles.kick}`}>
                          {item.eventType === 'BAN' ? <IoBan /> : <IoWarning />}
                          {item.eventType}
                        </span>
                      </td>
                      <td className={styles.reason}>{item.reason || 'No reason provided'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </KPISection>

      {/* ============================================
          REPEAT CUSTOMER RATE KPI
          ============================================ */}
      <KPISection
        title="Repeat Customer Rate"
        icon="🔄"
        description="Analyze customer loyalty and repeat purchase behavior"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Selector for Repeat Customers */}
        <div className={styles.controls}>
          <DateRange value={repeatRange} onChange={setRepeatRange} />
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoPeople />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{repeatSummary.totalCustomers || 0}</div>
              <div className={styles.metricLabel}>Total Customers</div>
              <div className={styles.metricSubtext}>Unique customers</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoRepeat />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{repeatSummary.repeatCustomers || 0}</div>
              <div className={styles.metricLabel}>Repeat Customers</div>
              <div className={styles.metricSubtext}>2+ purchases</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoRepeat />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{repeatSummary.repeatCustomerRate || 0}%</div>
              <div className={styles.metricLabel}>Repeat Customer Rate</div>
              <div className={styles.metricSubtext}>Customer loyalty metric</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoRepeat />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{repeatSummary.averageOrdersPerCustomer?.toFixed(1) || 0}</div>
              <div className={styles.metricLabel}>Avg Purchases</div>
              <div className={styles.metricSubtext}>Per customer</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className={styles.twoColumnGrid}>
          <Card>
            <h3 className={styles.chartTitle}>Purchase Frequency Distribution</h3>
            <div className={styles.chartContainer}>
              {distribution && Object.keys(distribution).length > 0 ? (
                <BarChart
                  data={Object.entries(distribution).map(([key, value]) => ({
                    label: key === '1' ? '1 purchase' : `${key}+ purchases`,
                    value: value.count
                  }))}
                  color="#8b5cf6"
                  height={280}
                  showGrid={true}
                  showValues={true}
                />
              ) : (
                <div className={styles.noData}>No distribution data available</div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className={styles.chartTitle}>Top Repeat Customers</h3>
            <div className={styles.tableContainer}>
              {topCustomers.length > 0 ? (
                <table className={styles.compactTable}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Customer</th>
                      <th>Purchases</th>
                      <th>Total Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCustomers.slice(0, 10).map((customer, index) => (
                      <tr key={index}>
                        <td className={styles.rank}>#{index + 1}</td>
                        <td className={styles.username}>{customer.discordDisplayName || customer.discordUsername || customer.username || 'Unknown'}</td>
                        <td>{customer.orderCount}</td>
                        <td>${customer.totalSpent?.toFixed(2) || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.noData}>No customer data available</div>
              )}
            </div>
          </Card>
        </div>

        {/* Cohort Analysis */}
        {cohortAnalysis.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Cohort Retention Analysis</h3>
            <div className={styles.chartContainer} style={{ minHeight: '320px' }}>
              <LineChart
                data={cohortAnalysis.map(item => ({
                  label: moment(item.cohortMonth, 'YYYY-MM').format('MMM YYYY'),
                  value: item.retentionRate
                }))}
                color="#8b5cf6"
                height={300}
                showArea={true}
                showGrid={true}
                formatValue={(value) => `${value}%`}
              />
            </div>
          </Card>
        )}
      </KPISection>

      {/* ============================================
          DISCORD ENGAGEMENT & INTERACTION KPI
          ============================================ */}
      <KPISection
        title="Discord Engagement & Interaction"
        icon="💬"
        description="Community interaction metrics and top contributors"
        defaultExpanded={false}
        collapsible={true}
      >
        {/* Period Selector */}
        <div className={styles.controls}>
          <DateRange value={engagementRange} onChange={setEngagementRange} />
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <div className={`${styles.metricCard} ${styles.blue}`}>
            <div className={styles.metricIcon}>
              <IoChatbubbles />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{engagementSummary.totalMessages || 0}</div>
              <div className={styles.metricLabel}>Total Messages</div>
              <div className={styles.metricSubtext}>Community activity</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.green}`}>
            <div className={styles.metricIcon}>
              <IoPeople />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{engagementSummary.activeUsers || 0}</div>
              <div className={styles.metricLabel}>Active Users</div>
              <div className={styles.metricSubtext}>Participating members</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.purple}`}>
            <div className={styles.metricIcon}>
              <IoSparkles />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{(engagementSummary.totalReactionsGiven || 0) + (engagementSummary.totalReactionsReceived || 0)}</div>
              <div className={styles.metricLabel}>Total Reactions</div>
              <div className={styles.metricSubtext}>Given + Received</div>
            </div>
          </div>

          <div className={`${styles.metricCard} ${styles.orange}`}>
            <div className={styles.metricIcon}>
              <IoSparkles />
            </div>
            <div className={styles.metricContent}>
              <div className={styles.metricValue}>{engagementSummary.avgEngagementScore?.toFixed(1) || 0}</div>
              <div className={styles.metricLabel}>Avg Engagement Score</div>
              <div className={styles.metricSubtext}>Per active user</div>
            </div>
          </div>
        </div>

        {/* Engagement Trend */}
        {engagementTrend.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Engagement Trend</h3>
            <div className={styles.chartContainer}>
              <LineChart
                data={engagementTrend.map(item => ({
                  label: moment(item.date).format('MMM DD'),
                  messages: item.messages,
                  reactionsGiven: item.reactionsGiven,
                  reactionsReceived: item.reactionsReceived,
                  score: item.engagementScore
                }))}
                color="#06b6d4"
                height={300}
                showArea={false}
                showGrid={true}
                multi={true}
                lines={[
                  { key: 'messages', color: '#3b82f6', name: 'Messages' },
                  { key: 'reactionsGiven', color: '#8b5cf6', name: 'Reactions Given' },
                  { key: 'reactionsReceived', color: '#10b981', name: 'Reactions Received' },
                  { key: 'score', color: '#06b6d4', name: 'Engagement Score' }
                ]}
              />
            </div>
          </Card>
        )}

        {/* Top Engaged Users & Channel Activity */}
        <div className={styles.twoColumnGrid}>
          <Card>
            <h3 className={styles.chartTitle}>Top Engaged Users</h3>
            <div className={styles.tableContainer}>
              {topEngagedUsers.length > 0 ? (
                <table className={styles.compactTable}>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>User</th>
                      <th>Messages</th>
                      <th>Reactions</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topEngagedUsers.slice(0, 10).map((user, index) => (
                      <tr key={index}>
                        <td className={styles.rank}>#{index + 1}</td>
                        <td className={styles.username}>{user.displayName || user.username}</td>
                        <td>{user.totalMessages}</td>
                        <td>{(user.totalReactionsGiven || 0) + (user.totalReactionsReceived || 0)}</td>
                        <td className={styles.score}>{user.totalEngagementScore || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.noData}>No engagement data available</div>
              )}
            </div>
          </Card>

          <Card>
            <h3 className={styles.chartTitle}>Most Active Channels</h3>
            <div className={styles.chartContainer}>
              {channelActivity.length > 0 ? (
                <BarChart
                  data={channelActivity.slice(0, 8).map(channel => ({
                    label: channel.channelName || `#${channel.channelId}`,
                    value: channel.messageCount
                  }))}
                  color="#06b6d4"
                  height={280}
                  showGrid={true}
                  showValues={true}
                />
              ) : (
                <div className={styles.noData}>No channel data available</div>
              )}
            </div>
          </Card>
        </div>

        {/* Active Engagement Ranks */}
        {activeRanks.length > 0 && (
          <Card>
            <h3 className={styles.chartTitle}>Active Engagement Ranks</h3>
            <div className={styles.ranksGrid}>
              {activeRanks.map((rank, index) => (
                <div key={index} className={styles.rankCard}>
                  <div className={styles.rankBadge} style={{ background: rank.color || '#8b5cf6' }}>
                    {rank.rank}
                  </div>
                  <div className={styles.rankInfo}>
                    <div className={styles.rankName}>{rank.username}</div>
                    {rank.reason && <div className={styles.rankScore}>{rank.reason}</div>}
                    <div className={styles.rankDate}>
                      Awarded: {moment(rank.earnedAt).format('MMM DD, YYYY')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </KPISection>
    </div>
  )
}

export default CommunityTab
