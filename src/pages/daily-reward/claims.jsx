import React, { useCallback, useEffect, useState } from 'react'
import styles from './dailyReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import dailyRewardController from '@/controllers/dailyReward'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const DailyRewardClaimsPage = () => {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(true)

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
        const fetchClaims = async () => {
            try {
                const queryParams = new URLSearchParams()
                if (search) queryParams.append('search', search)
                queryParams.append('page', String(page))
                queryParams.append('limit', String(limit))
                const query = queryParams.toString()

                const res = await dailyRewardController.getAllClaims(query)

                if (res && res.success) {
                    setItems(res.data.list || [])
                    setTotal(res.data.total || 0)
                    setFilterCount(res.data.total || 0)
                } else {
                    notify(res?.error?.message || 'Failed to load claims')
                }
            } catch (e) {
                notify('Error loading claims')
            } finally {
                setPageLoading(false)
            }
        }
        fetchClaims()
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
            minimumFractionDigits: 0,
        }).format(amount || 0)
    }

    if (pageLoading) return <Loading />

    return (
        <div className={styles.dailyReward}>
            <PageHead current="Daily Reward">
                <Head title="Claims History" />
            </PageHead>

            <Container>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Total Claims</div>
                        <div className={styles.statValue}>{total}</div>
                    </div>
                </div>

                <Card>
                    {items.length === 0 && !search ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎁</div>
                            <div className={styles.emptyText}>No claims yet</div>
                            <div className={styles.emptyHint}>Claims will appear here when users use !daily</div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.searchRow}>
                                <div className={styles.searchInput}>
                                    <SearchInput
                                        value={search}
                                        valueChange={handleSearchChange}
                                        placeHolder="Search by username or Discord ID"
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
                                            header: 'User',
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
                                            key: 'amount',
                                            header: 'Amount',
                                            flex: 1,
                                            render: (item) => (
                                                <span className={styles.amountCell}>
                                                    {formatAmount(item.amount)}
                                                </span>
                                            )
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

export default DailyRewardClaimsPage
