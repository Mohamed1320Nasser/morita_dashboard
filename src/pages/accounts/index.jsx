import React, { useCallback, useEffect, useState } from 'react'
import styles from './accounts.module.scss'
import PageTitle from '@/components/atoms/labels/pageTitle'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import Button from '@/components/atoms/buttons/button'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import accountsController from '@/controllers/accounts'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import KebabMenu from '@/components/shared/KebabMenu'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const ACCOUNT_CATEGORIES = [
    { value: 'MAIN', label: 'Main' },
    { value: 'IRONS', label: 'Irons' },
    { value: 'HCIM', label: 'HCIM' },
    { value: 'ZERK', label: 'Zerk' },
    { value: 'PURE', label: 'Pure' },
    { value: 'ACCOUNTS', label: 'Accounts' },
]

const ACCOUNT_STATUSES = [
    { value: 'IN_STOCK', label: 'In Stock', type: 'success' },
    { value: 'RESERVED', label: 'Reserved', type: 'warning' },
    { value: 'SOLD', label: 'Sold', type: 'info' },
]

const AccountsPage = () => {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(true)

    const [items, setItems] = useState([])
    const [stats, setStats] = useState(null)
    const [search, setSearch] = useState('')
    const [category, setCategory] = useState('')
    const [status, setStatus] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [filterCount, setFilterCount] = useState(0)
    const [refreshKey, setRefreshKey] = useState(0)
    const [deleteModal, setDeleteModal] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const handleSearchChange = (event) => {
        setSearch(event)
        setPage(1)
    }

    const handleCategoryChange = (value) => {
        setCategory(value)
        setPage(1)
    }

    const handleStatusChange = (value) => {
        setStatus(value)
        setPage(1)
    }

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const queryParams = new URLSearchParams()
                if (search) queryParams.append('search', search)
                if (category) queryParams.append('category', category)
                if (status) queryParams.append('status', status)
                queryParams.append('page', String(page))
                queryParams.append('limit', String(limit))
                const query = queryParams.toString()

                const [accountsRes, statsRes] = await Promise.all([
                    accountsController.getAllAccounts(query),
                    accountsController.getAccountStats(),
                ])

                if (accountsRes && accountsRes.success) {
                    setItems(accountsRes.data.accounts || accountsRes.data.items || [])
                    setFilterCount(accountsRes.data.filterCount || accountsRes.data.total || 0)
                } else {
                    notify(accountsRes?.error?.message || 'Failed to load accounts')
                }

                if (statsRes && statsRes.success) {
                    setStats(statsRes.data)
                }
            } catch (e) {
                notify('Error loading accounts')
            } finally {
                setPageLoading(false)
            }
        }
        fetchAll()
    }, [refreshKey, page, limit, search, category, status])

    const handleNew = () => router.push('/accounts/new')
    const handleEdit = (id) => router.push(`/accounts/${id}`)
    const handleView = (id) => router.push(`/accounts/${id}/view`)
    const handleDeleteClick = (account) => setDeleteModal(account)

    const handleDeleteConfirm = async () => {
        if (!deleteModal) return
        try {
            setDeleting(true)
            const res = await accountsController.deleteAccount(deleteModal.id)
            if (res && res.success !== false) {
                setItems(prev => prev.filter(x => x.id !== deleteModal.id))
                setDeleteModal(null)
                notify('Account deleted successfully', 'success')
                setRefreshKey(v => v + 1)
            } else {
                notify(res?.error?.message || 'Failed to delete account')
            }
        } catch {
            notify('Failed to delete account')
        } finally {
            setDeleting(false)
        }
    }

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

    const getStatusBadge = (statusValue) => {
        const statusConfig = ACCOUNT_STATUSES.find(s => s.value === statusValue)
        return <Badge type={statusConfig?.type || 'default'}>{statusConfig?.label || statusValue}</Badge>
    }

    const getCategoryLabel = (categoryValue) => {
        const cat = ACCOUNT_CATEGORIES.find(c => c.value === categoryValue)
        return cat?.label || categoryValue
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price || 0)
    }

    if (pageLoading) return <Loading />

    return (
        <div className={styles.accounts}>
            <PageHead current="Accounts">
                <Head title="Accounts" onClick={handleNew}>Add New Account</Head>
            </PageHead>

            <Container>
                {/* Stats Cards */}
                {stats && (
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total Accounts</div>
                            <div className={styles.statValue}>{stats.totalAccounts || 0}</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.inStock}`}>
                            <div className={styles.statLabel}>In Stock</div>
                            <div className={styles.statValue}>{stats.inStockAccounts || 0}</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.sold}`}>
                            <div className={styles.statLabel}>Sold</div>
                            <div className={styles.statValue}>{stats.soldAccounts || 0}</div>
                        </div>
                        <div className={`${styles.statCard} ${styles.value}`}>
                            <div className={styles.statLabel}>Total Value</div>
                            <div className={styles.statValue}>{formatPrice(stats.totalValue)}</div>
                        </div>
                    </div>
                )}

                <Card>
                    <div className={styles.searchRow}>
                        <div className={styles.searchInput}>
                            <SearchInput
                                value={search}
                                valueChange={handleSearchChange}
                                placeHolder="Search by name or source"
                                defaultInput={true}
                            />
                        </div>
                        <select
                            className={styles.select}
                            value={category}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            {ACCOUNT_CATEGORIES.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <select
                            className={styles.select}
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            {ACCOUNT_STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.table}>
                        <Table
                            columns={[
                                { key: 'index', header: '#', className: 'index', width: '48px', render: (_acc, idx) => (page - 1) * limit + idx + 1 },
                                { key: 'name', header: 'Name', className: 'name', flex: 2, render: (acc) => acc.name },
                                { key: 'category', header: 'Category', className: 'category', flex: 1, render: (acc) => getCategoryLabel(acc.category) },
                                { key: 'price', header: 'Price', className: 'price', flex: 1, render: (acc) => <span className={styles.priceCell}>{formatPrice(acc.price)}</span> },
                                { key: 'quantity', header: 'Qty', className: 'quantity', width: '60px', render: (acc) => <span className={styles.quantityCell}>{acc.quantity || 1}</span> },
                                { key: 'status', header: 'Status', className: 'status', flex: 1, render: (acc) => getStatusBadge(acc.status) },
                                { key: 'createdAt', header: 'Created', className: 'createdAt', flex: 1, render: (acc) => acc.createdAt ? moment(acc.createdAt).format('DD/MM/YYYY') : '-' },
                                {
                                    key: 'actions', header: 'Actions', className: 'actions', width: '100px', render: (acc) => (
                                        <KebabMenu actions={[
                                            { label: 'View', onClick: () => handleView(acc.id) },
                                            { label: 'Edit', onClick: () => handleEdit(acc.id) },
                                            { label: 'Delete', onClick: () => handleDeleteClick(acc) },
                                        ]} />
                                    )
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
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <span>accounts per page</span>
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

            <DeleteConfirmModal
                show={!!deleteModal}
                onHide={() => !deleting && setDeleteModal(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Account"
                itemName={deleteModal?.name || ''}
                itemType="Account"
                loading={deleting}
            />
        </div>
    )
}

export default AccountsPage
