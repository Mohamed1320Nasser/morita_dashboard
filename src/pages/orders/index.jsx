import React, { useCallback, useEffect, useState } from 'react'
import styles from './orders.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import Table from '@/components/shared/Table'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'
import { IoCart, IoTrendingUp, IoCheckmark, IoClose, IoDownload } from 'react-icons/io5'
import { exportToCSV, getTimestampFilename, ExportConfigs } from '@/utils/csvExport'
import { ORDER_STATUS, STATUS_LABELS, STATUS_BADGE_TYPES } from '@/constants/orderStatus'

const OrdersPage = () => {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterCount, setFilterCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
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
        if (statusFilter) queryParams.append('status', statusFilter)
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        const query = queryParams.toString()

        const res = await adminController.getAllOrders(query)
        if (res && res.success) {
          setItems(res.data.items || res.data.orders || [])
          setFilterCount(res.data.filterCount || res.data.total || 0)
        } else {
          notify(res?.error?.message || 'Failed to load orders')
        }
      } catch (e) {
        notify('Error loading orders')
      } finally {
        setPageLoading(false)
      }
    }

    const fetchStats = async () => {
      try {
        const res = await adminController.getOrderStats()
        if (res && res.success) {
          setStats(res.data)
        }
      } catch (e) {
        console.log('Error loading stats', e)
      }
    }

    fetchData()
    fetchStats()
  }, [refreshKey, page, limit, search, statusFilter])

  const handleView = (id) => router.push(`/orders/${id}`)

  const handleRefresh = () => setRefreshKey((v) => v + 1)

  const handleExport = async () => {
    try {
      // Fetch all orders without pagination
      const queryParams = new URLSearchParams()
      if (search) queryParams.append('search', search)
      if (statusFilter) queryParams.append('status', statusFilter)
      queryParams.append('limit', '1000') // Get up to 1000 records
      const query = queryParams.toString()

      const res = await adminController.getAllOrders(query)
      if (res && res.success) {
        const exportData = (res.data.items || res.data.orders || []).map((order) => ({
          ...order,
          createdAt: moment(order.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          completedAt: order.completedAt
            ? moment(order.completedAt).format('YYYY-MM-DD HH:mm:ss')
            : '',
          rating: order.rating || '',
          review: order.review || '',
          reviewedAt: order.reviewedAt
            ? moment(order.reviewedAt).format('YYYY-MM-DD HH:mm:ss')
            : '',
        }))

        exportToCSV(exportData, getTimestampFilename('orders'), ExportConfigs.orders.headers)
        notify('Orders exported successfully!', 'success')
      } else {
        notify('Failed to export orders')
      }
    } catch (e) {
      notify('Error exporting orders')
    }
  }

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

  const getStatusBadge = (status) => {
    const badgeType = STATUS_BADGE_TYPES[status] || 'secondary'
    const label = STATUS_LABELS[status] || status
    return <Badge type={badgeType}>{label}</Badge>
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.orders}>
      <PageHead current="Orders">
        <Head title="Order Management" noButton>
          Manage all orders in the system
        </Head>
      </PageHead>
      <Container>
        {/* Stats Cards */}
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <IoCart />
            </div>
            <div className={styles.statValue}>{stats.totalOrders || 0}</div>
            <div className={styles.statLabel}>Total Orders</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.yellow}`}>
              <IoTrendingUp />
            </div>
            <div className={styles.statValue}>{stats.inProgressOrders || 0}</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <IoCheckmark />
            </div>
            <div className={styles.statValue}>{stats.completedOrders || 0}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <IoTrendingUp />
            </div>
            <div className={styles.statValue}>{formatCurrency(stats.totalRevenue || 0)}</div>
            <div className={styles.statLabel}>Total Revenue</div>
          </div>
        </div>

        <Card>
          <div className={styles.filterSection}>
            <div className={styles.searchRow}>
              <div className={styles.searchInput}>
                <SearchInput
                  value={search}
                  valueChange={handleSearchChange}
                  placeHolder="Search by order number or customer"
                  defaultInput={true}
                />
              </div>
              <button className={styles.exportBtn} onClick={handleExport}>
                <IoDownload />
                Export CSV
              </button>
            </div>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${statusFilter === '' ? styles.active : ''}`}
                onClick={() => {
                  setStatusFilter('')
                  setPage(1)
                }}
              >
                All
              </button>
              {Object.entries(ORDER_STATUS).map(([key, value]) => (
                <button
                  key={key}
                  className={`${styles.filterBtn} ${statusFilter === value ? styles.active : ''}`}
                  onClick={() => {
                    setStatusFilter(value)
                    setPage(1)
                  }}
                >
                  {STATUS_LABELS[value]}
                </button>
              ))}
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
                  render: (_o, idx) => (page - 1) * limit + idx + 1,
                },
                {
                  key: 'orderNumber',
                  header: 'Order #',
                  className: 'orderNumber',
                  flex: 0.8,
                  render: (o) => (
                    <span style={{ fontWeight: 600, color: '#12161c' }}>
                      #{o.orderNumber}
                    </span>
                  ),
                },
                {
                  key: 'customer',
                  header: 'Customer',
                  className: 'customer',
                  flex: 1,
                  render: (o) => (
                    <span style={{ fontWeight: 500, color: '#12161c' }}>
                      {o.customer?.discordDisplayName || o.customer?.fullname || o.customer?.username || 'Unknown'}
                    </span>
                  ),
                },
                {
                  key: 'worker',
                  header: 'Worker',
                  className: 'worker',
                  flex: 1,
                  render: (o) =>
                    o.worker ? (
                      <span style={{ fontWeight: 500, color: '#12161c' }}>
                        {o.worker?.discordDisplayName || o.worker?.fullname || o.worker?.username}
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>Unassigned</span>
                    ),
                },
                {
                  key: 'value',
                  header: 'Value',
                  className: 'value',
                  flex: 1,
                  render: (o) => (
                    <span style={{ fontWeight: 600, color: '#22c55e' }}>
                      {formatCurrency(o.orderValue)}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  className: 'status',
                  flex: 1.5,
                  render: (o) => getStatusBadge(o.status),
                },
                {
                  key: 'rating',
                  header: 'Rating',
                  className: 'rating',
                  flex: 0.8,
                  render: (o) => {
                    if (!o.rating) return <span style={{ color: '#9ca3af' }}>-</span>
                    const stars = '⭐'.repeat(o.rating)
                    return (
                      <span
                        className={styles.ratingStars}
                        title={`${o.rating}/5`}
                      >
                        {stars}
                      </span>
                    )
                  },
                },
                {
                  key: 'createdAt',
                  header: 'Created',
                  className: 'createdAt',
                  flex: 1,
                  render: (o) =>
                    o.createdAt ? moment(o.createdAt).format('DD/MM/YYYY') : '-',
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  className: 'actions',
                  width: '100px',
                  render: (o) => (
                    <button
                      className={styles.viewBtn}
                      onClick={() => handleView(o.id)}
                    >
                      View
                    </button>
                  ),
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
              <span>orders per page</span>
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

export default OrdersPage
