import React, { useEffect, useState } from 'react'
import styles from './orders.module.scss'
import Card from '@/components/atoms/cards'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'
import { IoArrowBack, IoCheckmark, IoTime, IoAlert, IoPersonOutline } from 'react-icons/io5'
import { ORDER_STATUS, STATUS_LABELS, STATUS_BADGE_TYPES, getNextStatuses } from '@/constants/orderStatus'

const OrderDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [pageLoading, setPageLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [statusReason, setStatusReason] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchOrder = async () => {
    try {
      const res = await adminController.getOrderById(id)
      if (res && res.success && res.data.order) {
        setOrder(res.data.order)
      } else {
        notify(res?.error?.message || 'Failed to load order')
      }
    } catch (e) {
      notify('Error loading order')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    fetchOrder()
  }, [id])

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const getStatusBadge = (status) => {
    const badgeType = STATUS_BADGE_TYPES[status] || 'secondary'
    const label = STATUS_LABELS[status] || status
    return <Badge type={badgeType}>{label}</Badge>
  }

  const handleBack = () => router.push('/orders')

  const handleOpenStatusModal = () => {
    setSelectedStatus('')
    setStatusReason('')
    setShowStatusModal(true)
  }

  const handleCloseStatusModal = () => {
    setShowStatusModal(false)
    setSelectedStatus('')
    setStatusReason('')
  }

  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      notify('Please select a status', 'error')
      return
    }
    if (!statusReason.trim()) {
      notify('Please provide a reason', 'error')
      return
    }

    setUpdatingStatus(true)
    try {
      const res = await adminController.updateOrderStatus(id, {
        status: selectedStatus,
        adminId: '1', // TODO: Get from auth context
        reason: statusReason,
      })

      if (res && res.success) {
        notify('Status updated successfully', 'success')
        handleCloseStatusModal()
        fetchOrder() // Refresh order data
      } else {
        notify(res?.error?.message || 'Failed to update status', 'error')
      }
    } catch (e) {
      notify(e?.response?.data?.message || 'Error updating status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const availableStatuses = order ? getNextStatuses(order.status) : []

  if (pageLoading) return <Loading />
  if (!order) {
    return (
      <Container>
        <div className="text-center p-5">
          <h3>Order not found</h3>
          <button className="btn btn-primary mt-3" onClick={handleBack}>
            Back to Orders
          </button>
        </div>
      </Container>
    )
  }

  return (
    <div className={styles.orderDetail}>
      <PageHead current="Order Details">
        <div className={styles.backLink} onClick={handleBack}>
          <IoArrowBack /> Back to Orders
        </div>
      </PageHead>
      <Container>
        {/* Order Header */}
        <div className={styles.orderHeader}>
          <div className={styles.orderTitleRow}>
            <h2 className={styles.orderTitle}>Order #{order.orderNumber}</h2>
            {getStatusBadge(order.status)}
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueLabel}>Order Value</div>
            <div className={styles.valueAmount}>{formatCurrency(order.orderValue)}</div>
          </div>
        </div>

        {/* Admin Actions */}
        <Card>
          <div className={styles.adminActions}>
            <h3 className={styles.sectionTitle}>Admin Actions</h3>
            <div className={styles.actionButtons}>
              <button
                className={styles.actionBtn}
                onClick={handleOpenStatusModal}
                disabled={availableStatuses.length === 0}
              >
                Update Status
              </button>
            </div>
            {availableStatuses.length === 0 && (
              <p className={styles.noActions}>No status changes available for this order.</p>
            )}
          </div>
        </Card>

        {/* Order Information Grid */}
        <div className={styles.infoGrid}>
          {/* Customer Info */}
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Customer</div>
            <div className={styles.infoContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name</span>
                <span className={`${styles.value} ${styles.highlight}`}>{order.customer?.discordDisplayName || order.customer?.fullname || order.customer?.username || 'Unknown'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Discord ID</span>
                <span className={styles.value}>{order.customer?.discordId || '-'}</span>
              </div>
              {order.customer?.discordUsername && (
                <div className={styles.infoRow}>
                  <span className={styles.label}>Username</span>
                  <span className={styles.value}>@{order.customer.discordUsername}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{order.customer?.email || '-'}</span>
              </div>
            </div>
          </div>

          {/* Worker Info */}
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Worker</div>
            <div className={styles.infoContent}>
              {order.worker ? (
                <>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Name</span>
                    <span className={`${styles.value} ${styles.highlight}`}>{order.worker.discordDisplayName || order.worker.fullname || order.worker.username}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Discord ID</span>
                    <span className={styles.value}>{order.worker.discordId || '-'}</span>
                  </div>
                  {order.worker.discordUsername && (
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Username</span>
                      <span className={styles.value}>@{order.worker.discordUsername}</span>
                    </div>
                  )}
                  <div className={styles.infoRow}>
                    <span className={styles.label}>Assigned</span>
                    <span className={styles.value}>
                      {order.assignedAt ? moment(order.assignedAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </>
              ) : (
                <div className={styles.emptyState}>
                  <IoPersonOutline className={styles.emptyIcon} />
                  <span>Unassigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className={styles.infoCard}>
            <div className={styles.infoTitle}>Payment</div>
            <div className={styles.infoContent}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Order Value</span>
                <span className={`${styles.value} ${styles.highlight}`}>{formatCurrency(order.orderValue)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Deposit</span>
                <span className={styles.value}>{formatCurrency(order.depositAmount)}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Currency</span>
                <span className={styles.value}>{order.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service & Job Details */}
        {(order.service || order.jobDetails) && (
          <Card>
            <h3 className={styles.sectionTitle}>Service & Job Details</h3>
            {order.service && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Service:</strong> {order.service.name}
              </div>
            )}
            {order.jobDetails && (
              <div>
                <strong>Job Details:</strong>
                <div
                  style={{
                    marginTop: '0.5rem',
                    padding: '1rem',
                    background: '#f9fafb',
                    borderRadius: '8px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {typeof order.jobDetails === 'object'
                    ? order.jobDetails.description || JSON.stringify(order.jobDetails, null, 2)
                    : order.jobDetails}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Completion Notes */}
        {order.completionNotes && (
          <Card>
            <h3 className={styles.sectionTitle}>Completion Notes</h3>
            <div
              style={{
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {order.completionNotes}
            </div>
          </Card>
        )}

        {/* Customer Review */}
        {(order.rating || order.review) && (
          <Card>
            <h3 className={styles.sectionTitle}>Customer Feedback</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.rating && (
                <div>
                  <strong style={{ color: '#64748b', fontSize: '0.875rem' }}>Rating:</strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{'⭐'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: '600', color: '#22c55e' }}>
                      {order.rating}/5
                    </span>
                  </div>
                </div>
              )}
              {order.review && (
                <div>
                  <strong style={{ color: '#64748b', fontSize: '0.875rem' }}>Review:</strong>
                  <div
                    style={{
                      marginTop: '0.5rem',
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap',
                      borderLeft: '4px solid #22c55e',
                    }}
                  >
                    {order.review}
                  </div>
                </div>
              )}
              {order.reviewedAt && (
                <div style={{ fontSize: '0.875rem', color: '#7a7e85' }}>
                  Reviewed on {moment(order.reviewedAt).format('DD/MM/YYYY HH:mm')}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Timeline */}
        <Card>
          <div className={styles.timeline}>
            <h3 className={styles.sectionTitle}>Order Timeline</h3>

            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${styles.blue}`}>
                <IoAlert />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineAction}>Order Created</div>
                <div className={styles.timelineTime}>
                  {moment(order.createdAt).format('DD/MM/YYYY HH:mm')}
                </div>
              </div>
            </div>

            {order.assignedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.orange}`}>
                  <IoTime />
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineAction}>Worker Assigned</div>
                  <div className={styles.timelineTime}>
                    {moment(order.assignedAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </div>
            )}

            {order.startedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.orange}`}>
                  <IoTime />
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineAction}>Work Started</div>
                  <div className={styles.timelineTime}>
                    {moment(order.startedAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </div>
            )}

            {order.completedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.green}`}>
                  <IoCheckmark />
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineAction}>Order Completed</div>
                  <div className={styles.timelineTime}>
                    {moment(order.completedAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </div>
            )}

            {order.confirmedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.green}`}>
                  <IoCheckmark />
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineAction}>Completion Confirmed</div>
                  <div className={styles.timelineTime}>
                    {moment(order.confirmedAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </div>
            )}

            {order.reviewedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.green}`}>
                  ⭐
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineAction}>
                    Customer Review - {order.rating ? `${order.rating}/5 Stars` : 'No Rating'}
                  </div>
                  <div className={styles.timelineTime}>
                    {moment(order.reviewedAt).format('DD/MM/YYYY HH:mm')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </Container>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className={styles.modalOverlay} onClick={handleCloseStatusModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Update Order Status</h3>
            <p className={styles.modalSubtitle}>
              Current status: <strong>{STATUS_LABELS[order.status]}</strong>
            </p>

            <div className={styles.formGroup}>
              <label>New Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={styles.select}
              >
                <option value="">Select status...</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Reason for change</label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Enter reason for status change..."
                className={styles.textarea}
                rows={3}
              />
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={handleCloseStatusModal}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              <button
                className={styles.confirmBtn}
                onClick={handleUpdateStatus}
                disabled={updatingStatus || !selectedStatus || !statusReason.trim()}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage
