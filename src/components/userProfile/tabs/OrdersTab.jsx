import React from 'react'
import Card from '@/components/atoms/cards'
import Badge from '@/components/atoms/badge'
import moment from 'moment'
import styles from './TabStyles.module.scss'

const OrdersTab = ({ profileData }) => {
  const { orders } = profileData

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <Badge type="secondary">Pending</Badge>
      case 'IN_PROGRESS':
        return <Badge type="warning">In Progress</Badge>
      case 'ASSIGNED':
        return <Badge type="info">Assigned</Badge>
      case 'COMPLETED':
        return <Badge type="success">Completed</Badge>
      case 'CANCELLED':
        return <Badge type="danger">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Calculate total orders from both customer and worker
  const totalOrders = (orders.asCustomer?.total || 0) + (orders.asWorker?.total || 0)

  return (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#3b82f6' }}>
              {totalOrders}
            </div>
            <div className={styles.statLabel}>Total Orders</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#10b981' }}>
              {orders.asCustomer?.total || 0}
            </div>
            <div className={styles.statLabel}>As Customer</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#8b5cf6' }}>
              {orders.asWorker?.total || 0}
            </div>
            <div className={styles.statLabel}>As Worker</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#f59e0b' }}>
              {formatCurrency(orders.asCustomer?.totalValue || 0)}
            </div>
            <div className={styles.statLabel}>Total Spent</div>
          </div>
        </Card>
      </div>

      {orders.asCustomer && orders.asCustomer.total > 0 && (
        <Card>
          <h3 className={styles.sectionTitle}>Customer Orders ({orders.asCustomer.total})</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Completed</span>
              <span className={styles.infoValue}>{orders.asCustomer.completed}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Active</span>
              <span className={styles.infoValue}>{orders.asCustomer.inProgress}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Average Value</span>
              <span className={styles.infoValue}>{formatCurrency(orders.asCustomer.avgOrderValue)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Success Rate</span>
              <span className={styles.infoValue}>{orders.asCustomer.successRate || 0}%</span>
            </div>
          </div>

          {orders.asCustomer.recentOrders && orders.asCustomer.recentOrders.length > 0 && (
            <>
              <h4 className={styles.sectionTitle} style={{ marginTop: '24px' }}>Recent Orders</h4>
              {orders.asCustomer.recentOrders.map((order) => (
                <div key={order.id} className={styles.listItem}>
                  <div className={styles.listInfo}>
                    <div className={styles.listTitle}>
                      Order #{order.orderNumber}
                      {getStatusBadge(order.status)}
                    </div>
                    <div className={styles.listMeta}>
                      {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                  <div className={styles.listValue}>
                    {formatCurrency(order.orderValue)}
                  </div>
                </div>
              ))}
            </>
          )}
        </Card>
      )}

      {orders.asWorker && orders.asWorker.total > 0 && (
        <Card>
          <h3 className={styles.sectionTitle}>Worker Orders ({orders.asWorker.total})</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Completed</span>
              <span className={styles.infoValue}>{orders.asWorker.completed}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Active</span>
              <span className={styles.infoValue}>{orders.asWorker.inProgress}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Total Earned</span>
              <span className={styles.infoValue}>{formatCurrency(orders.asWorker.totalEarnings)}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Avg Completion</span>
              <span className={styles.infoValue}>
                {orders.asWorker.avgCompletionTime < 1
                  ? `${Math.round(orders.asWorker.avgCompletionTime * 60)}m`
                  : `${orders.asWorker.avgCompletionTime.toFixed(1)}h`}
              </span>
            </div>
          </div>

          {orders.asWorker.recentOrders && orders.asWorker.recentOrders.length > 0 && (
            <>
              <h4 className={styles.sectionTitle} style={{ marginTop: '24px' }}>Recent Work</h4>
              {orders.asWorker.recentOrders.map((order) => (
                <div key={order.id} className={styles.listItem}>
                  <div className={styles.listInfo}>
                    <div className={styles.listTitle}>
                      Order #{order.orderNumber}
                      {getStatusBadge(order.status)}
                    </div>
                    <div className={styles.listMeta}>
                      {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                    </div>
                  </div>
                  <div className={styles.listValue}>
                    {formatCurrency(order.orderValue)}
                  </div>
                </div>
              ))}
            </>
          )}
        </Card>
      )}
    </div>
  )
}

export default OrdersTab
