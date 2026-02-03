import React, { useEffect, useState } from 'react'
import styles from './dailyReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import Loading from '@/components/atoms/loading'
import dailyRewardController from '@/controllers/dailyReward'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'

const DailyRewardLeaderboardPage = () => {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(true)
    const [items, setItems] = useState([])
    const [limit, setLimit] = useState(50)

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await dailyRewardController.getLeaderboard(limit)
                if (res && res.success) {
                    setItems(res.data || [])
                } else {
                    notify(res?.error?.message || 'Failed to load leaderboard')
                }
            } catch (e) {
                notify('Error loading leaderboard')
            } finally {
                setPageLoading(false)
            }
        }
        fetchLeaderboard()
    }, [limit])

    const getRankClass = (rank) => {
        if (rank === 1) return styles.gold
        if (rank === 2) return styles.silver
        if (rank === 3) return styles.bronze
        return ''
    }

    const getRankEmoji = (rank) => {
        if (rank === 1) return '🥇'
        if (rank === 2) return '🥈'
        if (rank === 3) return '🥉'
        return `#${rank}`
    }

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
                <Head title="Daily Reward Leaderboard" />
            </PageHead>

            <Container>
                <Card>
                    {items.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🏆</div>
                            <div className={styles.emptyText}>No claims yet</div>
                            <div className={styles.emptyHint}>Users who claim daily rewards will appear here</div>
                        </div>
                    ) : (
                        <>
                            <div className={styles.searchRow}>
                                <div style={{ flex: 1 }} />
                                <select
                                    className={styles.select}
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                >
                                    <option value={10}>Top 10</option>
                                    <option value={25}>Top 25</option>
                                    <option value={50}>Top 50</option>
                                    <option value={100}>Top 100</option>
                                </select>
                            </div>

                            <div className={styles.table}>
                                <Table
                                    columns={[
                                        {
                                            key: 'rank',
                                            header: 'Rank',
                                            width: '80px',
                                            render: (item) => (
                                                <span className={`${styles.rankCell} ${getRankClass(item.rank)}`}>
                                                    {getRankEmoji(item.rank)}
                                                </span>
                                            )
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
                                            key: 'totalClaimed',
                                            header: 'Total Claimed',
                                            flex: 1,
                                            render: (item) => (
                                                <span className={styles.amountCell}>
                                                    {formatAmount(item.totalClaimed)}
                                                </span>
                                            )
                                        },
                                        {
                                            key: 'claimCount',
                                            header: 'Claims',
                                            width: '100px',
                                            render: (item) => item.claimCount || 0
                                        },
                                    ]}
                                    data={items}
                                />
                            </div>
                        </>
                    )}
                </Card>
            </Container>
        </div>
    )
}

export default DailyRewardLeaderboardPage
