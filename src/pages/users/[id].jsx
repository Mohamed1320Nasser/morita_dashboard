import React, { useEffect, useState } from 'react'
import styles from './userView.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'

const UserDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [pageLoading, setPageLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (!id) return

    const fetchUser = async () => {
      try {
        const res = await adminController.getUserById(id)
        if (res && res.success && res.data.user) {
          setUser(res.data.user)
        } else {
          notify(res?.error?.message || 'Failed to load user')
        }
      } catch (e) {
        notify('Error loading user')
      } finally {
        setPageLoading(false)
      }
    }

    fetchUser()
  }, [id])

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Badge type="danger">Admin</Badge>
      case 'support':
        return <Badge type="warning">Support</Badge>
      case 'worker':
        return <Badge type="info">Worker</Badge>
      case 'customer':
        return <Badge type="success">Customer</Badge>
      default:
        return <Badge>{role || '-'}</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge type="secondary">Pending</Badge>
      case 'IN_PROGRESS':
        return <Badge type="warning">In Progress</Badge>
      case 'COMPLETED':
        return <Badge type="success">Completed</Badge>
      case 'CANCELLED':
        return <Badge type="danger">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (pageLoading) return <Loading />
  if (!user) return null

  const displayName = user.discordDisplayName || user.fullname || user.username || 'Unknown User'

  return (
    <div className={styles.viewPage}>
      <PageHead current="Users">
        <Head title={displayName} back="/users" />
      </PageHead>

      <Container>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.headerMeta}>
              {getRoleBadge(user.role || user.discordRole)}
              <span className={styles.date}>Joined {moment(user.createdAt).format('DD/MM/YYYY')}</span>
            </div>
          </div>
          {user.wallet ? (
            <div className={styles.valueCard}>
              <div className={styles.valueLabel}>Wallet Balance</div>
              <div className={styles.valueAmount}>{formatCurrency(user.wallet.balance)}</div>
            </div>
          ) : (
            <div className={styles.valueCardEmpty}>
              <div className={styles.valueLabel}>No Wallet</div>
            </div>
          )}
        </div>

        {/* Info Grid - 3 columns */}
        <div className={styles.infoGrid}>
          {/* Personal Info Card */}
          <Card>
            <h3 className={styles.cardTitle}>Personal Info</h3>
            <div className={styles.row}>
              <span className={styles.label}>Display Name</span>
              <span className={styles.value}>{user.discordDisplayName || user.fullname || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Username</span>
              <span className={styles.value}>{user.username || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{user.email || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>{user.phone || '-'}</span>
            </div>
          </Card>

          {/* Discord Info Card */}
          <Card>
            <h3 className={styles.cardTitle}>Discord</h3>
            <div className={styles.row}>
              <span className={styles.label}>Discord ID</span>
              <span className={styles.value}>{user.discordId || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Username</span>
              <span className={styles.value}>{user.discordUsername ? `@${user.discordUsername}` : '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Display Name</span>
              <span className={styles.value}>{user.discordDisplayName || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Role</span>
              <span className={styles.value}>{getRoleBadge(user.discordRole)}</span>
            </div>
          </Card>

          {/* Wallet Card */}
          <Card>
            <h3 className={styles.cardTitle}>Wallet</h3>
            {user.wallet ? (
              <>
                <div className={styles.row}>
                  <span className={styles.label}>Type</span>
                  <span className={styles.value}>{user.wallet.walletType}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Balance</span>
                  <span className={styles.value} style={{ color: '#10b981', fontWeight: 600 }}>
                    {formatCurrency(user.wallet.balance)}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Pending</span>
                  <span className={styles.value} style={{ color: '#f59e0b' }}>
                    {formatCurrency(user.wallet.pendingBalance)}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Status</span>
                  <span className={styles.value}>
                    {user.wallet.isActive ? (
                      <Badge type="success">Active</Badge>
                    ) : (
                      <Badge type="danger">Inactive</Badge>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyText}>No wallet created</div>
            )}
          </Card>
        </div>

        {/* Orders as Customer */}
        <Card>
          <h3 className={styles.cardTitle}>Orders as Customer ({user.ordersAsCustomer?.length || 0})</h3>
          {user.ordersAsCustomer && user.ordersAsCustomer.length > 0 ? (
            <div className={styles.ordersList}>
              {user.ordersAsCustomer.map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>
                      Order #{order.orderNumber}
                      <span className={styles.orderStatus}>{getStatusBadge(order.status)}</span>
                    </div>
                    <div className={styles.orderDate}>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                  </div>
                  <div className={styles.orderValue}>{formatCurrency(order.orderValue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyText}>No orders as customer</div>
          )}
        </Card>

        {/* Orders as Worker */}
        <Card>
          <h3 className={styles.cardTitle}>Orders as Worker ({user.ordersAsWorker?.length || 0})</h3>
          {user.ordersAsWorker && user.ordersAsWorker.length > 0 ? (
            <div className={styles.ordersList}>
              {user.ordersAsWorker.map((order) => (
                <div key={order.id} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>
                      Order #{order.orderNumber}
                      <span className={styles.orderStatus}>{getStatusBadge(order.status)}</span>
                    </div>
                    <div className={styles.orderDate}>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                  </div>
                  <div className={styles.orderValue}>{formatCurrency(order.orderValue)}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyText}>No orders as worker</div>
          )}
        </Card>

        {/* Recent Transactions */}
        {user.wallet && user.wallet.transactions && user.wallet.transactions.length > 0 && (
          <Card>
            <h3 className={styles.cardTitle}>Recent Transactions</h3>
            <div className={styles.ordersList}>
              {user.wallet.transactions.map((tx) => (
                <div key={tx.id} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>{tx.type}</div>
                    <div className={styles.orderDate}>{moment(tx.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                  </div>
                  <div className={styles.orderValue} style={{ color: parseFloat(tx.amount) >= 0 ? '#10b981' : '#ef4444' }}>
                    {parseFloat(tx.amount) >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* User Timeline */}
        <Card>
          <h3 className={styles.cardTitle}>User Timeline</h3>
          <div className={styles.timeline}>
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${styles.iconSuccess}`}>
                <span className={styles.checkIcon}></span>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTitle}>Account Created</div>
                <div className={styles.timelineDate}>{moment(user.createdAt).format('DD/MM/YYYY HH:mm')}</div>
              </div>
            </div>

            {user.wallet && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.iconSuccess}`}>
                  <span className={styles.checkIcon}></span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Wallet Created</div>
                  <div className={styles.timelineDate}>{moment(user.wallet.createdAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}

            {user.updatedAt && user.updatedAt !== user.createdAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.iconPending}`}>
                  <span className={styles.clockIcon}></span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Last Updated</div>
                  <div className={styles.timelineDate}>{moment(user.updatedAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </Container>
    </div>
  )
}

export default UserDetailPage
