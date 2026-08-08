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
        rewardMode: 'HYBRID',
        perReferralEnabled: true,
        perReferralAmount: 1.00,
        milestonesEnabled: true,
        milestones: [
            { count: 5, reward: 5, type: 'BONUS' },
            { count: 10, reward: 15, type: 'BONUS' },
            { count: 25, reward: 50, type: 'BONUS' },
            { count: 50, reward: 150, type: 'BONUS' },
            { count: 100, reward: 400, type: 'BONUS' },
        ],
        requireOnboarding: true,
        minimumRetentionRate: 70,
        minimumDaysInServer: 7,
        countOnlyActive: true,
        maxRewardsPerDay: 10,
        cooldownMinutes: 5,
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
                        rewardMode: configRes.data.rewardMode || 'HYBRID',
                        perReferralEnabled: configRes.data.perReferralEnabled ?? true,
                        perReferralAmount: configRes.data.perReferralAmount ?? 1.00,
                        milestonesEnabled: configRes.data.milestonesEnabled ?? true,
                        milestones: configRes.data.milestones || [
                            { count: 5, reward: 5, type: 'BONUS' },
                            { count: 10, reward: 15, type: 'BONUS' },
                            { count: 25, reward: 50, type: 'BONUS' },
                            { count: 50, reward: 150, type: 'BONUS' },
                            { count: 100, reward: 400, type: 'BONUS' },
                        ],
                        requireOnboarding: configRes.data.requireOnboarding ?? true,
                        minimumRetentionRate: configRes.data.minimumRetentionRate ?? 70,
                        minimumDaysInServer: configRes.data.minimumDaysInServer ?? 7,
                        countOnlyActive: configRes.data.countOnlyActive ?? true,
                        maxRewardsPerDay: configRes.data.maxRewardsPerDay ?? 10,
                        cooldownMinutes: configRes.data.cooldownMinutes ?? 5,
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

    const handleAddMilestone = () => {
        const newMilestone = { count: 10, reward: 10, type: 'BONUS' }
        setConfig(prev => ({
            ...prev,
            milestones: [...prev.milestones, newMilestone].sort((a, b) => a.count - b.count)
        }))
    }

    const handleUpdateMilestone = (index, field, value) => {
        const updated = [...config.milestones]
        updated[index] = { ...updated[index], [field]: value }
        if (field === 'count') {
            updated.sort((a, b) => a.count - b.count)
        }
        setConfig(prev => ({ ...prev, milestones: updated }))
    }

    const handleRemoveMilestone = (index) => {
        setConfig(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }))
    }

    const handleSave = async () => {
        // Validation
        if (config.perReferralEnabled && config.perReferralAmount <= 0) {
            notify('Per-referral amount must be greater than 0')
            return
        }
        if (config.maxRewardsPerDay < 1) {
            notify('Max rewards per day must be at least 1')
            return
        }
        if (config.milestonesEnabled && (!config.milestones || config.milestones.length === 0)) {
            notify('Please add at least one milestone or disable milestones')
            return
        }

        try {
            setSaving(true)
            const res = await referralRewardController.updateConfig({
                isEnabled: config.isEnabled,
                rewardMode: config.rewardMode,
                perReferralEnabled: config.perReferralEnabled,
                perReferralAmount: Number(config.perReferralAmount),
                milestonesEnabled: config.milestonesEnabled,
                milestones: config.milestones.map(m => ({
                    count: Number(m.count),
                    reward: Number(m.reward),
                    type: m.type
                })),
                requireOnboarding: config.requireOnboarding,
                minimumRetentionRate: Number(config.minimumRetentionRate),
                minimumDaysInServer: Number(config.minimumDaysInServer),
                countOnlyActive: config.countOnlyActive,
                maxRewardsPerDay: Number(config.maxRewardsPerDay),
                cooldownMinutes: Number(config.cooldownMinutes),
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

                        {/* Reward Mode Selection */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Reward Mode</div>
                            <div className={styles.rewardModeSelector}>
                                <div
                                    className={`${styles.modeOption} ${config.rewardMode === 'PER_REFERRAL' ? styles.active : ''}`}
                                    onClick={() => handleChange('rewardMode', 'PER_REFERRAL')}
                                >
                                    <div className={styles.modeIcon}>💰</div>
                                    <div className={styles.modeName}>Per-Referral Only</div>
                                    <div className={styles.modeDesc}>Pay a fixed amount for each referral</div>
                                </div>
                                <div
                                    className={`${styles.modeOption} ${config.rewardMode === 'MILESTONE' ? styles.active : ''}`}
                                    onClick={() => handleChange('rewardMode', 'MILESTONE')}
                                >
                                    <div className={styles.modeIcon}>🎯</div>
                                    <div className={styles.modeName}>Milestone Only</div>
                                    <div className={styles.modeDesc}>Pay bonuses at referral goals</div>
                                </div>
                                <div
                                    className={`${styles.modeOption} ${config.rewardMode === 'HYBRID' ? styles.active : ''}`}
                                    onClick={() => handleChange('rewardMode', 'HYBRID')}
                                >
                                    <div className={styles.modeIcon}>🚀</div>
                                    <div className={styles.modeName}>Hybrid (Recommended)</div>
                                    <div className={styles.modeDesc}>Combine both approaches</div>
                                </div>
                            </div>
                        </div>

                        {/* Per-Referral Settings */}
                        {(config.rewardMode === 'PER_REFERRAL' || config.rewardMode === 'HYBRID') && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>💰 Per-Referral Rewards</div>
                                <div className={styles.checkboxGroup} style={{ marginBottom: '16px' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.perReferralEnabled}
                                        onChange={() => handleToggle('perReferralEnabled')}
                                    />
                                    <span>Enable per-referral rewards</span>
                                </div>
                                {config.perReferralEnabled && (
                                    <div className={styles.formGrid}>
                                        <div className={styles.formGroup}>
                                            <label>Reward Amount per Referral</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.perReferralAmount}
                                                onChange={(e) => handleChange('perReferralAmount', e.target.value)}
                                            />
                                            <span className={styles.hint}>Amount given for each successful referral (supports decimals)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Milestone Bonuses */}
                        {(config.rewardMode === 'MILESTONE' || config.rewardMode === 'HYBRID') && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>🎯 Milestone Bonuses</div>
                                <div className={styles.checkboxGroup} style={{ marginBottom: '16px' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.milestonesEnabled}
                                        onChange={() => handleToggle('milestonesEnabled')}
                                    />
                                    <span>Enable milestone bonuses</span>
                                </div>

                                {config.milestonesEnabled && (
                                    <div className={styles.milestoneBuilder}>
                                        <div className={styles.milestoneList}>
                                            {config.milestones.map((milestone, index) => (
                                                <div key={index} className={styles.milestoneRow}>
                                                    <div className={styles.milestoneInputs}>
                                                        <div className={styles.inputGroup}>
                                                            <label>Referrals</label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={milestone.count}
                                                                onChange={(e) => handleUpdateMilestone(index, 'count', e.target.value)}
                                                                style={{ width: '100px' }}
                                                            />
                                                        </div>
                                                        <span className={styles.arrow}>→</span>
                                                        <div className={styles.inputGroup}>
                                                            <label>Reward</label>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={milestone.reward}
                                                                onChange={(e) => handleUpdateMilestone(index, 'reward', e.target.value)}
                                                                style={{ width: '120px' }}
                                                            />
                                                        </div>
                                                        <div className={styles.inputGroup}>
                                                            <label>Type</label>
                                                            <select
                                                                value={milestone.type}
                                                                onChange={(e) => handleUpdateMilestone(index, 'type', e.target.value)}
                                                                style={{ width: '100px' }}
                                                            >
                                                                <option value="BONUS">Bonus</option>
                                                                <option value="TOTAL">Total</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className={styles.removeBtn}
                                                        onClick={() => handleRemoveMilestone(index)}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button
                                            type="button"
                                            className={styles.addMilestoneBtn}
                                            onClick={handleAddMilestone}
                                        >
                                            + Add Milestone
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quality & Restrictions */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Quality Requirements & Restrictions</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Onboarding Requirement</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            checked={config.requireOnboarding}
                                            onChange={() => handleToggle('requireOnboarding')}
                                        />
                                        <span>Require onboarding before reward</span>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Count Only Active Members</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            checked={config.countOnlyActive}
                                            onChange={() => handleToggle('countOnlyActive')}
                                        />
                                        <span>Only count active members for milestones</span>
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Minimum Retention Rate (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={config.minimumRetentionRate}
                                        onChange={(e) => handleChange('minimumRetentionRate', e.target.value)}
                                    />
                                    <span className={styles.hint}>Minimum % of referrals that must stay</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Minimum Days in Server</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={config.minimumDaysInServer}
                                        onChange={(e) => handleChange('minimumDaysInServer', e.target.value)}
                                    />
                                    <span className={styles.hint}>Days required to count as successful</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Max Rewards Per Day</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.maxRewardsPerDay}
                                        onChange={(e) => handleChange('maxRewardsPerDay', e.target.value)}
                                    />
                                    <span className={styles.hint}>Maximum rewards per user per day</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Cooldown (minutes)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={config.cooldownMinutes}
                                        onChange={(e) => handleChange('cooldownMinutes', e.target.value)}
                                    />
                                    <span className={styles.hint}>Time between rewards</span>
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
                                        <span>Notify in channel</span>
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
                                        <span>Send DM to referrer</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Display Settings */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Display Settings</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Currency Symbol</label>
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
