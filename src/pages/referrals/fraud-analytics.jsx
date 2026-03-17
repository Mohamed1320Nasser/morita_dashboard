import React, { useEffect, useState } from 'react'
import styles from './referrals.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import { IoStatsChart, IoCheckmarkCircle, IoTimeOutline, IoTrendingUp, IoPeopleCircle } from 'react-icons/io5'

const FraudAnalyticsPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [analytics, setAnalytics] = useState(null)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await adminController.getReferralAnalytics()

                if (res && res.success && res.data) {
                    setAnalytics(res.data)
                } else {
                    notify(res?.error?.message || 'Failed to load analytics')
                }
            } catch (e) {
                notify('Error loading fraud analytics')
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    if (loading) return <Loading />

    return (
        <div className={styles.fraudContainer}>
            <PageHead current="Fraud Analytics">
                <Head title="Fraud Analytics" back="/referrals" />
            </PageHead>

            <Container>
                {/* Overview Stats */}
                {analytics?.overview && (
                    <div className={styles.statsCards}>
                        <div className={styles.statCard}>
                            <div className={`${styles.statIcon} ${styles.blue}`}>
                                <IoPeopleCircle />
                            </div>
                            <div className={styles.statValue}>{analytics.overview.totalReferrals || 0}</div>
                            <div className={styles.statLabel}>Total Referrals</div>
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
                                <IoStatsChart />
                            </div>
                            <div className={styles.statValue}>{analytics.overview.last24hReferrals || 0}</div>
                            <div className={styles.statLabel}>Last 24h</div>
                            <div className={styles.statSubtext}>{analytics.overview.last7dReferrals || 0} in 7 days</div>
                        </div>
                    </div>
                )}

                {/* Suspicious Users */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        ⚠️ Suspicious Users ({analytics?.suspiciousUsers?.length || 0})
                    </h2>

                    {analytics?.suspiciousUsers && analytics.suspiciousUsers.length > 0 ? (
                        <div className={styles.topReferrersGrid}>
                            {analytics.suspiciousUsers.map((user) => (
                                <Card key={user.userId} className={styles.referrerCard}>
                                    <div className={styles.referrerHeader}>
                                        <div>
                                            <div className={styles.referrerName}>
                                                {user.discordDisplayName || user.discordUsername || `User ${user.userId}`}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                ID: {user.discordId}
                                            </div>
                                        </div>
                                        <Badge type={user.riskLevel === 'HIGH' ? 'danger' : 'warning'}>
                                            {user.riskLevel}
                                        </Badge>
                                    </div>

                                    <div className={styles.referrerStats}>
                                        <div className={styles.referrerStat}>
                                            <strong>{user.totalReferrals}</strong>
                                            <span>Total</span>
                                        </div>
                                        <div className={styles.referrerStat}>
                                            <strong>{user.activeCount || 0}</strong>
                                            <span>Active</span>
                                        </div>
                                        <div className={styles.referrerStat}>
                                            <strong>{user.leftCount || 0}</strong>
                                            <span>Left</span>
                                        </div>
                                        <div className={styles.referrerStat}>
                                            <strong>{(user.retentionRate || 0).toFixed(0)}%</strong>
                                            <span>Retention</span>
                                        </div>
                                    </div>

                                    <button
                                        style={{ background: '#6366f1', color: 'white' }}
                                        onClick={() => router.push(`/referrals/network/${user.userId}`)}
                                    >
                                        View Network
                                    </button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <div className={styles.emptyState}>
                                ✅ No suspicious activity detected
                            </div>
                        </Card>
                    )}
                </div>

                {/* Top Referrers */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>🏆 Top Referrers</h2>

                    {analytics?.topReferrers && analytics.topReferrers.length > 0 ? (
                        <div className={styles.topReferrersGrid}>
                            {analytics.topReferrers.map((user, index) => (
                                <Card key={user.userId} className={styles.referrerCard}>
                                    <div className={styles.referrerHeader}>
                                        <div>
                                            <div className={styles.referrerName}>
                                                #{index + 1} {user.discordDisplayName || user.discordUsername || `User ${user.userId}`}
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                ID: {user.discordId}
                                            </div>
                                        </div>
                                        <Badge
                                            type={
                                                user.riskLevel === 'LOW'
                                                    ? 'success'
                                                    : user.riskLevel === 'MEDIUM'
                                                    ? 'warning'
                                                    : 'danger'
                                            }
                                        >
                                            {user.riskLevel || 'LOW'}
                                        </Badge>
                                    </div>

                                    <div className={styles.referrerStats}>
                                        <div className={styles.referrerStat}>
                                            <strong>{user.totalReferrals}</strong>
                                            <span>Total</span>
                                        </div>
                                        <div className={styles.referrerStat}>
                                            <strong>{user.activeCount || 0}</strong>
                                            <span>Active</span>
                                        </div>
                                        <div className={styles.referrerStat}>
                                            <strong>{user.leftCount || 0}</strong>
                                            <span>Left</span>
                                        </div>
                                        <div className={styles.referrerStat}>
                                            <strong>{(user.retentionRate || 0).toFixed(0)}%</strong>
                                            <span>Retention</span>
                                        </div>
                                    </div>

                                    <button
                                        style={{ background: '#10b981', color: 'white' }}
                                        onClick={() => router.push(`/referrals/network/${user.userId}`)}
                                    >
                                        View Network
                                    </button>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <div className={styles.emptyState}>No referrers yet</div>
                        </Card>
                    )}
                </div>
            </Container>
        </div>
    )
}

export default FraudAnalyticsPage
