import React, { useEffect, useState } from 'react'
import styles from './dashboard.module.scss'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { IoWallet, IoCart, IoTrendingUp, IoPeople, IoArrowUp, IoArrowDown, IoCash } from 'react-icons/io5'
import { FaChartLine, FaExclamationTriangle } from 'react-icons/fa'
import moment from 'moment'

const DashboardPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [health, setHealth] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes, healthRes] = await Promise.all([
          adminController.getDashboardStats(),
          adminController.getRecentActivity(),
          adminController.getSystemHealth(),
        ])

        if (statsRes && !statsRes.error && statsRes.data) {
          setStats(statsRes.data)
        } else {
          notify('Failed to load statistics')
        }

        if (activityRes && !activityRes.error && activityRes.data) {
          setActivity(activityRes.data || [])
        }

        if (healthRes && !healthRes.error && healthRes.data) {
          setHealth(healthRes.data)
        }
      } catch (e) {
        notify('Error loading dashboard data')
      } finally {
        setPageLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const renderGrowth = (growth) => {
    if (!growth || growth === 0) return null
    const isPositive = growth > 0
    return (
      <div className={`${styles.growth} ${isPositive ? styles.positive : styles.negative}`}>
        {isPositive ? <IoArrowUp /> : <IoArrowDown />}
        {Math.abs(growth).toFixed(1)}%
      </div>
    )
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦'
      case 'transaction':
        return '💰'
      case 'user':
        return '👤'
      default:
        return '•'
    }
  }

  const getActivityText = (activity) => {
    switch (activity.type) {
      case 'order':
        return `Order #${activity.data.orderNumber} ${activity.action} - ${formatCurrency(activity.data.orderValue)}`
      case 'transaction':
        return `${activity.action} ${formatCurrency(Math.abs(activity.data.amount))} - ${activity.data.username || 'System'}`
      case 'user':
        return `${activity.data.username} ${activity.action} as ${activity.data.role}`
      default:
        return JSON.stringify(activity.data)
    }
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.dashboard}>
      <PageHead current="Dashboard">
        <Head title="Admin Dashboard" noButton>
          System overview and statistics
        </Head>
      </PageHead>
      <Container>
        {/* System Health Warnings */}
        {health && health.warnings && health.warnings.length > 0 && (
          <div className={styles.healthWarnings}>
            <Card>
              <div className={styles.warningHeader}>
                <FaExclamationTriangle />
                <h3>System Alerts</h3>
              </div>
              <ul className={styles.warningList}>
                {health.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </Card>
          </div>
        )}

        {/* Primary Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.blue}`}>
            <div className={styles.statIcon}>
              <IoCart />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statHeader}>
                <div className={styles.statValue}>{stats?.orders?.total || 0}</div>
                {renderGrowth(stats?.orders?.growth)}
              </div>
              <div className={styles.statLabel}>Total Orders</div>
              <div className={styles.statSubtext}>
                {stats?.orders?.today || 0} today • {stats?.orders?.thisMonth || 0} this month
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.green}`}>
            <div className={styles.statIcon}>
              <IoTrendingUp />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statHeader}>
                <div className={styles.statValue}>{formatCurrency(stats?.revenue?.total || 0)}</div>
                {renderGrowth(stats?.revenue?.growth)}
              </div>
              <div className={styles.statLabel}>Total Revenue</div>
              <div className={styles.statSubtext}>
                {formatCurrency(stats?.revenue?.today || 0)} today • {formatCurrency(stats?.revenue?.thisMonth || 0)} this month
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.purple}`}>
            <div className={styles.statIcon}>
              <IoCash />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statHeader}>
                <div className={styles.statValue}>{formatCurrency(stats?.profit?.net || 0)}</div>
                {renderGrowth(stats?.profit?.growth)}
              </div>
              <div className={styles.statLabel}>Net Profit</div>
              <div className={styles.statSubtext}>
                {stats?.profit?.margin?.toFixed(1) || 0}% margin • {formatCurrency(stats?.profit?.thisMonth || 0)} this month
              </div>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.orange}`}>
            <div className={styles.statIcon}>
              <IoPeople />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statHeader}>
                <div className={styles.statValue}>{stats?.users?.total || 0}</div>
                {renderGrowth(stats?.users?.growth)}
              </div>
              <div className={styles.statLabel}>Total Users</div>
              <div className={styles.statSubtext}>
                {stats?.users?.active || 0} active • {stats?.users?.newThisMonth || 0} new this month
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className={styles.secondaryStats}>
          <Card>
            <h3 className={styles.sectionTitle}>Order Status</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>Pending</div>
                <div className={`${styles.statusValue} ${styles.gray}`}>
                  {stats?.orders?.pending || 0}
                </div>
              </div>
              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>In Progress</div>
                <div className={`${styles.statusValue} ${styles.yellow}`}>
                  {stats?.orders?.inProgress || 0}
                </div>
              </div>
              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>Completed</div>
                <div className={`${styles.statusValue} ${styles.green}`}>
                  {stats?.orders?.completed || 0}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className={styles.sectionTitle}>System Wallet</h3>
            <div className={styles.systemWallet}>
              <div className={styles.walletBalance}>
                <div className={styles.balanceLabel}>System Balance</div>
                <div className={styles.balanceValue}>
                  {formatCurrency(stats?.systemWallet?.systemBalance || 0)}
                </div>
              </div>
              <div className={styles.walletStats}>
                <div className={styles.walletStat}>
                  <span>Total Revenue:</span>
                  <span>{formatCurrency(stats?.systemWallet?.totalSystemRevenue || 0)}</span>
                </div>
                <div className={styles.walletStat}>
                  <span>This Month:</span>
                  <span>{formatCurrency(stats?.systemWallet?.thisMonthRevenue || 0)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <div className={styles.activityHeader}>
            <h3 className={styles.sectionTitle}>Recent Activity</h3>
            <Badge type="info">{activity.length} items</Badge>
          </div>
          <div className={styles.activityFeed}>
            {activity.length === 0 ? (
              <div className={styles.emptyState}>No recent activity</div>
            ) : (
              activity.slice(0, 20).map((item, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <span className={styles.activityIcon}>{getActivityIcon(item.type)}</span>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>{getActivityText(item)}</div>
                    <div className={styles.activityTime}>
                      {moment(item.timestamp).fromNow()}
                    </div>
                  </div>
                  <Badge type={item.type === 'order' ? 'primary' : item.type === 'transaction' ? 'success' : 'info'}>
                    {item.type}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default DashboardPage
