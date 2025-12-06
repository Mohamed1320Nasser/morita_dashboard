import React, { useCallback, useEffect, useState } from 'react'
import styles from './users.module.scss'
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
import { IoPeople, IoWallet, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'

const UsersPage = () => {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterCount, setFilterCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [roleFilter, setRoleFilter] = useState('') // discordRole filter
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithWallets: 0,
    activeCustomers: 0,
    activeWorkers: 0,
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
        if (roleFilter) queryParams.append('discordRole', roleFilter)
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        const query = queryParams.toString()

        const res = await adminController.getAllUsers(query)
        if (res && res.success) {
          setItems(res.data.items || res.data.users || [])
          setFilterCount(res.data.filterCount || res.data.total || 0)
        } else {
          notify(res?.error?.message || 'Failed to load users')
        }
      } catch (e) {
        notify('Error loading users')
      } finally {
        setPageLoading(false)
      }
    }

    const fetchStats = async () => {
      try {
        const res = await adminController.getUserStats()
        if (res && res.success) {
          setStats(res.data)
        }
      } catch (e) {
        console.log('Error loading stats', e)
      }
    }

    fetchData()
    fetchStats()
  }, [refreshKey, page, limit, search, roleFilter])

  const handleView = (id) => router.push(`/users/${id}`)

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

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Badge type="danger">Admin</Badge>
      case 'support':
        return <Badge type="warning">Support</Badge>
      case 'worker':
        return <Badge type="success">Worker</Badge>
      case 'customer':
        return <Badge type="info">Customer</Badge>
      default:
        return <Badge>{role || 'N/A'}</Badge>
    }
  }

  const truncateEmail = (email, maxLength = 30) => {
    if (!email) return '-'
    if (email.length <= maxLength) return email
    return email.substring(0, maxLength) + '...'
  }

  const truncateDiscordId = (discordId, maxLength = 16) => {
    if (!discordId) return '-'
    if (discordId.length <= maxLength) return discordId
    return discordId.substring(0, maxLength) + '...'
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.users}>
      <PageHead current="Users">
        <Head title="User Management" noButton>
          Manage all users in the system
        </Head>
      </PageHead>
      <Container>
        {/* Stats Cards */}
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <IoPeople />
            </div>
            <div className={styles.statValue}>{stats.totalUsers || 0}</div>
            <div className={styles.statLabel}>Total Users</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <IoWallet />
            </div>
            <div className={styles.statValue}>{stats.usersWithWallets || 0}</div>
            <div className={styles.statLabel}>Users with Wallets</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.statValue}>{stats.activeCustomers || 0}</div>
            <div className={styles.statLabel}>Active Customers</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>
              <IoCheckmarkCircle />
            </div>
            <div className={styles.statValue}>{stats.activeWorkers || 0}</div>
            <div className={styles.statLabel}>Active Workers</div>
          </div>
        </div>

        <Card>
          <div className="mb-4 d-flex gap-3 align-items-center flex-wrap">
            <div style={{ flex: 1, maxWidth: 400 }}>
              <SearchInput
                value={search}
                valueChange={handleSearchChange}
                placeHolder="Search by username, email or Discord ID"
                defaultInput={true}
              />
            </div>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${roleFilter === '' ? styles.active : ''}`}
                onClick={() => {
                  setRoleFilter('')
                  setPage(1)
                }}
              >
                All
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === 'admin' ? styles.active : ''}`}
                onClick={() => {
                  setRoleFilter('admin')
                  setPage(1)
                }}
              >
                Admins
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === 'support' ? styles.active : ''}`}
                onClick={() => {
                  setRoleFilter('support')
                  setPage(1)
                }}
              >
                Support
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === 'worker' ? styles.active : ''}`}
                onClick={() => {
                  setRoleFilter('worker')
                  setPage(1)
                }}
              >
                Workers
              </button>
              <button
                className={`${styles.filterBtn} ${roleFilter === 'customer' ? styles.active : ''}`}
                onClick={() => {
                  setRoleFilter('customer')
                  setPage(1)
                }}
              >
                Customers
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
                  render: (_u, idx) => (page - 1) * limit + idx + 1,
                },
                {
                  key: 'user',
                  header: 'User',
                  className: 'user',
                  flex: 2.5,
                  render: (u) => (
                    <div>
                      <div style={{ fontWeight: 600, color: '#12161c', fontSize: '0.9rem' }}>
                        {u.username || u.fullname || 'Unknown'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#7a7e85' }} title={u.email}>
                        {truncateEmail(u.email)}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'discordId',
                  header: 'Discord ID',
                  className: 'discordId',
                  flex: 1.2,
                  render: (u) => (
                    <span style={{ fontSize: '0.8rem', color: '#7a7e85', fontFamily: 'monospace' }} title={u.discordId}>
                      {truncateDiscordId(u.discordId)}
                    </span>
                  ),
                },
                {
                  key: 'role',
                  header: 'Role',
                  className: 'role',
                  flex: 0.8,
                  render: (u) => {
                    // Priority logic:
                    // 1) System admin role (highest priority)
                    // 2) Discord role (if set and not customer)
                    // 3) Wallet type (derive from wallet)
                    // 4) Discord role even if customer
                    // 5) "Not Set" (no info available)

                    let role = null

                    // Priority 1: Check if user is system admin
                    if (u.role === 'admin') {
                      role = 'admin'
                    }
                    // Priority 2: Check discordRole (if not customer)
                    else if (u.discordRole && u.discordRole !== 'customer') {
                      role = u.discordRole
                    }
                    // Priority 3: Derive from wallet type
                    else if (u.wallet?.walletType) {
                      const walletTypeMap = {
                        'WORKER': 'worker',
                        'SUPPORT': 'support',
                        'CUSTOMER': 'customer'
                      }
                      role = walletTypeMap[u.wallet.walletType]
                    }
                    // Priority 4: Use discordRole even if customer
                    else if (u.discordRole) {
                      role = u.discordRole
                    }

                    // If still no role, show "Not Set"
                    if (!role) {
                      return <Badge type="secondary">Not Set</Badge>
                    }

                    return getRoleBadge(role)
                  },
                },
                {
                  key: 'wallet',
                  header: 'Wallet',
                  className: 'wallet',
                  flex: 1.2,
                  render: (u) =>
                    u.wallet ? (
                      <div>
                        <div style={{ fontWeight: 600, color: '#22c55e', fontSize: '0.9rem' }}>
                          {formatCurrency(u.wallet.balance)}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#7a7e85', textTransform: 'uppercase' }}>
                          {u.wallet.walletType}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No wallet</span>
                    ),
                },
                {
                  key: 'orders',
                  header: 'Orders',
                  className: 'orders',
                  flex: 1.2,
                  render: (u) => (
                    <div style={{ fontSize: '0.8rem' }}>
                      <div>
                        <span style={{ color: '#7a7e85' }}>C: </span>
                        <span style={{ fontWeight: 600 }}>{u.ordersAsCustomer || 0}</span>
                      </div>
                      <div>
                        <span style={{ color: '#7a7e85' }}>W: </span>
                        <span style={{ fontWeight: 600 }}>{u.ordersAsWorker || 0}</span>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'createdAt',
                  header: 'Joined',
                  className: 'createdAt',
                  flex: 0.9,
                  render: (u) => (
                    <span style={{ fontSize: '0.85rem' }}>
                      {u.createdAt ? moment(u.createdAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  className: 'actions',
                  width: '100px',
                  render: (u) => (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleView(u.id)}
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
              <span>users per page</span>
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


export default UsersPage
