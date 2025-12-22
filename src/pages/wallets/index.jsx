import React, { useCallback, useEffect, useState } from 'react'
import styles from './wallets.module.scss'
import PageTitle from '@/components/atoms/labels/pageTitle'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import { IoWallet } from 'react-icons/io5'
import { FaUsers, FaUserTie, FaHeadset } from 'react-icons/fa'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import walletsController from '@/controllers/wallets'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import Table from '@/components/shared/Table'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const WalletsPage = () => {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterCount, setFilterCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [walletType, setWalletType] = useState('')
  const [stats, setStats] = useState({
    totalWallets: 0,
    customerWallets: 0,
    workerWallets: 0,
    supportWallets: 0,
    totalBalance: 0
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
        if (walletType) queryParams.append('walletType', walletType)
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        const query = queryParams.toString()

        console.log('[WalletsPage] Fetching with query:', query)
        const res = await walletsController.getAllWallets(query)
        console.log('[WalletsPage] Response:', res)
        console.log('[WalletsPage] Response success:', res?.success)
        console.log('[WalletsPage] Response data:', res?.data)

        if (res && res.success) {
          const items = res.data.items || res.data.wallets || []
          console.log('[WalletsPage] Items:', items)
          console.log('[WalletsPage] Items length:', items.length)
          setItems(items)
          setFilterCount(res.data.filterCount || res.data.total || 0)
        } else {
          console.error('[WalletsPage] Failed:', res)
          console.error('[WalletsPage] Error:', res?.error)
          notify(res?.error?.message || 'Failed to load wallets')
        }
      } catch (e) {
        console.error('[WalletsPage] Exception:', e)
        notify('Error loading wallets')
      } finally {
        setPageLoading(false)
      }
    }

    const fetchStats = async () => {
      try {
        const res = await walletsController.getWalletStats()
        if (res && res.success && res.data.stats) {
          setStats(res.data.stats)
        }
      } catch (e) {
        console.log('Error loading stats', e)
      }
    }

    fetchData()
    fetchStats()
  }, [refreshKey, page, limit, search, walletType])

  const handleView = (id) => router.push(`/wallets/${id}`)

  const handleRefresh = () => setRefreshKey(v => v + 1)

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

  const getWalletTypeBadge = (type) => {
    switch (type) {
      case 'CUSTOMER':
        return <Badge type="info">Customer</Badge>
      case 'WORKER':
        return <Badge type="success">Worker</Badge>
      case 'SUPPORT':
        return <Badge type="warning">Support</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.wallets}>
      <PageHead current="Wallets">
        <Head title="Wallet Management" noButton>Manage user wallets and transactions</Head>
      </PageHead>
      <Container>
        {/* Stats Cards */}
        <div className={styles.statsCards}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.blue}`}>
              <IoWallet />
            </div>
            <div className={styles.statValue}>{stats.totalWallets || 0}</div>
            <div className={styles.statLabel}>Total Wallets</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.green}`}>
              <FaUsers />
            </div>
            <div className={styles.statValue}>{stats.customerWallets || 0}</div>
            <div className={styles.statLabel}>Customer Wallets</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.purple}`}>
              <FaUserTie />
            </div>
            <div className={styles.statValue}>{stats.workerWallets || 0}</div>
            <div className={styles.statLabel}>Worker Wallets</div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.orange}`}>
              <FaHeadset />
            </div>
            <div className={styles.statValue}>{stats.supportWallets || 0}</div>
            <div className={styles.statLabel}>Support Wallets</div>
          </div>
        </div>

        <Card>
          <div className="mb-4 d-flex gap-3 align-items-center flex-wrap">
            <div style={{ flex: 1, maxWidth: 400 }}>
              <SearchInput value={search} valueChange={handleSearchChange} placeHolder="Search by username or Discord ID" defaultInput={true} />
            </div>
            <div className={styles.filters}>
              <button
                className={`${styles.filterBtn} ${walletType === '' ? styles.active : ''}`}
                onClick={() => { setWalletType(''); setPage(1); }}
              >
                All
              </button>
              <button
                className={`${styles.filterBtn} ${walletType === 'CUSTOMER' ? styles.active : ''}`}
                onClick={() => { setWalletType('CUSTOMER'); setPage(1); }}
              >
                Customers
              </button>
              <button
                className={`${styles.filterBtn} ${walletType === 'WORKER' ? styles.active : ''}`}
                onClick={() => { setWalletType('WORKER'); setPage(1); }}
              >
                Workers
              </button>
              <button
                className={`${styles.filterBtn} ${walletType === 'SUPPORT' ? styles.active : ''}`}
                onClick={() => { setWalletType('SUPPORT'); setPage(1); }}
              >
                Support
              </button>
            </div>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead} />
            <Table
              columns={[
                { key: 'index', header: '#', className: 'index', width: '48px', render: (_w, idx) => (page - 1) * limit + idx + 1 },
                { key: 'user', header: 'User', className: 'user', flex: 2, render: (w) => (
                  <div>
                    <div style={{ fontWeight: 600, color: '#12161c' }}>
                      {w.user?.discordDisplayName || w.user?.fullname || w.user?.username || w.user?.email || 'Unknown User'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#7a7e85' }}>
                      {w.user?.discordId ? `Discord: ${w.user.discordId}` : '-'}
                      {w.user?.discordUsername && w.user?.discordDisplayName && (
                        <span style={{ marginLeft: '0.5rem' }}>({w.user.discordUsername})</span>
                      )}
                    </div>
                  </div>
                ) },
                { key: 'type', header: 'Type', className: 'type', flex: 1, render: (w) => getWalletTypeBadge(w.walletType) },
                { key: 'balance', header: 'Balance', className: 'balance', flex: 1, render: (w) => (
                  <span style={{ fontWeight: 600, color: '#22c55e' }}>{formatBalance(w.balance)}</span>
                ) },
                { key: 'deposit', header: 'Deposit', className: 'deposit', flex: 1, render: (w) => (
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{formatBalance(w.deposit)}</span>
                ) },
                { key: 'pending', header: 'Pending', className: 'pending', flex: 1, render: (w) => (
                  <span style={{ color: '#f97316' }}>{formatBalance(w.pendingBalance)}</span>
                ) },
                { key: 'status', header: 'Status', className: 'status', flex: 1, render: (w) => (
                  w.isActive ? <Badge type="success">Active</Badge> : <Badge type="danger">Inactive</Badge>
                ) },
                { key: 'createdAt', header: 'Created', className: 'createdAt', flex: 1, render: (w) => w.createdAt ? moment(w.createdAt).format('DD/MM/YYYY') : '-' },
                { key: 'actions', header: 'Actions', className: 'actions', width: '100px', render: (w) => (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleView(w.id)}
                  >
                    View
                  </button>
                ) },
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
              <span>wallets per page</span>
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

export default WalletsPage
