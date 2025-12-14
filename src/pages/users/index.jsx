import React, { useEffect, useState } from 'react'
import styles from './users.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Button from '@/components/atoms/buttons/button'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

// Role info with icons and colors
const ROLE_INFO = {
    admin: { label: 'Admin', icon: '👑', color: '#e74c3c' },
    support: { label: 'Support', icon: '🎧', color: '#f39c12' },
    worker: { label: 'Worker', icon: '⚒️', color: '#3498db' },
    customer: { label: 'Customer', icon: '👤', color: '#27ae60' },
}

const UsersPage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [usersList, setUsersList] = useState([])
  const [stats, setStats] = useState(null)

  // Filters
  const [roleFilter, setRoleFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    fetchUsers()
    fetchStats()
  }, [roleFilter, page, limit])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      if (roleFilter) queryParams.append('discordRole', roleFilter)
      if (searchQuery) queryParams.append('search', searchQuery)
      queryParams.append('page', String(page))
      queryParams.append('limit', String(limit))

      const query = queryParams.toString()
      const response = await adminController.getAllUsers(query)

      if (response && response.success && response.data) {
        setUsersList(response.data.items || response.data.users || [])
        setTotalCount(response.data.filterCount || response.data.total || 0)
      } else {
        notify('Failed to load users', 'error')
      }
    } catch (error) {
      console.error('[Users] Error fetching:', error)
      notify('Error loading users', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await adminController.getUserStats()
      if (response && response.success && response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('[Users] Error fetching stats:', error)
    }
  }

  const handleViewUser = (userId) => {
    router.push(`/users/${userId}`)
  }

  const handleSearch = () => {
    setPage(1)
    fetchUsers()
  }

  const handlePaginate = (event, value) => {
    setPage(value)
  }

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const formatDate = (date) => {
    return moment(date).format('MMM D, YYYY')
  }

  const getUserRole = (user) => {
    // Priority: system admin > discordRole (non-customer) > wallet type > discordRole > null
    if (user.role === 'admin') return 'admin'
    if (user.discordRole && user.discordRole !== 'customer') return user.discordRole
    if (user.wallet?.walletType) {
      const walletTypeMap = {
        'WORKER': 'worker',
        'SUPPORT': 'support',
        'CUSTOMER': 'customer'
      }
      return walletTypeMap[user.wallet.walletType]
    }
    if (user.discordRole) return user.discordRole
    return null
  }

  if (loading && !usersList.length) return <Loading />

  return (
    <div className={styles.usersPage}>
      <PageHead current="Users">
        <Head title="User Management" back="/dashboard" />
      </PageHead>

      <Container>
        {/* Statistics Cards */}
        {stats && (
          <div className={styles.statsGrid}>
            <Card className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#3498db' }}>
                👥
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{stats.totalUsers || 0}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#27ae60' }}>
                💰
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{stats.usersWithWallets || 0}</div>
                <div className={styles.statLabel}>Users with Wallets</div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#9b59b6' }}>
                🛒
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{stats.activeCustomers || 0}</div>
                <div className={styles.statLabel}>Active Customers</div>
              </div>
            </Card>

            <Card className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: '#f39c12' }}>
                ⚒️
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statValue}>{stats.activeWorkers || 0}</div>
                <div className={styles.statLabel}>Active Workers</div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className={styles.filtersCard}>
          <div className={styles.filtersRow}>
            <div className={styles.filterGroup}>
              <label>Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className={styles.select}
              >
                <option value="">All Roles</option>
                {Object.entries(ROLE_INFO).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.icon} {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Search</label>
              <div className={styles.searchRow}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Username, email or Discord ID..."
                  className={styles.searchInput}
                />
                <Button onClick={handleSearch} primary small>
                  Search
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card className={styles.usersListCard}>
          <div className={styles.listHeader}>
            <h3>Users ({totalCount})</h3>
          </div>

          {usersList.length > 0 ? (
            <>
              {/* Table Header */}
              <div className={styles.tableHeader}>
                <div className={styles.headerMain}>
                  <div className={styles.headerCell}>User</div>
                </div>
                <div className={styles.headerMeta}>
                  <div className={styles.headerCell}>Wallet</div>
                  <div className={styles.headerCell}>Orders</div>
                  <div className={styles.headerCell}>Joined</div>
                </div>
              </div>

              {/* Users List */}
              <div className={styles.usersList}>
                {usersList.map((user, index) => {
                  const userRole = getUserRole(user)
                  const roleInfo = userRole ? ROLE_INFO[userRole] : null

                  return (
                    <div
                      key={user.id}
                      className={styles.userRow}
                      onClick={() => handleViewUser(user.id)}
                    >
                      <div className={styles.userMain}>
                        <div className={styles.userAvatar}>
                          {(user.username || user.fullname || 'U')[0].toUpperCase()}
                        </div>

                        <div className={styles.userInfo}>
                          <div className={styles.userName}>
                            {user.username || user.fullname || 'Unknown User'}
                            {roleInfo && (
                              <span
                                className={styles.roleBadge}
                                style={{ background: roleInfo.color }}
                              >
                                {roleInfo.icon} {roleInfo.label}
                              </span>
                            )}
                          </div>
                          <div className={styles.userEmail}>
                            {user.email || 'No email'}
                          </div>
                        </div>
                      </div>

                      <div className={styles.userMeta}>
                        {user.wallet ? (
                          <div className={styles.walletInfo}>
                            <div className={styles.walletBalance}>
                              {formatCurrency(user.wallet.balance)}
                            </div>
                            <div className={styles.walletType}>
                              {user.wallet.walletType}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.walletInfo}>
                            <div className={styles.noWallet}>No wallet</div>
                          </div>
                        )}

                        <div className={styles.ordersInfo}>
                          <div className={styles.ordersStat}>
                            <span className={styles.ordersLabel}>C:</span>
                            <span className={styles.ordersValue}>{user.ordersAsCustomer || 0}</span>
                          </div>
                          <div className={styles.ordersStat}>
                            <span className={styles.ordersLabel}>W:</span>
                            <span className={styles.ordersValue}>{user.ordersAsWorker || 0}</span>
                          </div>
                        </div>

                        <div className={styles.userDate}>
                          {formatDate(user.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              <div className={styles.tableFooter}>
                <div className={styles.limitSelector}>
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
                  count={Math.ceil(totalCount / limit)}
                  shape="rounded"
                  onChange={handlePaginate}
                />
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👥</div>
              <h3>No users found</h3>
              <p>No users match your current filters</p>
            </div>
          )}
        </Card>
      </Container>
    </div>
  )
}


export default UsersPage
