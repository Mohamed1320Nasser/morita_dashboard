import React, { useEffect, useState } from 'react'
import styles from './users.module.scss'
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
import { IoArrowBack } from 'react-icons/io5'

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
      case 'user':
        return <Badge type="info">User</Badge>
      default:
        return <Badge>{role}</Badge>
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

  const handleBack = () => router.push('/users')

  if (pageLoading) return <Loading />
  if (!user) {
    return (
      <Container>
        <div className="text-center p-5">
          <h3>User not found</h3>
          <button className="btn btn-primary mt-3" onClick={handleBack}>
            Back to Users
          </button>
        </div>
      </Container>
    )
  }

  return (
    <div className={styles.userDetail}>
      <PageHead current={user.username}>
        <Head title={user.username} noButton>
          User profile and management
        </Head>
      </PageHead>
      <Container>
        <div className={styles.backLink} onClick={handleBack}>
          <IoArrowBack /> Back to Users
        </div>

        {/* User Header */}
        <div className={styles.userHeader}>
          <div className={styles.userInfo}>
            <div className={styles.userId}>User ID: {user.id}</div>
            <div className={styles.userName}>
              {user.username || user.fullname || 'Unknown User'}
              {getRoleBadge(user.role)}
            </div>
            <div className={styles.userMeta}>
              <span>Joined {moment(user.createdAt).format('DD/MM/YYYY')}</span>
              {user.discordId && <span>• Discord: {user.discordId}</span>}
            </div>
          </div>
          {user.wallet ? (
            <div className={styles.walletCard}>
              <div className={styles.walletLabel}>Wallet Balance</div>
              <div className={styles.walletBalance}>{formatCurrency(user.wallet.balance)}</div>
              <div className={styles.walletType}>{user.wallet.walletType}</div>
            </div>
          ) : (
            <div className={styles.noWalletCard}>
              <div>No Wallet</div>
              <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                User has not created a wallet yet
              </div>
            </div>
          )}
        </div>

        {/* User Information Grid */}
        <div className={styles.infoGrid}>
          {/* Personal Info */}
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Personal Information</div>
            <div className={styles.infoContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Full Name</span>
                <span className={styles.value}>{user.fullname || '-'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Username</span>
                <span className={styles.value}>{user.username || '-'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{user.email || '-'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Phone</span>
                <span className={styles.value}>{user.phone || '-'}</span>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Account Information</div>
            <div className={styles.infoContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Role</span>
                <span className={styles.value}>{getRoleBadge(user.role)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Discord ID</span>
                <span className={styles.value} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                  {user.discordId || '-'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Joined</span>
                <span className={styles.value}>
                  {moment(user.createdAt).format('DD/MM/YYYY HH:mm')}
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          {user.wallet && (
            <div className={styles.infoCard}>
              <div className={styles.infoTitle}>Wallet Details</div>
              <div className={styles.infoContent}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Type</span>
                  <span className={styles.value}>{user.wallet.walletType}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Balance</span>
                  <span className={styles.value} style={{ color: '#22c55e' }}>
                    {formatCurrency(user.wallet.balance)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Pending</span>
                  <span className={styles.value} style={{ color: '#f97316' }}>
                    {formatCurrency(user.wallet.pendingBalance)}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Status</span>
                  <span className={styles.value}>
                    {user.wallet.isActive ? (
                      <Badge type="success">Active</Badge>
                    ) : (
                      <Badge type="danger">Inactive</Badge>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Sections */}
        <div className={styles.ordersSection}>
          <h3 className={styles.sectionTitle}>Order History</h3>
          <div className={styles.ordersGrid}>
            {/* Orders as Customer */}
            <Card>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#7a7e85' }}>
                As Customer ({user.ordersAsCustomer?.length || 0})
              </h4>
              {user.ordersAsCustomer && user.ordersAsCustomer.length > 0 ? (
                <div>
                  {user.ordersAsCustomer.map((order) => (
                    <div key={order.id} className={styles.orderItem}>
                      <div className={styles.orderInfo}>
                        <div className={styles.orderNumber}>
                          Order #{order.orderNumber} {getStatusBadge(order.status)}
                        </div>
                        <div className={styles.orderDate}>
                          {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                      <div className={styles.orderValue}>{formatCurrency(order.orderValue)}</div>
                    </div>
                  ))}
                  {user.ordersAsCustomer.length === 10 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#7a7e85' }}>
                      Showing last 10 orders
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>No orders as customer</div>
              )}
            </Card>

            {/* Orders as Worker */}
            <Card>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#7a7e85' }}>
                As Worker ({user.ordersAsWorker?.length || 0})
              </h4>
              {user.ordersAsWorker && user.ordersAsWorker.length > 0 ? (
                <div>
                  {user.ordersAsWorker.map((order) => (
                    <div key={order.id} className={styles.orderItem}>
                      <div className={styles.orderInfo}>
                        <div className={styles.orderNumber}>
                          Order #{order.orderNumber} {getStatusBadge(order.status)}
                        </div>
                        <div className={styles.orderDate}>
                          {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                        </div>
                      </div>
                      <div className={styles.orderValue}>{formatCurrency(order.orderValue)}</div>
                    </div>
                  ))}
                  {user.ordersAsWorker.length === 10 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#7a7e85' }}>
                      Showing last 10 orders
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.emptyState}>No orders as worker</div>
              )}
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        {user.wallet && user.wallet.transactions && user.wallet.transactions.length > 0 && (
          <Card>
            <h3 className={styles.sectionTitle}>Recent Transactions (Last 10)</h3>
            <div>
              {user.wallet.transactions.map((tx) => (
                <div key={tx.id} className={styles.orderItem}>
                  <div className={styles.orderInfo}>
                    <div className={styles.orderNumber}>
                      {tx.type} - {tx.status}
                    </div>
                    <div className={styles.orderDate}>
                      {moment(tx.createdAt).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: parseFloat(tx.amount) > 0 ? '#22c55e' : '#ef4444',
                    }}
                  >
                    {parseFloat(tx.amount) > 0 ? '+' : ''}
                    {formatCurrency(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Container>
    </div>
  )
}


export default UserDetailPage
