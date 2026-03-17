import React, { useEffect, useState } from 'react'
import styles from './referralReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import referralRewardController from '@/controllers/referralReward'
import { notify } from '@/config/error'

const ReferralRewardConfigPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ totalRewards: 0, totalRewarded: 0, activeReferrers: 0 })

    const [config, setConfig] = useState({
        isEnabled: true,
        rewardAmount: 5,
        firstReferralBonus: 0,
        milestoneBonus: false,
        milestone10Bonus: 0,
        milestone50Bonus: 0,
        milestone100Bonus: 0,
        requireOnboarding: true,
        maxRewardsPerDay: 10,
        notifyDiscord: true,
        notifyDM: true,
        currencyName: '$',
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, statsRes] = await Promise.all([
                    referralRewardController.getConfig(),
                    referralRewardController.getStats()
                ])

                if (configRes && configRes.success) {
                    setConfig({
                        isEnabled: configRes.data.isEnabled ?? true,
                        rewardAmount: configRes.data.rewardAmount || 5,
                        firstReferralBonus: configRes.data.firstReferralBonus || 0,
                        milestoneBonus: configRes.data.milestoneBonus ?? false,
                        milestone10Bonus: configRes.data.milestone10Bonus || 0,
                        milestone50Bonus: configRes.data.milestone50Bonus || 0,
                        milestone100Bonus: configRes.data.milestone100Bonus || 0,
                        requireOnboarding: configRes.data.requireOnboarding ?? true,
                        maxRewardsPerDay: configRes.data.maxRewardsPerDay || 10,
                        notifyDiscord: configRes.data.notifyDiscord ?? true,
                        notifyDM: configRes.data.notifyDM ?? true,
                        currencyName: configRes.data.currencyName || '$',
                    })
                } else {
                    notify(configRes?.error?.message || 'Failed to load config')
                }

                if (statsRes && statsRes.success) {
                    setStats(statsRes.data)
                }
            } catch (e) {
                notify('Error loading config')
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    const handleToggle = (field) => {
        setConfig(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const handleSave = async () => {
        // Validation
        if (config.rewardAmount <= 0) {
            notify('Reward amount must be greater than 0')
            return
        }
        if (config.maxRewardsPerDay < 1) {
            notify('Max rewards per day must be at least 1')
            return
        }

        try {
            setSaving(true)
            const res = await referralRewardController.updateConfig({
                isEnabled: config.isEnabled,
                rewardAmount: Number(config.rewardAmount),
                firstReferralBonus: Number(config.firstReferralBonus),
                milestoneBonus: config.milestoneBonus,
                milestone10Bonus: Number(config.milestone10Bonus),
                milestone50Bonus: Number(config.milestone50Bonus),
                milestone100Bonus: Number(config.milestone100Bonus),
                requireOnboarding: config.requireOnboarding,
                maxRewardsPerDay: Number(config.maxRewardsPerDay),
                notifyDiscord: config.notifyDiscord,
                notifyDM: config.notifyDM,
                currencyName: config.currencyName,
            })

            if (res && res.success) {
                notify('Configuration saved successfully', 'success')
            } else {
                notify(res?.error?.message || 'Failed to save config')
            }
        } catch (e) {
            notify('Error saving config')
        } finally {
            setSaving(false)
        }
    }

    if (pageLoading) return <Loading />

    return (
        <div className={styles.referralReward}>
            <PageHead current="Referral Reward Settings">
                <Head title="Referral Reward Configuration" />
            </PageHead>

            <Container>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${config.isEnabled ? styles.enabled : styles.disabled}`}>
                        <div className={styles.statLabel}>Status</div>
                        <div className={styles.statValue}>{config.isEnabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.rewards}`}>
                        <div className={styles.statLabel}>Total Rewards Given</div>
                        <div className={styles.statValue}>{stats.totalRewards || 0}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.amount}`}>
                        <div className={styles.statLabel}>Total Amount Rewarded</div>
                        <div className={styles.statValue}>{config.currencyName}{(stats.totalRewarded || 0).toFixed(2)}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.referrers}`}>
                        <div className={styles.statLabel}>Active Referrers</div>
                        <div className={styles.statValue}>{stats.activeReferrers || 0}</div>
                    </div>
                </div>

                <Card>
                    <div className={styles.configForm}>
                        {/* Enable/Disable */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Feature Status</div>
                            <div className={styles.toggleGroup}>
                                <div
                                    className={`${styles.toggle} ${config.isEnabled ? styles.active : ''}`}
                                    onClick={() => handleToggle('isEnabled')}
                                >
                                    <div className={styles.toggleHandle} />
                                </div>
                                <span className={styles.toggleLabel}>
                                    {config.isEnabled ? 'Referral Rewards are Enabled' : 'Referral Rewards are Disabled'}
                                </span>
                            </div>
                        </div>

                        {/* Base Reward Settings */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Base Reward Settings</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Reward Amount per Referral</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={config.rewardAmount}
                                        onChange={(e) => handleChange('rewardAmount', e.target.value)}
                                    />
                                    <span className={styles.hint}>Amount given for each successful referral</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>First Referral Bonus</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={config.firstReferralBonus}
                                        onChange={(e) => handleChange('firstReferralBonus', e.target.value)}
                                    />
                                    <span className={styles.hint}>Extra bonus for user's first successful referral</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Max Rewards Per Day</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.maxRewardsPerDay}
                                        onChange={(e) => handleChange('maxRewardsPerDay', e.target.value)}
                                    />
                                    <span className={styles.hint}>Maximum rewards a user can earn per day</span>
                                </div>
                            </div>
                        </div>

                        {/* Milestone Bonuses */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Milestone Bonuses</div>
                            <div className={styles.checkboxGroup}>
                                <input
                                    type="checkbox"
                                    checked={config.milestoneBonus}
                                    onChange={() => handleToggle('milestoneBonus')}
                                />
                                <span>Enable milestone bonuses for reaching referral goals</span>
                            </div>

                            {config.milestoneBonus && (
                                <div className={styles.milestoneSection}>
                                    <div className={styles.milestoneTitle}>🎯 Milestone Rewards</div>
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>10 Referrals Bonus</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.milestone10Bonus}
                                                onChange={(e) => handleChange('milestone10Bonus', e.target.value)}
                                            />
                                            <span className={styles.hint}>Bonus when user reaches 10 referrals</span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>50 Referrals Bonus</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.milestone50Bonus}
                                                onChange={(e) => handleChange('milestone50Bonus', e.target.value)}
                                            />
                                            <span className={styles.hint}>Bonus when user reaches 50 referrals</span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>100 Referrals Bonus</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.milestone100Bonus}
                                                onChange={(e) => handleChange('milestone100Bonus', e.target.value)}
                                            />
                                            <span className={styles.hint}>Bonus when user reaches 100 referrals</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Restrictions */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Restrictions</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Onboarding Requirement</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            checked={config.requireOnboarding}
                                            onChange={() => handleToggle('requireOnboarding')}
                                        />
                                        <span>Require referred user to complete onboarding before giving reward</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Notification Settings</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Discord Channel Notification</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            checked={config.notifyDiscord}
                                            onChange={() => handleToggle('notifyDiscord')}
                                        />
                                        <span>Send notification to referral channel on successful referral</span>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Direct Message Notification</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            checked={config.notifyDM}
                                            onChange={() => handleToggle('notifyDM')}
                                        />
                                        <span>Send DM to referrer when reward is given</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Display Settings */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Display Settings</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Currency Name</label>
                                    <input
                                        type="text"
                                        value={config.currencyName}
                                        onChange={(e) => handleChange('currencyName', e.target.value)}
                                        placeholder="$"
                                    />
                                    <span className={styles.hint}>Symbol shown in messages (e.g., $, coins, points)</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions}>
                            <Button
                                primary
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </Container>
        </div>
    )
}

export default ReferralRewardConfigPage
