import React, { useCallback, useEffect, useState } from 'react'
import styles from './wallets.module.scss'
import Card from '@/components/atoms/cards'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import { IoWallet, IoArrowBack } from 'react-icons/io5'
import { FaPlus, FaMinus, FaExchangeAlt } from 'react-icons/fa'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import Button from '@/components/atoms/buttons/button'
import walletsController from '@/controllers/wallets'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import Table from '@/components/shared/Table'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'
import { Modal } from 'react-bootstrap'

const WalletDetailPage = () => {
  const router = useRouter()
  const { id } = router.query

  const [pageLoading, setPageLoading] = useState(true)
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterCount, setFilterCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [formData, setFormData] = useState({
    amount: '',
    type: 'DEPOSIT',
    reference: '',
    notes: ''
  })

  useEffect(() => {
    if (!id) return

    const fetchWallet = async () => {
      try {
        const res = await walletsController.getWalletById(id)
        if (res && res.success) {
          setWallet(res.data.wallet)
        } else {
          notify(res?.error?.message || 'Failed to load wallet')
        }
      } catch (e) {
        notify('Error loading wallet')
      }
    }

    const fetchTransactions = async () => {
      try {
        const queryParams = new URLSearchParams()
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        const query = queryParams.toString()

        const res = await walletsController.getWalletTransactions(id, query)
        if (res && res.success) {
          setTransactions(res.data.items || res.data.transactions || [])
          setFilterCount(res.data.filterCount || res.data.total || 0)
        }
      } catch (e) {
        console.log('Error loading transactions', e)
      } finally {
        setPageLoading(false)
      }
    }

    fetchWallet()
    fetchTransactions()
  }, [id, page, limit, refreshKey])

  const handleBack = () => router.push('/wallets')

  const handlePaginate = useCallback(
    (e = null) => {
      e.stopPropagation()

      const pageItem = e.target.closest('.MuiPaginationItem-root')
      const isPrev = pageItem?.getAttribute('aria-label') === 'Go to previous page'
      const isNext = pageItem?.getAttribute('aria-label') === 'Go to next page'

      let newPage
      if (isPrev && page > 1) {
        newPage = page - 1
      } else if (isNext && page < Math.ceil(filterCount / limit)) {
        newPage = page + 1
      } else if (!isPrev && !isNext && !isNaN(+e.target.textContent)) {
        newPage = +e.target.textContent
      }

      if (newPage) {
        setPage(newPage)
      }
    },
    [page, filterCount, limit],
  )

  const formatBalance = (balance) => {
    const num = parseFloat(balance) || 0
    return `$${num.toFixed(2)}`
  }

  const getWalletTypeClass = (type) => {
    switch (type) {
      case 'CUSTOMER': return styles.customer
      case 'WORKER': return styles.worker
      case 'SUPPORT': return styles.support
      default: return ''
    }
  }

  const getTransactionTypeBadge = (type) => {
    const typeClass = styles[type.toLowerCase()] || ''
    return <span className={`${styles.transactionType} ${typeClass}`}>{type}</span>
  }

  const handleAddBalance = async () => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      notify('Please enter a valid amount')
      return
    }

    setModalLoading(true)
    try {
      const res = await walletsController.addBalance(id, {
        amount: parseFloat(formData.amount),
        transactionType: formData.type,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined
      })

      if (res && res.success) {
        notify('Balance added successfully', 'success')
        setShowAddModal(false)
        setFormData({ amount: '', type: 'DEPOSIT', reference: '', notes: '' })
        setRefreshKey(v => v + 1)
      } else {
        notify(res?.error?.message || 'Failed to add balance')
      }
    } catch (e) {
      notify('Error adding balance')
    } finally {
      setModalLoading(false)
    }
  }

  const handleAdjustBalance = async () => {
    if (!formData.amount || parseFloat(formData.amount) === 0) {
      notify('Please enter a valid amount')
      return
    }

    setModalLoading(true)
    try {
      const res = await walletsController.adjustBalance(id, {
        amount: parseFloat(formData.amount),
        reference: formData.reference || undefined,
        notes: formData.notes || undefined
      })

      if (res && res.success) {
        notify('Balance adjusted successfully', 'success')
        setShowAdjustModal(false)
        setFormData({ amount: '', type: 'DEPOSIT', reference: '', notes: '' })
        setRefreshKey(v => v + 1)
      } else {
        notify(res?.error?.message || 'Failed to adjust balance')
      }
    } catch (e) {
      notify('Error adjusting balance')
    } finally {
      setModalLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    try {
      const res = await walletsController.toggleWalletStatus(id, !wallet.isActive)
      if (res && res.success) {
        notify(`Wallet ${wallet.isActive ? 'deactivated' : 'activated'} successfully`, 'success')
        setRefreshKey(v => v + 1)
      } else {
        notify(res?.error?.message || 'Failed to update status')
      }
    } catch (e) {
      notify('Error updating wallet status')
    }
  }

  if (pageLoading) return <Loading />
  if (!wallet) return <div>Wallet not found</div>

  const availableBalance = (parseFloat(wallet.balance) - parseFloat(wallet.pendingBalance)).toFixed(2)

  return (
    <div className={styles.walletDetail}>
      <PageHead current="Wallet Details">
        <div className={styles.backLink} onClick={handleBack}>
          <IoArrowBack /> Back to Wallets
        </div>
      </PageHead>
      <Container>
        <Card>
          <div className={styles.walletHeader}>
            <div className={styles.walletInfo}>
              <div className={styles.walletId}>Wallet ID: {wallet.id}</div>
              <div className={styles.userName}>
                <IoWallet />
                {wallet.user?.username || 'Unknown User'}
                <span className={`${styles.walletType} ${getWalletTypeClass(wallet.walletType)}`}>
                  {wallet.walletType}
                </span>
              </div>
              <div style={{ color: '#7a7e85', fontSize: '0.9rem' }}>
                Discord ID: {wallet.user?.discordId || '-'}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                {wallet.isActive ? (
                  <Badge type="success">Active</Badge>
                ) : (
                  <Badge type="danger">Inactive</Badge>
                )}
              </div>
            </div>

            <div className={styles.balanceCard}>
              <div className={styles.balanceLabel}>Total Balance</div>
              <div className={styles.balanceValue}>{formatBalance(wallet.balance)} {wallet.currency}</div>
              <div className={styles.balanceDetails}>
                <div className={styles.detailItem}>
                  <div className={styles.label}>Pending</div>
                  <div className={styles.value}>{formatBalance(wallet.pendingBalance)}</div>
                </div>
                <div className={styles.detailItem}>
                  <div className={styles.label}>Available</div>
                  <div className={styles.value}>${availableBalance}</div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <Button type="success" onClick={() => setShowAddModal(true)}>
              <FaPlus style={{ marginRight: 8 }} /> Add Balance
            </Button>
            <Button type="warning" onClick={() => setShowAdjustModal(true)}>
              <FaExchangeAlt style={{ marginRight: 8 }} /> Adjust Balance
            </Button>
            <Button type={wallet.isActive ? 'danger' : 'success'} onClick={handleToggleStatus}>
              {wallet.isActive ? 'Deactivate Wallet' : 'Activate Wallet'}
            </Button>
          </div>
        </Card>

        <Card style={{ marginTop: '1.5rem' }}>
          <div className={styles.transactionsSection}>
            <h3 className={styles.sectionTitle}>Transaction History</h3>

            <div className={styles.table}>
              <Table
                columns={[
                  { key: 'index', header: '#', width: '48px', render: (_t, idx) => (page - 1) * limit + idx + 1 },
                  { key: 'date', header: 'Date', flex: 1, render: (t) => moment(t.createdAt).format('DD/MM/YYYY HH:mm') },
                  { key: 'type', header: 'Type', flex: 1, render: (t) => getTransactionTypeBadge(t.type) },
                  { key: 'amount', header: 'Amount', flex: 1, render: (t) => {
                    const amount = parseFloat(t.amount)
                    const isPositive = amount >= 0
                    return (
                      <span className={`${styles.amount} ${isPositive ? styles.positive : styles.negative}`}>
                        {isPositive ? '+' : ''}{formatBalance(amount)}
                      </span>
                    )
                  }},
                  { key: 'balanceAfter', header: 'Balance After', flex: 1, render: (t) => formatBalance(t.balanceAfter) },
                  { key: 'reference', header: 'Reference', flex: 1.5, render: (t) => t.reference || '-' },
                  { key: 'notes', header: 'Notes', flex: 2, render: (t) => (
                    <span style={{ fontSize: '0.85rem', color: '#5a5d61' }}>
                      {t.notes ? (t.notes.length > 50 ? t.notes.substring(0, 50) + '...' : t.notes) : '-'}
                    </span>
                  )},
                ]}
                data={transactions}
              />
            </div>

            {transactions.length > 0 && (
              <div className="tableFooter">
                <div className="limit">
                  <span>View</span>
                  <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <span>transactions per page</span>
                </div>
                <Pagination
                  page={page}
                  count={Math.ceil(filterCount / limit)}
                  shape="rounded"
                  onClick={handlePaginate}
                />
              </div>
            )}

            {transactions.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#7a7e85' }}>
                No transactions found
              </div>
            )}
          </div>
        </Card>
      </Container>

      {/* Add Balance Modal */}
      <Modal show={showAddModal} onHide={() => !modalLoading && setShowAddModal(false)} centered>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Add Balance</h3>
            <button className={styles.closeBtn} onClick={() => !modalLoading && setShowAddModal(false)}>&times;</button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Amount (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="DEPOSIT">Deposit</option>
                <option value="ADJUSTMENT">Adjustment</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Reference (Optional)</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Transaction reference"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button type="secondary" onClick={() => setShowAddModal(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="success" onClick={handleAddBalance} disabled={modalLoading}>
              {modalLoading ? 'Adding...' : 'Add Balance'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal show={showAdjustModal} onHide={() => !modalLoading && setShowAdjustModal(false)} centered>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h3>Adjust Balance</h3>
            <button className={styles.closeBtn} onClick={() => !modalLoading && setShowAdjustModal(false)}>&times;</button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Amount (USD) - Use negative for deduction</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 50 or -25"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Reference (Optional)</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Transaction reference"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Reason for adjustment"
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button type="secondary" onClick={() => setShowAdjustModal(false)} disabled={modalLoading}>
              Cancel
            </Button>
            <Button type="warning" onClick={handleAdjustBalance} disabled={modalLoading}>
              {modalLoading ? 'Adjusting...' : 'Adjust Balance'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default WalletDetailPage
