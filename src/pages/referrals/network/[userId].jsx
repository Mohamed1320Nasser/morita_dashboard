import React, { useEffect, useState } from 'react'
import styles from '../referrals.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'
import { IoPeopleCircle, IoGift, IoPersonCircle, IoStatsChart } from 'react-icons/io5'

const ReferralNetworkPage = () => {
    const router = useRouter()
    const { userId } = router.query
    const [loading, setLoading] = useState(true)
    const [network, setNetwork] = useState(null)

    useEffect(() => {
        if (!userId) return

        const fetchNetwork = async () => {
            try {
                const res = await adminController.getReferralNetwork(userId)

                if (res && res.success && res.data) {
                    setNetwork(res.data)
                } else {
                    notify(res?.error?.message || 'Failed to load network')
                }
            } catch (e) {
                notify('Error loading referral network')
            } finally {
                setLoading(false)
            }
        }
        fetchNetwork()
    }, [userId])

    if (loading) return <Loading />

    if (!network) {
        return (
            <div className={styles.networkContainer}>
                <PageHead current="Referral Network">
                    <Head title="Referral Network" back="/referrals" />
                </PageHead>
                <Container>
                    <Card>
                        <div className={styles.emptyState}>Network not found</div>
                    </Card>
                </Container>
            </div>
        )
    }

    return (
        <div className={styles.networkContainer}>
            <PageHead current="Referral Network">
                <Head title="Referral Network" back="/referrals" />
            </PageHead>

            <Container>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    ← Back
                </button>

                {/* User Stats */}
                <div className={styles.statsCards}>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.blue}`}>
                            <IoPersonCircle />
                        </div>
                        <div className={styles.statValue} style={{ fontSize: '20px' }}>
                            {network.user?.discordDisplayName || network.user?.discordUsername || 'User'}
                        </div>
                        <div className={styles.statLabel}>User</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.purple}`}>
                            <IoStatsChart />
                        </div>
                        <div className={styles.statValue}>{network.user?.totalReferrals || 0}</div>
                        <div className={styles.statLabel}>Total Referrals</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.green}`}>
                            <IoGift />
                        </div>
                        <div className={styles.statValue}>
                            ${network.user?.totalRewards?.toFixed(2) || '0.00'}
                        </div>
                        <div className={styles.statLabel}>Total Rewards</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={`${styles.statIcon} ${styles.orange}`}>
                            <IoPeopleCircle />
                        </div>
                        <div className={styles.statValue}>{network.directReferrals?.length || 0}</div>
                        <div className={styles.statLabel}>Direct Referrals</div>
                    </div>
                </div>

                {/* Referred By */}
                {network.referredBy && (
                    <Card style={{ marginBottom: '20px', padding: '16px' }}>
                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                            This user was referred by:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <strong>
                                {network.referredBy.discordDisplayName || network.referredBy.discordUsername || network.referredBy.discordId}
                            </strong>
                            <button
                                style={{
                                    padding: '6px 12px',
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                }}
                                onClick={() =>
                                    router.push(`/referrals/network/${network.referredBy.id}`)
                                }
                            >
                                View Their Network
                            </button>
                        </div>
                    </Card>
                )}

                {/* Network Tree */}
                <Card>
                    <div style={{ padding: '20px' }}>
                        <h3
                            style={{
                                marginBottom: '20px',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#1a1a1a',
                            }}
                        >
                            Direct Referrals ({network.directReferrals?.length || 0})
                        </h3>

                        {network.directReferrals && network.directReferrals.length > 0 ? (
                            <div className={styles.networkTree}>
                                {network.directReferrals.map((referral, index) => (
                                    <div key={referral.id} className={styles.userNode}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            <div>
                                                <div className={styles.nodeName}>
                                                    {index + 1}.{' '}
                                                    {referral.referredUser?.discordDisplayName ||
                                                        referral.referredUser?.discordUsername ||
                                                        referral.referredDiscordId}
                                                </div>
                                                <div className={styles.nodeInfo}>
                                                    <span>ID: {referral.referredDiscordId}</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {referral.rewardGiven ? (
                                                    <Badge type="success">Rewarded</Badge>
                                                ) : referral.onboardedAt ? (
                                                    <Badge type="warning">Pending</Badge>
                                                ) : (
                                                    <Badge type="info">Not Onboarded</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                fontSize: '13px',
                                                color: '#666',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            {referral.onboardedAt && (
                                                <span>
                                                    Onboarded:{' '}
                                                    {moment(referral.onboardedAt).format('MMM DD, YYYY')}
                                                </span>
                                            )}
                                        </div>

                                        {/* Second Level (Grandchildren) */}
                                        {referral.theirReferrals &&
                                            referral.theirReferrals.length > 0 && (
                                                <div className={styles.grandchildren}>
                                                    <div
                                                        style={{
                                                            fontSize: '13px',
                                                            fontWeight: '500',
                                                            marginBottom: '8px',
                                                            color: '#666',
                                                        }}
                                                    >
                                                        Their Referrals ({referral.theirReferrals.length}):
                                                    </div>
                                                    {referral.theirReferrals.slice(0, 5).map((grandchild) => (
                                                        <div
                                                            key={grandchild.id}
                                                            className={styles.grandchild}
                                                        >
                                                            {grandchild.referredDiscordId}
                                                            {grandchild.rewardGiven && ' ✓'}
                                                        </div>
                                                    ))}
                                                    {referral.theirReferrals.length > 5 && (
                                                        <div className={styles.grandchild}>
                                                            +{referral.theirReferrals.length - 5} more...
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        {referral.referredUser && (
                                            <button
                                                style={{
                                                    marginTop: '12px',
                                                    padding: '8px 16px',
                                                    background: '#10b981',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                }}
                                                onClick={() =>
                                                    router.push(
                                                        `/referrals/network/${referral.referredUserId}`,
                                                    )
                                                }
                                            >
                                                View Their Full Network →
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                This user hasn't referred anyone yet
                            </div>
                        )}
                    </div>
                </Card>
            </Container>
        </div>
    )
}

export default ReferralNetworkPage
