import React, { useCallback, useEffect, useState } from 'react'
import styles from './users.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import KebabMenu from '@/components/shared/KebabMenu'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const ROLE_OPTIONS = [
    { value: 'admin', label: 'Admin', type: 'danger' },
    { value: 'support', label: 'Support', type: 'warning' },
    { value: 'worker', label: 'Worker', type: 'info' },
    { value: 'customer', label: 'Customer', type: 'success' },
]

const UsersPage = () => {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(true)

    const [items, setItems] = useState([])
    const [stats, setStats] = useState(null)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [filterCount, setFilterCount] = useState(0)

    const handleSearchChange = (value) => {
        setSearch(value)
        setPage(1)
    }

    const handleRoleChange = (value) => {
        setRoleFilter(value)
        setPage(1)
    }

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const queryParams = new URLSearchParams()
                if (search) queryParams.append('search', search)
                if (roleFilter) queryParams.append('discordRole', roleFilter)
                queryParams.append('page', String(page))
                queryParams.append('limit', String(limit))
                const query = queryParams.toString()

                const [usersRes, statsRes] = await Promise.all([
                    adminController.getAllUsers(query),
                    adminController.getUserStats(),
                ])

                if (usersRes && usersRes.success && usersRes.data) {
                    setItems(usersRes.data.items || usersRes.data.users || [])
                    setFilterCount(usersRes.data.filterCount || usersRes.data.total || 0)
                } else {
                    notify(usersRes?.error?.message || 'Failed to load users')
                }

                if (statsRes && statsRes.success && statsRes.data) {
                    setStats(statsRes.data)
                }
            } catch (e) {
                notify('Error loading users')
            } finally {
                setPageLoading(false)
            }
        }
        fetchAll()
    }, [page, limit, search, roleFilter])

    const handleView = (id) => router.push(`/users/${id}`)

    const handlePaginate = useCallback(
        (e = null) => {
            e.stopPropagation()

            const pageItem = e.target.closest('.MuiPaginationItem-root')
            const isPrev = pageItem?.getAttribute('aria-label') === 'Go to previous page'
            const isNext = pageItem?.getAttribute('aria-label') === 'Go to next page'

            let newPage
            if (isPrev && page > 1) newPage = page - 1
            else if (isNext && page < Math.ceil(filterCount / limit)) newPage = page + 1
            else if (!isPrev && !isNext && !isNaN(+e.target.textContent)) newPage = +e.target.textContent

            if (newPage) setPage(newPage)
        },
        [page, filterCount, limit],
    )

    const getUserRole = (user) => {
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

    const getRoleBadge = (user) => {
        const role = getUserRole(user)
        if (!role) return '-'
        const roleConfig = ROLE_OPTIONS.find(r => r.value === role)
        return <Badge type={roleConfig?.type || 'default'}>{roleConfig?.label || role}</Badge>
    }

    const formatCurrency = (amount) => {
        const num = parseFloat(amount) || 0
        return `$${num.toFixed(2)}`
    }

    const getUserDisplayName = (user) => {
        return user.discordDisplayName || user.fullname || user.username || 'Unknown User'
    }

    const getUserDiscord = (user) => {
        if (user.discordUsername) return `@${user.discordUsername}`
        if (user.discordId) return user.discordId
        return '-'
    }

    if (pageLoading) return <Loading />

    return (
        <div className={styles.users}>
            <PageHead current="Users">
                <Head title="Users" back="/dashboard" />
            </PageHead>

            <Container>
                {/* Stats Cards */}
                {stats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Users</div>
                            <div className={styles.statValue}>{stats.totalUsers || 0}</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.wallets}`}>
                            <div className={styles.statLabel}>With Wallets</div>
                            <div className={styles.statValue}>{stats.usersWithWallets || 0}</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.customers}`}>
                            <div className={styles.statLabel}>Active Customers</div>
                            <div className={styles.statValue}>{stats.activeCustomers || 0}</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.workers}`}>
                            <div className={styles.statLabel}>Active Workers</div>
                            <div className={styles.statValue}>{stats.activeWorkers || 0}</div>
                        </div>
                    </div>
                )}

                <Card>
                    <div className={styles.searchRow}>
                        <div className={styles.searchInput}>
                            <SearchInput
                                value={search}
                                valueChange={handleSearchChange}
                                placeHolder="Search by username, email or Discord ID"
                                defaultInput={true}
                            />
                        </div>
                        <select
                            className={styles.select}
                            value={roleFilter}
                            onChange={(e) => handleRoleChange(e.target.value)}
                        >
                            <option value="">All Roles</option>
                            {ROLE_OPTIONS.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.table}>

                        <Table
                            columns={[
                                { key: 'index', header: '#', render: (_user, idx) => (page - 1) * limit + idx + 1 },
                                { key: 'name', header: 'Name', render: (user) => getUserDisplayName(user) },
                                { key: 'discord', header: 'Discord', render: (user) => <span className={styles.discordCell}>{getUserDiscord(user)}</span> },
                                { key: 'role', header: 'Role', render: (user) => getRoleBadge(user) },
                                { key: 'wallet', header: 'Wallet', render: (user) => user.wallet ? <span className={styles.walletBalance}>{formatCurrency(user.wallet.balance)}</span> : <span className={styles.noWallet}>-</span> },
                                { key: 'orders', header: 'Orders', render: (user) => (user.ordersAsCustomer || 0) + (user.ordersAsWorker || 0) },
                                { key: 'createdAt', header: 'Joined', render: (user) => user.createdAt ? moment(user.createdAt).format('DD/MM/YYYY') : '-' },
                                { key: 'actions', header: 'Actions', render: (user) => (
                                    <KebabMenu actions={[
                                        { label: 'View', onClick: () => handleView(user.id) },
                                    ]} />
                                )},
                            ]}
                            data={items}
                        />
                    </div>

                    <div className="tableFooter">
                        <div className="limit">
                            <span>View</span>
                            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
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
