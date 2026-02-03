import React, { useEffect, useState } from 'react'
import styles from './orderView.module.scss'
import Card from '@/components/atoms/cards'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import Button from '@/components/atoms/buttons/button'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'
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
        adminId: '1',
        reason: statusReason,
      })

      if (res && res.success) {
        notify('Status updated successfully', 'success')
        handleCloseStatusModal()
        fetchOrder()
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
  if (!order) return null

  return (
    <div className={styles.viewPage}>
      <PageHead current="Orders">
        <Head title={`Order #${order.orderNumber}`} back="/orders" btns>
          {availableStatuses.length > 0 && (
            <Button primary onClick={handleOpenStatusModal}>
              Update Status
            </Button>
          )}
        </Head>
      </PageHead>

      <Container>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.orderId}>Order #{order.orderNumber}</div>
            <div className={styles.headerMeta}>
              {getStatusBadge(order.status)}
              <span className={styles.date}>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</span>
            </div>
          </div>
          <div className={styles.valueCard}>
            <div className={styles.valueLabel}>Order Value</div>
            <div className={styles.valueAmount}>{formatCurrency(order.orderValue)}</div>
          </div>
        </div>

        {/* Info Grid - 3 columns */}
        <div className={styles.infoGrid}>
          {/* Customer Card */}
          <Card>
            <h3 className={styles.cardTitle}>Customer</h3>
            <div className={styles.row}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>
                {order.customer?.discordDisplayName || order.customer?.fullname || order.customer?.username || '-'}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Discord</span>
              <span className={styles.value}>
                {order.customer?.discordUsername ? `@${order.customer.discordUsername}` : '-'}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Discord ID</span>
              <span className={styles.value}>{order.customer?.discordId || '-'}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{order.customer?.email || '-'}</span>
            </div>
          </Card>

          {/* Worker Card */}
          <Card>
            <h3 className={styles.cardTitle}>Worker</h3>
            {order.worker ? (
              <>
                <div className={styles.row}>
                  <span className={styles.label}>Name</span>
                  <span className={styles.value}>
                    {order.worker.discordDisplayName || order.worker.fullname || order.worker.username}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Discord</span>
                  <span className={styles.value}>
                    {order.worker.discordUsername ? `@${order.worker.discordUsername}` : '-'}
                  </span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Discord ID</span>
                  <span className={styles.value}>{order.worker.discordId || '-'}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>Assigned</span>
                  <span className={styles.value}>
                    {order.assignedAt ? moment(order.assignedAt).format('DD/MM/YYYY') : '-'}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.emptyText}>No worker assigned</div>
            )}
          </Card>

          {/* Payment Card */}
          <Card>
            <h3 className={styles.cardTitle}>Payment</h3>
            <div className={styles.row}>
              <span className={styles.label}>Order Value</span>
              <span className={styles.value}>{formatCurrency(order.orderValue)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Deposit</span>
              <span className={styles.value}>{formatCurrency(order.depositAmount)}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Currency</span>
              <span className={styles.value}>{order.currency}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Service</span>
              <span className={styles.value}>{order.service?.name || '-'}</span>
            </div>
          </Card>
        </div>

        {/* Service & Job Details */}
        <Card>
          <h3 className={styles.cardTitle}>Service & Job Details</h3>
          <div className={styles.row}>
            <span className={styles.label}>Service</span>
            <span className={styles.value}>{order.service?.name || '-'}</span>
          </div>
          {order.jobDetails && (
            <div className={styles.jobDetailsBlock}>
              <span className={styles.label}>Job Details</span>
              <pre className={styles.jsonContent}>
                {typeof order.jobDetails === 'object'
                  ? JSON.stringify(order.jobDetails, null, 2)
                  : order.jobDetails}
              </pre>
            </div>
          )}
        </Card>

        {/* Account Data Status */}
        <Card>
          <h3 className={styles.cardTitle}>Account Data</h3>
          {order.accountDataStatus?.isSubmitted ? (
            <>
              <div className={styles.row}>
                <span className={styles.label}>Status</span>
                <span className={styles.value}>
                  <Badge type="success">Submitted</Badge>
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Submitted At</span>
                <span className={styles.value}>
                  {moment(order.accountDataStatus.submittedAt).format('DD/MM/YYYY HH:mm')}
                </span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Submitted By</span>
                <span className={styles.value}>{order.accountDataStatus.submittedByName || order.accountDataStatus.submittedBy || '-'}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.label}>Viewed</span>
                <span className={styles.value}>
                  {order.accountDataStatus.isClaimed ? (
                    <Badge type="warning">Yes - Claimed</Badge>
                  ) : (
                    <Badge type="secondary">Not yet viewed</Badge>
                  )}
                </span>
              </div>
              {order.accountDataStatus.isClaimed && (
                <>
                  <div className={styles.row}>
                    <span className={styles.label}>Claimed By</span>
                    <span className={styles.value}>
                      {order.accountDataStatus.claimedByName || order.accountDataStatus.claimedBy} ({order.accountDataStatus.claimedByRole})
                    </span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.label}>Claimed At</span>
                    <span className={styles.value}>
                      {moment(order.accountDataStatus.claimedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                </>
              )}
              <div className={styles.securityNote}>
                ⚠️ Account credentials are encrypted and not visible in admin panel for security.
              </div>
            </>
          ) : (
            <div className={styles.emptyText}>No account data submitted yet</div>
          )}
        </Card>

        {/* Screenshots (merged proof + completion) */}
        {order.screenshots && order.screenshots.length > 0 && (
          <Card>
            <h3 className={styles.cardTitle}>
              Screenshots ({order.screenshotCount || order.screenshots.length})
            </h3>
            <p className={styles.sectionDescription}>Proof screenshots uploaded by worker during the order</p>
            <div className={styles.screenshotGrid}>
              {order.screenshots.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.screenshotItem}
                >
                  <img src={url} alt={`Screenshot ${index + 1}`} />
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Issues */}
        {order.issues && order.issues.length > 0 && (
          <Card>
            <h3 className={styles.cardTitle}>Issues ({order.issues.length})</h3>
            <div className={styles.issuesList}>
              {order.issues.map((issue) => (
                <div key={issue.id} className={styles.issueItem}>
                  <div className={styles.issueHeader}>
                    <Badge type={issue.status === 'RESOLVED' ? 'success' : issue.status === 'OPEN' ? 'danger' : 'warning'}>
                      {issue.status}
                    </Badge>
                    <Badge type={
                      issue.priority === 'URGENT' ? 'danger' :
                      issue.priority === 'HIGH' ? 'warning' :
                      issue.priority === 'MEDIUM' ? 'secondary' : 'default'
                    }>
                      {issue.priority}
                    </Badge>
                    <span className={styles.issueDate}>
                      {moment(issue.createdAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  <div className={styles.issueDescription}>{issue.issueDescription}</div>
                  {issue.reportedBy && (
                    <div className={styles.issueReporter}>
                      Reported by: {issue.reportedBy.fullname || issue.reportedBy.discordId}
                    </div>
                  )}
                  {issue.resolution && (
                    <div className={styles.issueResolution}>
                      <strong>Resolution:</strong> {issue.resolution}
                      {issue.resolvedBy && (
                        <span> (by {issue.resolvedBy.fullname || issue.resolvedBy.discordId})</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Completion Notes */}
        {order.completionNotes && (
          <Card>
            <h3 className={styles.cardTitle}>Completion Notes</h3>
            <div className={styles.notesContent}>{order.completionNotes}</div>
          </Card>
        )}

        {/* Customer Feedback */}
        {(order.rating || order.review) && (
          <Card>
            <h3 className={styles.cardTitle}>Customer Feedback</h3>
            {order.rating && (
              <div className={styles.row}>
                <span className={styles.label}>Rating</span>
                <span className={styles.value}>
                  {'⭐'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)} ({order.rating}/5)
                </span>
              </div>
            )}
            {order.review && (
              <div className={styles.reviewBlock}>
                <span className={styles.label}>Review</span>
                <div className={styles.reviewText}>{order.review}</div>
              </div>
            )}
            {order.reviewedAt && (
              <div className={styles.row}>
                <span className={styles.label}>Reviewed At</span>
                <span className={styles.value}>{moment(order.reviewedAt).format('DD/MM/YYYY HH:mm')}</span>
              </div>
            )}
          </Card>
        )}

        {/* Order Timeline */}
        <Card>
          <h3 className={styles.cardTitle}>Order Timeline</h3>
          <div className={styles.timeline}>
            {/* Order Created */}
            <div className={styles.timelineItem}>
              <div className={`${styles.timelineIcon} ${styles.iconWarning}`}>
                <span>!</span>
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineTitle}>Order Created</div>
                <div className={styles.timelineDate}>{moment(order.createdAt).format('DD/MM/YYYY HH:mm')}</div>
              </div>
            </div>

            {/* Worker Assigned */}
            {order.assignedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.iconPending}`}>
                  <span className={styles.clockIcon}></span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Worker Assigned</div>
                  <div className={styles.timelineDate}>{moment(order.assignedAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}

            {/* Work Started */}
            {order.startedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.iconPending}`}>
                  <span className={styles.clockIcon}></span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Work Started</div>
                  <div className={styles.timelineDate}>{moment(order.startedAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}

            {/* Order Completed */}
            {order.completedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.iconSuccess}`}>
                  <span className={styles.checkIcon}></span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Order Completed</div>
                  <div className={styles.timelineDate}>{moment(order.completedAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}

            {/* Completion Confirmed */}
            {order.confirmedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.iconSuccess}`}>
                  <span className={styles.checkIcon}></span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Completion Confirmed</div>
                  <div className={styles.timelineDate}>{moment(order.confirmedAt).format('DD/MM/YYYY HH:mm')}</div>
                </div>
              </div>
            )}

            {/* Reviewed */}
            {order.reviewedAt && (
              <div className={styles.timelineItem}>
                <div className={`${styles.timelineIcon} ${styles.iconSuccess}`}>
                  <span className={styles.checkIcon}></span>
                </div>
                <div className={styles.timelineContent}>
                  <div className={styles.timelineTitle}>Customer Review</div>
                  <div className={styles.timelineDate}>{moment(order.reviewedAt).format('DD/MM/YYYY HH:mm')}</div>
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
                className={styles.selectInput}
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
                className={styles.textareaInput}
                rows={3}
              />
            </div>

            <div className={styles.modalActions}>
              <Button style="outline" onClick={handleCloseStatusModal} disabled={updatingStatus}>
                Cancel
              </Button>
              <Button
                primary
                onClick={handleUpdateStatus}
                disabled={updatingStatus || !selectedStatus || !statusReason.trim()}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetailPage
