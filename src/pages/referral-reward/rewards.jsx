import React, { useCallback, useEffect, useState } from 'react'
import styles from './referralReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import referralRewardController from '@/controllers/referralReward'
import { notify } from '@/config/error'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const ReferralRewardsPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [stats, setStats] = useState({ totalRewards: 0, totalRewarded: 0, activeReferrers: 0 })

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

                const [rewardsRes, statsRes] = await Promise.all([
                    referralRewardController.getAllRewards(query),
                    referralRewardController.getStats()
                ])

                if (rewardsRes && rewardsRes.success) {
                    setItems(rewardsRes.data.list || [])
                    setTotal(rewardsRes.data.total || 0)
                    setFilterCount(rewardsRes.data.total || 0)
                } else {
                    notify(rewardsRes?.error?.message || 'Failed to load rewards')
                }

                if (statsRes && statsRes.success) {
                    setStats(statsRes.data)
                }
            } catch (e) {
                notify('Error loading rewards')
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
        <div className={styles.referralReward}>
            <PageHead current="Referral Rewards">
                <Head title="Referral Rewards History" />
            </PageHead>

            <Container>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.rewards}`}>
                        <div className={styles.statLabel}>Total Rewards</div>
                        <div className={styles.statValue}>{stats.totalRewards || 0}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.amount}`}>
                        <div className={styles.statLabel}>Total Rewarded</div>
                        <div className={styles.statValue}>{formatAmount(stats.totalRewarded)}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.referrers}`}>
                        <div className={styles.statLabel}>Active Referrers</div>
                        <div className={styles.statValue}>{stats.activeReferrers || 0}</div>
                    </div>
                </div>

                <Card>
                    {items.length === 0 && !search ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎁</div>
                            <div className={styles.emptyText}>No referral rewards yet</div>
                            <div className={styles.emptyHint}>Rewards will appear here when referrals complete onboarding</div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.searchRow}>
                                <div className={styles.searchInput}>
                                    <SearchInput
                                        value={search}
                                        valueChange={handleSearchChange}
                                        placeHolder="Search by Discord username or ID"
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
                                            key: 'referrer',
                                            header: 'Referrer',
                                            flex: 2,
                                            render: (item) => (
                                                <div className={styles.userCell}>
                                                    <div>
                                                        <div className={styles.username}>
                                                            {item.referrer?.discordDisplayName || item.referrer?.discordUsername || 'Unknown'}
                                                        </div>
                                                        <div className={styles.discordId}>
                                                            {item.referrer?.discordId || '-'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        },
                                        {
                                            key: 'referred',
                                            header: 'Referred User',
                                            flex: 2,
                                            render: (item) => (
                                                <div className={styles.userCell}>
                                                    <div>
                                                        <div className={styles.username}>
                                                            {item.referredUser?.discordDisplayName || item.referredUser?.discordUsername || 'Pending'}
                                                        </div>
                                                        <div className={styles.discordId}>
                                                            {item.referredDiscordId || '-'}
                                                        </div>
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
                                            key: 'inviteCode',
                                            header: 'Invite Code',
                                            flex: 1,
                                            render: (item) => item.inviteCode || '-'
                                        },
                                        {
                                            key: 'rewardGivenAt',
                                            header: 'Rewarded At',
                                            flex: 1.5,
                                            render: (item) => item.rewardGivenAt ? moment(item.rewardGivenAt).format('DD/MM/YYYY HH:mm') : '-'
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
                                    <span>rewards per page</span>
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

export default ReferralRewardsPage
