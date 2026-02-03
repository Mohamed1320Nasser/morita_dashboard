import React, { useCallback, useEffect, useState } from 'react'
import styles from './orderReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import orderRewardController from '@/controllers/orderReward'
import { notify } from '@/config/error'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const OrderRewardClaimsPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [stats, setStats] = useState({ totalClaims: 0, totalRewarded: 0, firstOrderClaims: 0 })

    const [items, setItems] = useState([])
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)
    const [filterCount, setFilterCount] = useState(0)

    const handleSearchChange = (event) => {
        setSearch(event)
        setPage(1)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const queryParams = new URLSearchParams()
                if (search) queryParams.append('search', search)
                queryParams.append('page', String(page))
                queryParams.append('limit', String(limit))
                const query = queryParams.toString()

                const [claimsRes, statsRes] = await Promise.all([
                    orderRewardController.getAllClaims(query),
                    orderRewardController.getStats()
                ])

                if (claimsRes && claimsRes.success) {
                    setItems(claimsRes.data.list || [])
                    setTotal(claimsRes.data.total || 0)
                    setFilterCount(claimsRes.data.total || 0)
                } else {
                    notify(claimsRes?.error?.message || 'Failed to load claims')
                }

                if (statsRes && statsRes.success) {
                    setStats(statsRes.data)
                }
            } catch (e) {
                notify('Error loading claims')
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [page, limit, search])

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

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
        }).format(amount || 0)
    }

    if (pageLoading) return <Loading />

    return (
        <div className={styles.orderReward}>
            <PageHead current="Order Reward">
                <Head title="Reward Claims History" />
            </PageHead>

            <Container>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.amount}`}>
                        <div className={styles.statLabel}>Total Claims</div>
                        <div className={styles.statValue}>{stats.totalClaims}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.percentage}`}>
                        <div className={styles.statLabel}>Total Rewarded</div>
                        <div className={styles.statValue}>{formatAmount(stats.totalRewarded)}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.firstOrder}`}>
                        <div className={styles.statLabel}>First Order Bonuses</div>
                        <div className={styles.statValue}>{stats.firstOrderClaims}</div>
                    </div>
                </div>

                <Card>
                    {items.length === 0 && !search ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎁</div>
                            <div className={styles.emptyText}>No order rewards yet</div>
                            <div className={styles.emptyHint}>Rewards will appear here when customers complete orders</div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.searchRow}>
                                <div className={styles.searchInput}>
                                    <SearchInput
                                        value={search}
                                        valueChange={handleSearchChange}
                                        placeHolder="Search by username, Discord ID, or Order ID"
                                        defaultInput={true}
                                    />
                                </div>
                            </div>

                            <div className={styles.table}>
                                <Table
                                    columns={[
                                        {
                                            key: 'index',
                                            header: '#',
                                            width: '60px',
                                            render: (_item, idx) => (page - 1) * limit + idx + 1
                                        },
                                        {
                                            key: 'user',
                                            header: 'Customer',
                                            flex: 2,
                                            render: (item) => (
                                                <div className={styles.userCell}>
                                                    <div>
                                                        <div className={styles.username}>
                                                            {item.user?.discordDisplayName || item.user?.discordUsername || 'Unknown'}
                                                        </div>
                                                        <div className={styles.discordId}>
                                                            {item.user?.discordId || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'order',
                                            header: 'Order',
                                            flex: 1.5,
                                            render: (item) => (
                                                <div className={styles.orderCell}>
                                                    <div className={styles.orderNumber}>
                                                        #{item.order?.orderNumber || '-'}
                                                    </div>
                                                    <div className={styles.orderValue}>
                                                        Value: {formatAmount(item.orderAmount)}
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'rewardAmount',
                                            header: 'Reward',
                                            flex: 1,
                                            render: (item) => (
                                                <span className={styles.amountCell}>
                                                    {formatAmount(item.rewardAmount)}
                                                </span>
                                            )
                                        },
                                        {
                                            key: 'isFirstOrder',
                                            header: 'First Order',
                                            flex: 1,
                                            render: (item) => item.isFirstOrder ? (
                                                <span className={`${styles.badge} ${styles.firstOrder}`}>
                                                    First Order
                                                </span>
                                            ) : '-'
                                        },
                                        {
                                            key: 'claimedAt',
                                            header: 'Claimed At',
                                            flex: 1,
                                            render: (item) => item.claimedAt ? moment(item.claimedAt).format('DD/MM/YYYY HH:mm') : '-'
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
                                    <span>claims per page</span>
                                </div>
                                <Pagination
                                    page={page}
                                    count={Math.ceil(filterCount / limit)}
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

export default OrderRewardClaimsPage
