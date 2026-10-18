import React, { useCallback, useEffect, useState } from 'react'
import styles from './referralReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import referralRewardController from '@/controllers/referralReward'
import { notify } from '@/config/error'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'PENDING', label: 'On Hold' },
    { value: 'PAID', label: 'Paid' },
    { value: 'CANCELLED', label: 'Cancelled' },
]

const formatAmount = (amount) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount || 0)

const UserCell = ({ user, fallbackId }) => (
    <div className={styles.userCell}>
        <div>
            <div className={styles.username}>
                {user?.discordDisplayName || user?.discordUsername || 'Unknown'}
            </div>
            <div className={styles.discordId}>{user?.discordId || fallbackId || '-'}</div>
        </div>
    </div>
)

const ReferralOrderRewardsPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [items, setItems] = useState([])
    const [totals, setTotals] = useState({})
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('all')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)
    const [cancellingId, setCancellingId] = useState(null)
    // Two-step cancel instead of a browser confirm() dialog
    const [confirmId, setConfirmId] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = new URLSearchParams()
                if (search) params.append('search', search)
                if (status !== 'all') params.append('status', status)
                params.append('page', String(page))
                params.append('limit', String(limit))

                const res = await referralRewardController.getOrderRewards(params.toString())

                if (res && res.success) {
                    setItems(res.data.list)
                    setTotal(res.data.total)
                    setTotals(res.data.totals)
                } else {
                    notify(res?.error?.message || 'Failed to load order rewards')
                }
            } catch (e) {
                notify('Error loading order rewards')
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [page, limit, search, status, reloadKey])

    const handlePaginate = useCallback(
        (e = null) => {
            e.stopPropagation()

            const pageItem = e.target.closest('.MuiPaginationItem-root')
            const isPrev = pageItem?.getAttribute('aria-label') === 'Go to previous page'
            const isNext = pageItem?.getAttribute('aria-label') === 'Go to next page'

            let newPage
            if (isPrev && page > 1) newPage = page - 1
            else if (isNext && page < Math.ceil(total / limit)) newPage = page + 1
            else if (!isPrev && !isNext && !isNaN(+e.target.textContent)) newPage = +e.target.textContent

            if (newPage) setPage(newPage)
        },
        [page, total, limit],
    )

    const handleCancel = async (row) => {
        if (confirmId !== row.id) {
            setConfirmId(row.id)
            return
        }

        setCancellingId(row.id)
        const res = await referralRewardController.cancelOrderReward(row.id, 'Cancelled by admin')
        setCancellingId(null)
        setConfirmId(null)

        if (res && res.success) {
            notify(`Reward for order #${row.order?.orderNumber} cancelled`, 'success')
            setReloadKey(k => k + 1)
        } else {
            notify(res?.error?.message || 'Failed to cancel reward')
        }
    }

    const renderStatus = (row) => {
        if (row.status === 'PAID') {
            return (
                <span>
                    <Badge type="success">Paid</Badge>
                    <div className={styles.discordId}>{row.paidAt ? moment(row.paidAt).format('DD/MM/YYYY HH:mm') : ''}</div>
                </span>
            )
        }
        if (row.status === 'CANCELLED') {
            return (
                <span title={row.cancelReason || ''}>
                    <Badge type="danger">Cancelled</Badge>
                    <div className={styles.discordId}>{row.cancelReason || ''}</div>
                </span>
            )
        }
        return (
            <span>
                <Badge type="warning">On Hold</Badge>
                <div className={styles.discordId}>
                    Pays {moment(row.eligibleAt).fromNow()} ({moment(row.eligibleAt).format('DD/MM HH:mm')})
                </div>
            </span>
        )
    }

    if (pageLoading) return <Loading />

    const statusCard = (key, label, className) => (
        <div className={`${styles.statCard} ${className}`}>
            <div className={styles.statLabel}>{label}</div>
            <div className={styles.statValue}>{formatAmount(totals?.[key]?.amount)}</div>
            <div className={styles.statLabel} style={{ marginTop: '4px', marginBottom: 0 }}>
                {totals?.[key]?.count || 0} reward{totals?.[key]?.count === 1 ? '' : 's'}
            </div>
        </div>
    )

    return (
        <div className={styles.referralReward}>
            <PageHead current="Referral Order Rewards">
                <Head title="Referral Order Rewards" />
            </PageHead>

            <Container>
                <div className={styles.statsGrid}>
                    {statusCard('PAID', 'Paid', styles.enabled)}
                    {statusCard('PENDING', 'On Hold', styles.amount)}
                    {statusCard('CANCELLED', 'Cancelled', styles.disabled)}
                </div>

                <Card>
                    <div className={styles.searchRow} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className={styles.searchInput}>
                            <SearchInput
                                value={search}
                                valueChange={(value) => {
                                    setSearch(value)
                                    setPage(1)
                                }}
                                placeHolder="Search by Discord username, ID or order #"
                                defaultInput={true}
                            />
                        </div>
                        <div role="group" aria-label="Filter by status" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {STATUS_FILTERS.map(f => (
                                <button
                                    key={f.value}
                                    type="button"
                                    className={styles.addMilestoneBtn}
                                    aria-pressed={status === f.value}
                                    style={{
                                        marginTop: 0,
                                        opacity: status === f.value ? 1 : 0.55,
                                    }}
                                    onClick={() => {
                                        setStatus(f.value)
                                        setPage(1)
                                    }}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🛒</div>
                            <div className={styles.emptyText}>No order rewards {status !== 'all' || search ? 'match this filter' : 'yet'}</div>
                            <div className={styles.emptyHint}>
                                When a referred customer completes an order, the referrer's reward appears here.
                                Turn it on under Reward Settings → Order Rewards.
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.table}>
                                <Table
                                    columns={[
                                        {
                                            key: 'order',
                                            header: 'Order',
                                            width: '90px',
                                            render: (row) => `#${row.order?.orderNumber ?? '-'}`,
                                        },
                                        {
                                            key: 'referrer',
                                            header: 'Referrer (earns)',
                                            flex: 2,
                                            render: (row) => <UserCell user={row.referrer} />,
                                        },
                                        {
                                            key: 'customer',
                                            header: 'Referred Customer',
                                            flex: 2,
                                            render: (row) => <UserCell user={row.referredUser} />,
                                        },
                                        {
                                            key: 'orderValue',
                                            header: 'Order Value',
                                            flex: 1,
                                            render: (row) => formatAmount(row.orderValue),
                                        },
                                        {
                                            key: 'amount',
                                            header: 'Reward',
                                            flex: 1,
                                            render: (row) => (
                                                <span className={styles.amountCell}>
                                                    {formatAmount(row.amount)}
                                                    <div className={styles.discordId}>
                                                        {row.rewardType === 'PERCENTAGE' ? `${row.rewardValue}%` : 'fixed'}
                                                    </div>
                                                </span>
                                            ),
                                        },
                                        {
                                            key: 'status',
                                            header: 'Status',
                                            flex: 1.8,
                                            render: renderStatus,
                                        },
                                        {
                                            key: 'actions',
                                            header: '',
                                            width: '130px',
                                            render: (row) => row.status === 'PENDING' ? (
                                                <button
                                                    type="button"
                                                    className={styles.removeBtn}
                                                    style={{ width: 'auto', padding: '6px 10px', fontSize: '12px' }}
                                                    disabled={cancellingId === row.id}
                                                    onClick={() => handleCancel(row)}
                                                    onBlur={() => confirmId === row.id && setConfirmId(null)}
                                                >
                                                    {cancellingId === row.id
                                                        ? 'Cancelling…'
                                                        : confirmId === row.id ? 'Click to confirm' : 'Cancel reward'}
                                                </button>
                                            ) : null,
                                        },
                                    ]}
                                    data={items}
                                />
                            </div>

                            <div className="tableFooter">
                                <div className="limit">
                                    <span>View</span>
                                    <select
                                        value={limit}
                                        onChange={(e) => {
                                            setLimit(Number(e.target.value))
                                            setPage(1)
                                        }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span>rewards per page</span>
                                </div>
                                <Pagination
                                    page={page}
                                    count={Math.max(1, Math.ceil(total / limit))}
                                    shape="rounded"
                                    onClick={handlePaginate}
                                />
                            </div>
                        </>
                    )}
                </Card>
            </Container>
        </div>
    )
}

export default ReferralOrderRewardsPage
