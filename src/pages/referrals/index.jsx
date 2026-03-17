import React, { useCallback, useEffect, useState } from 'react'
import styles from './referrals.module.scss'
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
import moment from 'moment'
import Pagination from '@mui/material/Pagination'
import { IoPeopleCircle, IoCheckmarkCircle, IoTimeOutline, IoTrendingUp } from 'react-icons/io5'

const ReferralsPage = () => {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(true)
    const [items, setItems] = useState([])
    const [analytics, setAnalytics] = useState(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [total, setTotal] = useState(0)

    const handleSearchChange = (event) => {
        setSearch(event)
        setPage(1)
    }

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const queryParams = new URLSearchParams()
                if (search) queryParams.append('search', search)
                if (statusFilter) queryParams.append('status', statusFilter)
                queryParams.append('page', String(page))
                queryParams.append('limit', String(limit))
                const query = queryParams.toString()

                const [referralsRes, analyticsRes] = await Promise.all([
                    adminController.getAllReferrals(query),
                    adminController.getReferralAnalytics(),
                ])

                if (referralsRes && referralsRes.success && referralsRes.data) {
                    // API returns { data: [...], pagination: {...} }
                    setItems(referralsRes.data.data || referralsRes.data || [])
                    setTotal(referralsRes.data.pagination?.total || 0)
                } else {
                    notify(referralsRes?.error?.message || 'Failed to load referrals')
                }

                if (analyticsRes && analyticsRes.success && analyticsRes.data) {
                    setAnalytics(analyticsRes.data)
                }
            } catch (e) {
                notify('Error loading referrals')
            } finally {
                setPageLoading(false)
            }
        }
        fetchAll()
    }, [page, limit, search, statusFilter])

    const handleView = (referral) => {
        if (referral.referrerUserId) {
            router.push(`/users/${referral.referrerUserId}`)
        }
    }

    const handleViewNetwork = (referral) => {
        if (referral.referrerUserId) {
            router.push(`/referrals/network/${referral.referrerUserId}`)
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
            else if (isNext && page < Math.ceil(total / limit)) newPage = page + 1
            else if (!isPrev && !isNext && !isNaN(+e.target.textContent)) newPage = +e.target.textContent

            if (newPage) setPage(newPage)
        },
        [page, total, limit],
    )

    const columns = [
        {
            key: 'index',
            header: '#',
            className: 'index',
            width: '48px',
            render: (_row, idx) => (page - 1) * limit + idx + 1,
        },
        {
            key: 'referrer',
            header: 'Referrer',
            className: 'referrer',
            flex: 1.5,
            render: (row) => (
                <div>
                    <div style={{ fontWeight: 500, color: '#12161c' }}>
                        {row.referrer?.discordDisplayName || row.referrer?.discordUsername || 'Unknown'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#7a7e85', marginTop: '4px' }}>
                        {row.referrer?.discordId ? `Discord: ${row.referrer.discordId}` : (row.referrer?.discordUsername ? `@${row.referrer.discordUsername}` : row.referrerDiscordId)}
                    </div>
                </div>
            ),
        },
        {
            key: 'referred',
            header: 'Referred User',
            className: 'referred',
            flex: 1.5,
            render: (row) => {
                // If referred user exists (has joined)
                if (row.referredUser) {
                    return (
                        <div>
                            <div style={{ fontWeight: 500, color: '#12161c' }}>
                                {row.referredUser.discordDisplayName || row.referredUser.discordUsername || 'Unknown'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#7a7e85', marginTop: '4px' }}>
                                {row.referredUser.discordId ? `Discord: ${row.referredUser.discordId}` : `@${row.referredUser.discordUsername || '-'}`}
                            </div>
                        </div>
                    )
                }
                // If referred user hasn't joined yet
                return (
                    <div>
                        <div style={{ fontWeight: 500, color: '#9ca3af', fontStyle: 'italic' }}>
                            Not joined yet
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#7a7e85', marginTop: '4px' }}>
                            {row.referredDiscordId || 'Pending'}
                        </div>
                    </div>
                )
            },
        },
        {
            key: 'status',
            header: 'Status',
            className: 'status',
            flex: 1,
            render: (row) => {
                if (row.rewardGiven) {
                    return <Badge type="success">Rewarded</Badge>
                } else if (row.onboardedAt) {
                    return <Badge type="warning">Pending</Badge>
                } else {
                    return <Badge type="info">Not Onboarded</Badge>
                }
            },
        },
        {
            key: 'reward',
            header: 'Reward',
            className: 'reward',
            flex: 1,
            render: (row) => (
                <span style={{ fontWeight: 600, color: row.rewardGiven ? '#22c55e' : '#7a7e85' }}>
                    {row.rewardGiven ? `$${(row.rewardAmount || 0).toFixed(2)}` : '-'}
                </span>
            ),
        },
        {
            key: 'joinedAt',
            header: 'Joined',
            className: 'joinedAt',
            flex: 1,
            render: (row) => moment(row.joinedAt || row.createdAt).format('DD/MM/YYYY'),
        },
    ]

    if (pageLoading) return <Loading />

    return (
        <div className={styles.referrals}>
            <PageHead current="Referrals">
                <Head title="Referral Management" noButton>
                    View and manage all referrals
                </Head>
            </PageHead>

            <Container>
                {/* Stats Cards */}
                {analytics && (
                    <div className={styles.statsCards}>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.blue}`}>
                                <IoPeopleCircle />
                            </div>
                            <div className={styles.statValue}>{analytics.overview.totalReferrals || 0}</div>
                            <div className={styles.statLabel}>Total Referrals</div>
                            <div className={styles.statSubtext}>{analytics.overview.last24hReferrals || 0} in last 24h</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.green}`}>
                                <IoCheckmarkCircle />
                            </div>
                            <div className={styles.statValue}>{analytics.overview.completedReferrals || 0}</div>
                            <div className={styles.statLabel}>Completed</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.orange}`}>
                                <IoTimeOutline />
                            </div>
                            <div className={styles.statValue}>{analytics.overview.pendingReferrals || 0}</div>
                            <div className={styles.statLabel}>Pending</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.purple}`}>
                                <IoTrendingUp />
                            </div>
                            <div className={styles.statValue}>{analytics.overview.last7dReferrals || 0}</div>
                            <div className={styles.statLabel}>Last 7 Days</div>
                        </div>
                    </div>
                )}

                {/* Suspicious Users Alert */}
                {analytics?.suspiciousUsers && analytics.suspiciousUsers.length > 0 && (
                    <Card className={styles.alertCard}>
                        <div className={styles.alertHeader}>
                            <span className={styles.alertTitle}>⚠️ Suspicious Activity Detected</span>
                        </div>
                        <div className={styles.suspiciousList}>
                            {analytics.suspiciousUsers.slice(0, 5).map((user) => (
                                <div key={user.userId} className={styles.suspiciousItem}>
                                    <span className={styles.userName}>{user.discordUsername}</span>
                                    <Badge type={user.riskLevel === 'HIGH' ? 'danger' : 'warning'}>
                                        {user.riskLevel}
                                    </Badge>
                                    <span className={styles.refCount}>
                                        {user.last24hReferrals} refs in 24h
                                    </span>
                                </div>
                            ))}
                        </div>
                        <button
                            className={styles.viewAllBtn}
                            onClick={() => router.push('/referrals/fraud-analytics')}
                        >
                            View Full Analytics →
                        </button>
                    </Card>
                )}

                {/* Referrals Table */}
                <Card>
                    <div className="mb-4 d-flex gap-3 align-items-center flex-wrap">
                        <div style={{ flex: 1, maxWidth: 400 }}>
                            <SearchInput
                                value={search}
                                valueChange={handleSearchChange}
                                placeHolder="Search by Discord username or ID"
                                defaultInput={true}
                            />
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
                            <button
                                className={`${styles.filterBtn} ${statusFilter === 'rewarded' ? styles.active : ''}`}
                                onClick={() => {
                                    setStatusFilter('rewarded')
                                    setPage(1)
                                }}
                            >
                                Rewarded
                            </button>
                            <button
                                className={`${styles.filterBtn} ${statusFilter === 'pending' ? styles.active : ''}`}
                                onClick={() => {
                                    setStatusFilter('pending')
                                    setPage(1)
                                }}
                            >
                                Pending
                            </button>
                            <button
                                className={`${styles.filterBtn} ${statusFilter === 'not_onboarded' ? styles.active : ''}`}
                                onClick={() => {
                                    setStatusFilter('not_onboarded')
                                    setPage(1)
                                }}
                            >
                                Not Onboarded
                            </button>
                        </div>
                    </div>

                    <div className={styles.table}>
                        <div className={styles.tableHead} />
                        <Table columns={columns} data={items} />
                    </div>

                    <div className="tableFooter">
                        <div className="limit">
                            <span>View</span>
                            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                            </select>
                            <span>referrals per page</span>
                        </div>
                        <Pagination
                            page={page}
                            count={Math.ceil(total / limit)}
                            shape="rounded"
                            onClick={handlePaginate}
                        />
                    </div>
                </Card>
            </Container>
        </div>
    )
}

export default ReferralsPage
