import React, { useCallback, useEffect, useState } from 'react'
import styles from './transactions.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import Table from '@/components/shared/Table'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'
import { IoWallet, IoArrowUp, IoArrowDown, IoSwapHorizontal } from 'react-icons/io5'

const TransactionsPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterCount, setFilterCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [typeFilter, setTypeFilter] = useState('')
  const [stats, setStats] = useState({
    totalTransactions: 0,
    todayTransactions: 0,
    totalDepositVolume: 0,
    totalWithdrawalVolume: 0,
  })

  const handleSearchChange = (event) => {
    setSearch(event)
    setPage(1)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams()
        if (search) queryParams.append('search', search)
        if (typeFilter) queryParams.append('type', typeFilter)
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        const query = queryParams.toString()

        console.log('[TransactionsPage] Fetching with query:', query)
        const res = await adminController.getAllTransactions(query)
        console.log('[TransactionsPage] Response:', res)

        if (res && res.success) {
          const items = res.data.items || res.data.transactions || []
          console.log('[TransactionsPage] Items:', items)
          setItems(items)
          setFilterCount(res.data.filterCount || res.data.total || 0)
        } else {
          console.error('[TransactionsPage] Failed:', res)
          notify(res?.error?.message || 'Failed to load transactions')
        }
      } catch (e) {
        console.error('[TransactionsPage] Error:', e)
        notify('Error loading transactions')
      } finally {
        setPageLoading(false)
      }
    }

    const fetchStats = async () => {
      try {
        const res = await adminController.getTransactionStats()
        if (res && res.success) {
          setStats(res.data)
        }
      } catch (e) {
        console.log('Error loading stats', e)
      }
    }

    fetchData()
    fetchStats()
  }, [refreshKey, page, limit, search, typeFilter])

  const handleRefresh = () => setRefreshKey((v) => v + 1)

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
    [page, filterCount, limit]
  )

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const getTypeBadge = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return <Badge type="success">Deposit</Badge>
      case 'WITHDRAWAL':
        return <Badge type="danger">Withdrawal</Badge>
      case 'PAYMENT':
        return <Badge type="warning">Payment</Badge>
      case 'REFUND':
        return <Badge type="info">Refund</Badge>
      case 'EARNING':
        return <Badge type="success">Earning</Badge>
      case 'COMMISSION':
        return <Badge type="info">Commission</Badge>
      case 'SYSTEM_FEE':
        return <Badge type="secondary">System Fee</Badge>
      case 'ADJUSTMENT':
        return <Badge type="warning">Adjustment</Badge>
      case 'RELEASE':
        return <Badge type="info">Release</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge type="success">Completed</Badge>
      case 'PENDING':
        return <Badge type="warning">Pending</Badge>
      case 'FAILED':
        return <Badge type="danger">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.transactions}>
      <PageHead current="Transactions">
        <Head title="Transaction Management" noButton>
          View and manage all transactions
        </Head>
      </PageHead>
      <Container>
        {/* Stats Cards */}
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <IoSwapHorizontal />
            </div>
            <div className={styles.statValue}>{stats.totalTransactions || 0}</div>
            <div className={styles.statLabel}>Total Transactions</div>
            <div className={styles.statSubtext}>{stats.todayTransactions || 0} today</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <IoArrowDown />
            </div>
            <div className={styles.statValue}>{formatCurrency(stats.totalDepositVolume || 0)}</div>
            <div className={styles.statLabel}>Total Deposits</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.red}`}>
              <IoArrowUp />
            </div>
            <div className={styles.statValue}>
              {formatCurrency(stats.totalWithdrawalVolume || 0)}
            </div>
            <div className={styles.statLabel}>Total Withdrawals</div>
          </div>
        </div>

        <Card>
          <div className="mb-4 d-flex gap-3 align-items-center flex-wrap">
            <div style={{ flex: 1, maxWidth: 400 }}>
              <SearchInput
                value={search}
                valueChange={handleSearchChange}
                placeHolder="Search by username or reference"
                defaultInput={true}
              />
            </div>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${typeFilter === '' ? styles.active : ''}`}
                onClick={() => {
                  setTypeFilter('')
                  setPage(1)
                }}
              >
                All
              </button>
              <button
                className={`${styles.filterBtn} ${typeFilter === 'DEPOSIT' ? styles.active : ''}`}
                onClick={() => {
                  setTypeFilter('DEPOSIT')
                  setPage(1)
                }}
              >
                Deposits
              </button>
              <button
                className={`${styles.filterBtn} ${typeFilter === 'WITHDRAWAL' ? styles.active : ''}`}
                onClick={() => {
                  setTypeFilter('WITHDRAWAL')
                  setPage(1)
                }}
              >
                Withdrawals
              </button>
              <button
                className={`${styles.filterBtn} ${typeFilter === 'PAYMENT' ? styles.active : ''}`}
                onClick={() => {
                  setTypeFilter('PAYMENT')
                  setPage(1)
                }}
              >
                Payments
              </button>
            </div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead} />
            <Table
              columns={[
                {
                  key: 'index',
                  header: '#',
                  className: 'index',
                  width: '48px',
                  render: (_t, idx) => (page - 1) * limit + idx + 1,
                },
                {
                  key: 'id',
                  header: 'Transaction ID',
                  className: 'id',
                  flex: 1.5,
                  render: (t) => (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#7a7e85', fontFamily: 'monospace' }}>
                        {t.id.substring(0, 12)}...
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'user',
                  header: 'User',
                  className: 'user',
                  flex: 1.5,
                  render: (t) => (
                    <div>
                      <div style={{ fontWeight: 500, color: '#12161c' }}>
                        {t.wallet?.user?.discordDisplayName || t.wallet?.user?.fullname || t.wallet?.user?.username || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#7a7e85' }}>
                        {t.wallet?.user?.discordId ? `Discord: ${t.wallet.user.discordId}` : (t.wallet?.user?.username || t.wallet?.walletType || '-')}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'type',
                  header: 'Type',
                  className: 'type',
                  flex: 1,
                  render: (t) => getTypeBadge(t.type),
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  className: 'amount',
                  flex: 1,
                  render: (t) => {
                    const amount = parseFloat(t.amount)
                    const isPositive = amount > 0
                    return (
                      <span
                        style={{
                          fontWeight: 600,
                          color: isPositive ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {isPositive ? '+' : ''}
                        {formatCurrency(amount)}
                      </span>
                    )
                  },
                },
                {
                  key: 'status',
                  header: 'Status',
                  className: 'status',
                  flex: 1,
                  render: (t) => getStatusBadge(t.status),
                },
                {
                  key: 'order',
                  header: 'Order',
                  className: 'order',
                  flex: 1,
                  render: (t) =>
                    t.order ? (
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                        #{t.order.orderNumber}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>-</span>
                    ),
                },
                {
                  key: 'createdAt',
                  header: 'Date',
                  className: 'createdAt',
                  flex: 1,
                  render: (t) =>
                    t.createdAt ? moment(t.createdAt).format('DD/MM/YYYY HH:mm') : '-',
                },
              ]}
              data={items}
            />
          </div>
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
        </Card>
      </Container>
    </div>
  )
}

export default TransactionsPage
