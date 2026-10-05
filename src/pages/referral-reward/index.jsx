import React, { useEffect, useMemo, useState } from 'react'
import styles from './referralReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import referralRewardController from '@/controllers/referralReward'
import { notify } from '@/config/error'

const DEFAULT_MILESTONES = [
    { count: 5, reward: 5 },
    { count: 10, reward: 15 },
    { count: 25, reward: 50 },
    { count: 50, reward: 150 },
    { count: 100, reward: 400 },
]

const DEFAULT_CONFIG = {
    isEnabled: true,
    rewardMode: 'HYBRID',
    perReferralAmount: 1.0,
    milestones: DEFAULT_MILESTONES,
    requireOnboarding: true,
    minimumRetentionRate: 70,
    minimumDaysInServer: 7,
    countOnlyActive: true,
    maxRewardsPerDay: 10,
    cooldownMinutes: 5,
    notifyDiscord: true,
    notifyDM: true,
    currencyName: '$',
    orderRewardEnabled: false,
    orderRewardType: 'PERCENTAGE',
    orderRewardValue: 5,
    orderRewardMaxPerOrder: 20,
    orderRewardMinOrderValue: 10,
    orderRewardOrderCount: 1,
    orderRewardWindowDays: 0,
    orderRewardHoldDays: 7,
    orderRewardLifetimeCap: 50,
}

const MODES = [
    { value: 'PER_REFERRAL', icon: '💰', name: 'Per-Referral', desc: 'A fixed amount for every qualified referral' },
    { value: 'MILESTONE', icon: '🎯', name: 'Milestones Only', desc: 'Nothing per referral; bonuses at referral goals' },
    { value: 'HYBRID', icon: '🚀', name: 'Hybrid', desc: 'A fixed amount per referral plus milestone bonuses' },
]

const usesPerReferral = (mode) => mode === 'PER_REFERRAL' || mode === 'HYBRID'
const usesMilestones = (mode) => mode === 'MILESTONE' || mode === 'HYBRID'

const fromServer = (data) => ({
    isEnabled: data.isEnabled ?? DEFAULT_CONFIG.isEnabled,
    rewardMode: data.rewardMode || DEFAULT_CONFIG.rewardMode,
    perReferralAmount: data.perReferralAmount ?? DEFAULT_CONFIG.perReferralAmount,
    milestones: Array.isArray(data.milestones)
        ? data.milestones.map(m => ({ count: m.count, reward: m.reward }))
        : DEFAULT_MILESTONES,
    requireOnboarding: data.requireOnboarding ?? DEFAULT_CONFIG.requireOnboarding,
    minimumRetentionRate: data.minimumRetentionRate ?? DEFAULT_CONFIG.minimumRetentionRate,
    minimumDaysInServer: data.minimumDaysInServer ?? DEFAULT_CONFIG.minimumDaysInServer,
    countOnlyActive: data.countOnlyActive ?? DEFAULT_CONFIG.countOnlyActive,
    maxRewardsPerDay: data.maxRewardsPerDay ?? DEFAULT_CONFIG.maxRewardsPerDay,
    cooldownMinutes: data.cooldownMinutes ?? DEFAULT_CONFIG.cooldownMinutes,
    notifyDiscord: data.notifyDiscord ?? DEFAULT_CONFIG.notifyDiscord,
    notifyDM: data.notifyDM ?? DEFAULT_CONFIG.notifyDM,
    currencyName: data.currencyName || DEFAULT_CONFIG.currencyName,
    orderRewardEnabled: data.orderRewardEnabled ?? DEFAULT_CONFIG.orderRewardEnabled,
    orderRewardType: data.orderRewardType || DEFAULT_CONFIG.orderRewardType,
    orderRewardValue: data.orderRewardValue ?? DEFAULT_CONFIG.orderRewardValue,
    orderRewardMaxPerOrder: data.orderRewardMaxPerOrder ?? DEFAULT_CONFIG.orderRewardMaxPerOrder,
    orderRewardMinOrderValue: data.orderRewardMinOrderValue ?? DEFAULT_CONFIG.orderRewardMinOrderValue,
    orderRewardOrderCount: data.orderRewardOrderCount ?? DEFAULT_CONFIG.orderRewardOrderCount,
    orderRewardWindowDays: data.orderRewardWindowDays ?? DEFAULT_CONFIG.orderRewardWindowDays,
    orderRewardHoldDays: data.orderRewardHoldDays ?? DEFAULT_CONFIG.orderRewardHoldDays,
    orderRewardLifetimeCap: data.orderRewardLifetimeCap ?? DEFAULT_CONFIG.orderRewardLifetimeCap,
})

// What gets sent to the API; also used to compare against the saved copy
const toPayload = (config) => ({
    isEnabled: config.isEnabled,
    rewardMode: config.rewardMode,
    perReferralAmount: Number(config.perReferralAmount),
    milestones: config.milestones
        .map(m => ({ count: Number(m.count), reward: Number(m.reward), type: 'BONUS' }))
        .sort((a, b) => a.count - b.count),
    requireOnboarding: config.requireOnboarding,
    minimumRetentionRate: Number(config.minimumRetentionRate),
    minimumDaysInServer: Number(config.minimumDaysInServer),
    countOnlyActive: config.countOnlyActive,
    maxRewardsPerDay: Number(config.maxRewardsPerDay),
    cooldownMinutes: Number(config.cooldownMinutes),
    notifyDiscord: config.notifyDiscord,
    notifyDM: config.notifyDM,
    currencyName: (config.currencyName || '').trim() || '$',
    orderRewardEnabled: config.orderRewardEnabled,
    orderRewardType: config.orderRewardType,
    orderRewardValue: Number(config.orderRewardValue),
    orderRewardMaxPerOrder: Number(config.orderRewardMaxPerOrder),
    orderRewardMinOrderValue: Number(config.orderRewardMinOrderValue),
    orderRewardOrderCount: Number(config.orderRewardOrderCount),
    orderRewardWindowDays: Number(config.orderRewardWindowDays),
    orderRewardHoldDays: Number(config.orderRewardHoldDays),
    orderRewardLifetimeCap: Number(config.orderRewardLifetimeCap),
})

// Stored with 2 decimals: 0.001 would be saved as 0.00 and never pay
const hasMoreThan2Decimals = (n) => Math.round(n * 100) / 100 !== n

// Returns the first problem with the form, or null
const validate = (payload) => {
    const { rewardMode, perReferralAmount, milestones } = payload
    const paysOrders = payload.orderRewardEnabled && payload.orderRewardValue > 0

    if (rewardMode === 'PER_REFERRAL' && !(perReferralAmount > 0) && !paysOrders) {
        return 'Per-referral amount must be greater than 0'
    }
    if (usesPerReferral(rewardMode) && !(perReferralAmount >= 0)) {
        return 'Per-referral amount cannot be negative'
    }
    if (usesPerReferral(rewardMode) && hasMoreThan2Decimals(perReferralAmount)) {
        return 'Per-referral amount can have at most 2 decimal places (e.g. 0.25)'
    }
    if (usesMilestones(rewardMode) && milestones.some(m => hasMoreThan2Decimals(m.reward))) {
        return 'Milestone bonuses can have at most 2 decimal places (e.g. 2.50)'
    }
    if (usesMilestones(rewardMode)) {
        if (milestones.length === 0) return 'Add at least one milestone for this reward mode'
        if (milestones.some(m => !Number.isInteger(m.count) || m.count < 1 || !(m.reward >= 0))) {
            return 'Each milestone needs a whole referral count of 1 or more and a bonus of 0 or more'
        }
        if (new Set(milestones.map(m => m.count)).size !== milestones.length) {
            return 'Two milestones have the same referral count'
        }
    }
    const paysPerReferral = usesPerReferral(rewardMode) && perReferralAmount > 0
    const paysMilestones = usesMilestones(rewardMode) && milestones.some(m => m.reward > 0)
    if (!paysPerReferral && !paysMilestones && !paysOrders) {
        return 'These settings would never pay anything. Set an amount, a milestone bonus or an order reward.'
    }
    if (payload.orderRewardEnabled) {
        const o = payload
        if (!(o.orderRewardValue > 0)) return 'Order reward must be greater than 0'
        if (hasMoreThan2Decimals(o.orderRewardValue)) return 'Order reward can have at most 2 decimal places'
        if (o.orderRewardType === 'PERCENTAGE' && o.orderRewardValue > 100) return 'Order reward percentage cannot be more than 100%'
        for (const [label, v] of [
            ['Max reward per order', o.orderRewardMaxPerOrder],
            ['Minimum order value', o.orderRewardMinOrderValue],
            ['Lifetime cap', o.orderRewardLifetimeCap],
        ]) {
            if (!(v >= 0)) return `${label} cannot be negative`
            if (hasMoreThan2Decimals(v)) return `${label} can have at most 2 decimal places`
        }
        if (!Number.isInteger(o.orderRewardOrderCount) || o.orderRewardOrderCount < 1 || o.orderRewardOrderCount > 100) {
            return 'Number of orders must be a whole number between 1 and 100'
        }
        if (!Number.isInteger(o.orderRewardWindowDays) || o.orderRewardWindowDays < 0) {
            return 'Order window must be a whole number of days, 0 or more'
        }
        if (!Number.isInteger(o.orderRewardHoldDays) || o.orderRewardHoldDays < 0 || o.orderRewardHoldDays > 90) {
            return 'Hold period must be a whole number of days between 0 and 90'
        }
    }
    if (!Number.isInteger(payload.maxRewardsPerDay) || payload.maxRewardsPerDay < 1) {
        return 'Max rewards per day must be a whole number of at least 1'
    }
    if (!Number.isInteger(payload.minimumRetentionRate) || payload.minimumRetentionRate < 0 || payload.minimumRetentionRate > 100) {
        return 'Minimum retention rate must be a whole number between 0 and 100'
    }
    if (!Number.isInteger(payload.minimumDaysInServer) || payload.minimumDaysInServer < 0 || payload.minimumDaysInServer > 365) {
        return 'Minimum days in server must be a whole number between 0 and 365'
    }
    if (!Number.isInteger(payload.cooldownMinutes) || payload.cooldownMinutes < 0) {
        return 'Cooldown must be a whole number of minutes, 0 or more'
    }
    return null
}

const money = (currency, amount) => `${currency || '$'}${Number(amount || 0).toFixed(2)}`

// Plain-language description of what the current form will do
const describe = (payload) => {
    const cur = payload.currencyName
    const lines = []

    if (!payload.isEnabled) {
        return [
            'Rewards are OFF. Nobody is paid, and nothing is announced in Discord.',
            'Members who join while rewards are off are recorded but never paid, even after you turn rewards back on.',
            'Rewards that were already waiting stay on hold and are paid once rewards are back on.',
        ]
    }

    const conditions = []
    if (payload.requireOnboarding) conditions.push('completes onboarding')
    if (payload.minimumDaysInServer > 0) {
        conditions.push(`stays ${payload.minimumDaysInServer} day${payload.minimumDaysInServer === 1 ? '' : 's'}`)
    }
    const when = conditions.length ? `once the invited member ${conditions.join(' and ')}` : 'within about 10 minutes of the member joining'

    if (usesPerReferral(payload.rewardMode) && payload.perReferralAmount > 0) {
        lines.push(`The referrer earns ${money(cur, payload.perReferralAmount)} for each referral, ${when}.`)
    } else if (usesMilestones(payload.rewardMode)) {
        lines.push(`A referral counts toward milestones ${when}; nothing is paid per referral.`)
    } else {
        lines.push('Nothing is paid for a referral joining; referrers earn only from orders (below).')
    }

    if (usesMilestones(payload.rewardMode) && payload.milestones.length > 0) {
        const list = payload.milestones.map(m => `${m.count} → ${money(cur, m.reward)}`).join(', ')
        lines.push(
            `Milestone bonuses (${payload.countOnlyActive ? 'counting only referrals still in the server' : 'counting every qualified referral'}): ${list}.`
        )
    }

    if (payload.orderRewardEnabled && payload.orderRewardValue > 0) {
        const n = payload.orderRewardOrderCount
        const which = n === 1 ? "the referred customer's first order" : `each of the referred customer's first ${n} orders`
        let line = payload.orderRewardType === 'FIXED'
            ? `Order reward: ${money(cur, payload.orderRewardValue)} on ${which}`
            : `Order reward: ${payload.orderRewardValue}% of ${which}`
        const extras = []
        if (payload.orderRewardType === 'PERCENTAGE' && payload.orderRewardMaxPerOrder > 0) {
            extras.push(`max ${money(cur, payload.orderRewardMaxPerOrder)} per order`)
        }
        if (payload.orderRewardMinOrderValue > 0) extras.push(`orders of ${money(cur, payload.orderRewardMinOrderValue)} or more`)
        if (payload.orderRewardWindowDays > 0) extras.push(`placed within ${payload.orderRewardWindowDays} days of the referral`)
        if (payload.orderRewardLifetimeCap > 0) extras.push(`at most ${money(cur, payload.orderRewardLifetimeCap)} in total per referred customer`)
        if (extras.length) line += ` (${extras.join(', ')})`
        line += payload.orderRewardHoldDays > 0
            ? `. Paid ${payload.orderRewardHoldDays} day${payload.orderRewardHoldDays === 1 ? '' : 's'} after the order completes; cancelled if the order is disputed or refunded before then.`
            : '. Paid shortly after the order completes.'
        lines.push(line)
    }

    const limits = [`at most ${payload.maxRewardsPerDay} per referrer per day`]
    if (payload.cooldownMinutes > 0) limits.push(`${payload.cooldownMinutes} min apart`)
    if (payload.minimumRetentionRate > 0) {
        limits.push(`paused while fewer than ${payload.minimumRetentionRate}% of a referrer's invites are still in the server (after 5 referrals)`)
    }
    lines.push(`Join reward limits: ${limits.join('; ')}. Rewards that hit a limit wait and are paid automatically later.`)

    return lines
}

const Switch = ({ checked, onChange, label }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${styles.toggle} ${checked ? styles.active : ''}`}
        onClick={onChange}
        style={{ border: 'none', padding: 0 }}
    >
        <div className={styles.toggleHandle} />
    </button>
)

const ReferralRewardConfigPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    // Saving after a failed load would overwrite the live config with defaults
    const [loadError, setLoadError] = useState(null)
    const [stats, setStats] = useState({ totalRewards: 0, totalRewarded: 0, activeReferrers: 0 })

    const [config, setConfig] = useState(DEFAULT_CONFIG)
    // Last saved copy: drives the status card and the unsaved-changes state
    const [saved, setSaved] = useState(DEFAULT_CONFIG)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, statsRes] = await Promise.all([
                    referralRewardController.getConfig(),
                    referralRewardController.getStats()
                ])

                if (configRes && configRes.success && configRes.data) {
                    const loaded = fromServer(configRes.data)
                    setConfig(loaded)
                    setSaved(loaded)
                } else {
                    const message = configRes?.error?.message || 'Failed to load config'
                    setLoadError(message)
                    notify(message)
                }

                if (statsRes && statsRes.success && statsRes.data) {
                    setStats(statsRes.data)
                }
            } catch (e) {
                setLoadError('Error loading config')
                notify('Error loading config')
            } finally {
                setPageLoading(false)
            }
        }
        fetchData()
    }, [])

    const payload = useMemo(() => toPayload(config), [config])
    const isDirty = useMemo(
        () => JSON.stringify(payload) !== JSON.stringify(toPayload(saved)),
        [payload, saved]
    )
    const summary = useMemo(() => describe(payload), [payload])

    // Warn before closing the tab with unsaved changes
    useEffect(() => {
        if (!isDirty) return undefined
        const handler = (e) => {
            e.preventDefault()
            e.returnValue = ''
        }
        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [isDirty])

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    const handleToggle = (field) => {
        setConfig(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const handleAddMilestone = () => {
        const highest = config.milestones.reduce((max, m) => Math.max(max, Number(m.count) || 0), 0)
        setConfig(prev => ({
            ...prev,
            milestones: [...prev.milestones, { count: highest + 5, reward: 10 }],
        }))
    }

    // Not re-sorted while typing (the row would jump); sorted on save
    const handleUpdateMilestone = (index, field, value) => {
        setConfig(prev => {
            const milestones = [...prev.milestones]
            milestones[index] = { ...milestones[index], [field]: value }
            return { ...prev, milestones }
        })
    }

    const handleRemoveMilestone = (index) => {
        setConfig(prev => ({
            ...prev,
            milestones: prev.milestones.filter((_, i) => i !== index)
        }))
    }

    const handleDiscard = () => setConfig(saved)

    const handleSave = async () => {
        if (loadError) {
            notify('The current configuration could not be loaded. Reload the page before saving.')
            return
        }

        const problem = validate(payload)
        if (problem) {
            notify(problem)
            return
        }

        try {
            setSaving(true)
            const res = await referralRewardController.updateConfig(payload)

            if (res && res.success) {
                // The API answers { success, message, data: config }
                const serverConfig = res.data?.data ?? res.data
                const next = serverConfig && typeof serverConfig === 'object' && 'rewardMode' in serverConfig
                    ? fromServer(serverConfig)
                    : fromServer(payload)
                setConfig(next)
                setSaved(next)
                notify(
                    payload.isEnabled === saved.isEnabled
                        ? 'Configuration saved'
                        : payload.isEnabled
                            ? 'Referral rewards turned ON'
                            : 'Referral rewards turned OFF',
                    'success'
                )
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

    const showPerReferral = usesPerReferral(config.rewardMode)
    const showMilestones = usesMilestones(config.rewardMode)

    return (
        <div className={styles.referralReward}>
            <PageHead current="Referral Reward Settings">
                <Head title="Referral Reward Configuration" />
            </PageHead>

            <Container>
                {/* Stats reflect what is live, not unsaved edits */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${saved.isEnabled ? styles.enabled : styles.disabled}`}>
                        <div className={styles.statLabel}>Live Status</div>
                        <div className={styles.statValue}>{loadError ? 'Unknown' : saved.isEnabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.rewards}`}>
                        <div className={styles.statLabel}>Rewards Paid</div>
                        <div className={styles.statValue}>{stats.totalRewards || 0}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.amount}`}>
                        <div className={styles.statLabel}>Total Amount Paid</div>
                        <div className={styles.statValue}>{money(saved.currencyName, stats.totalRewarded)}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.referrers}`}>
                        <div className={styles.statLabel}>Referrers Paid</div>
                        <div className={styles.statValue}>{stats.activeReferrers || 0}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.amount}`}>
                        <div className={styles.statLabel}>Order Rewards On Hold</div>
                        <div className={styles.statValue}>
                            {money(saved.currencyName, stats.orderRewards?.pendingAmount)}
                        </div>
                    </div>
                </div>

                <Card>
                    {loadError && (
                        <div className={styles.hint} style={{ color: '#ef4444', marginBottom: '16px' }}>
                            Could not load the saved configuration ({loadError}). Saving is disabled so the
                            defaults shown here do not overwrite it. Reload the page to try again.
                        </div>
                    )}
                    <div className={styles.configForm}>
                        {/* Enable/Disable */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Feature Status</div>
                            <div className={styles.toggleGroup}>
                                <Switch
                                    checked={config.isEnabled}
                                    onChange={() => handleToggle('isEnabled')}
                                    label="Referral rewards enabled"
                                />
                                <span className={styles.toggleLabel}>
                                    {config.isEnabled ? 'Referral rewards are ON' : 'Referral rewards are OFF'}
                                    {config.isEnabled !== saved.isEnabled && ' (not saved yet)'}
                                </span>
                            </div>
                            <span className={styles.hint} style={{ display: 'block', marginTop: '8px' }}>
                                {config.isEnabled
                                    ? 'Members who join through a referral link are tracked and their referrer is paid when the rules below are met.'
                                    : 'While OFF: no rewards are paid and no referral messages are sent in Discord. Invite links still work and joins are still recorded, but members who join while OFF will never be paid. Rewards already waiting are paid once you turn it back ON.'}
                            </span>
                        </div>

                        {/* Reward Mode */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Reward Mode</div>
                            <div className={styles.rewardModeSelector} role="radiogroup" aria-label="Reward mode">
                                {MODES.map(mode => (
                                    <div
                                        key={mode.value}
                                        role="radio"
                                        aria-checked={config.rewardMode === mode.value}
                                        tabIndex={0}
                                        className={`${styles.modeOption} ${config.rewardMode === mode.value ? styles.active : ''}`}
                                        onClick={() => handleChange('rewardMode', mode.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                handleChange('rewardMode', mode.value)
                                            }
                                        }}
                                    >
                                        <div className={styles.modeIcon}>{mode.icon}</div>
                                        <div className={styles.modeName}>{mode.name}</div>
                                        <div className={styles.modeDesc}>{mode.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Per-Referral */}
                        {showPerReferral && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>💰 Per-Referral Reward</div>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="perReferralAmount">Amount per qualified referral</label>
                                        <input
                                            id="perReferralAmount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={config.perReferralAmount}
                                            onChange={(e) => handleChange('perReferralAmount', e.target.value)}
                                        />
                                        <span className={styles.hint}>
                                            Added to the referrer's wallet for each referral that meets the rules below.
                                            {config.rewardMode === 'HYBRID' && ' Set to 0 to pay milestone bonuses only.'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Milestones */}
                        {showMilestones && (
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>🎯 Milestone Bonuses</div>
                                <div className={styles.milestoneExplainer}>
                                    A one-time bonus when a referrer reaches a number of qualified referrals, paid on
                                    top of any per-referral amount. A milestone you add or turn on only pays for
                                    progress made after you save. Referrers already past it are not back-paid.
                                </div>
                                <div className={styles.milestoneBuilder}>
                                    <div className={styles.milestoneList}>
                                        {config.milestones.length === 0 && (
                                            <span className={styles.hint}>No milestones yet. Add one below.</span>
                                        )}
                                        {config.milestones.map((milestone, index) => (
                                            <div key={`milestone-${index}`} className={styles.milestoneRow}>
                                                <div className={styles.milestoneInputs}>
                                                    <div className={styles.inputGroup}>
                                                        <label htmlFor={`milestone-count-${index}`}>Referrals</label>
                                                        <input
                                                            id={`milestone-count-${index}`}
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            value={milestone.count}
                                                            onChange={(e) => handleUpdateMilestone(index, 'count', e.target.value)}
                                                            style={{ width: '100px' }}
                                                        />
                                                    </div>
                                                    <span className={styles.arrow}>→</span>
                                                    <div className={styles.inputGroup}>
                                                        <label htmlFor={`milestone-reward-${index}`}>Bonus</label>
                                                        <input
                                                            id={`milestone-reward-${index}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={milestone.reward}
                                                            onChange={(e) => handleUpdateMilestone(index, 'reward', e.target.value)}
                                                            style={{ width: '120px' }}
                                                        />
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={styles.removeBtn}
                                                    aria-label={`Remove milestone ${milestone.count}`}
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
                                <div className={styles.checkboxGroup} style={{ marginTop: '16px' }}>
                                    <input
                                        id="countOnlyActive"
                                        type="checkbox"
                                        checked={config.countOnlyActive}
                                        onChange={() => handleToggle('countOnlyActive')}
                                    />
                                    <label htmlFor="countOnlyActive">Only count referrals still in the server</label>
                                </div>
                                <span className={styles.hint}>
                                    When on, a referred member who leaves stops counting toward milestones.
                                </span>
                            </div>
                        )}

                        {/* Order rewards */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>🛒 Order Rewards</div>
                            <div className={styles.toggleGroup}>
                                <Switch
                                    checked={config.orderRewardEnabled}
                                    onChange={() => handleToggle('orderRewardEnabled')}
                                    label="Order rewards enabled"
                                />
                                <span className={styles.toggleLabel}>
                                    {config.orderRewardEnabled
                                        ? 'Referrers also earn from their customers\' orders'
                                        : 'Order rewards are off'}
                                </span>
                            </div>
                            <span className={styles.hint} style={{ display: 'block', margin: '8px 0 16px' }}>
                                Works alongside the reward mode above. When someone you referred completes an
                                order, the referrer earns a share of it.
                            </span>

                            {config.orderRewardEnabled && (
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="orderRewardType">Reward type</label>
                                        <select
                                            id="orderRewardType"
                                            value={config.orderRewardType}
                                            onChange={(e) => handleChange('orderRewardType', e.target.value)}
                                        >
                                            <option value="PERCENTAGE">Percentage of the order</option>
                                            <option value="FIXED">Fixed amount per order</option>
                                        </select>
                                        <span className={styles.hint}>
                                            Percentage scales with order size; fixed pays the same for any order.
                                        </span>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="orderRewardValue">
                                            {config.orderRewardType === 'PERCENTAGE' ? 'Percentage (%)' : `Amount (${config.currencyName || '$'})`}
                                        </label>
                                        <input
                                            id="orderRewardValue"
                                            type="number"
                                            min="0"
                                            max={config.orderRewardType === 'PERCENTAGE' ? 100 : undefined}
                                            step="0.01"
                                            value={config.orderRewardValue}
                                            onChange={(e) => handleChange('orderRewardValue', e.target.value)}
                                        />
                                        <span className={styles.hint}>
                                            {config.orderRewardType === 'PERCENTAGE'
                                                ? 'Of the order value. E.g. 5 = $2.00 on a $40 order.'
                                                : 'Paid for each qualifying order.'}
                                        </span>
                                    </div>
                                    {config.orderRewardType === 'PERCENTAGE' && (
                                        <div className={styles.formGroup}>
                                            <label htmlFor="orderRewardMaxPerOrder">Max reward per order</label>
                                            <input
                                                id="orderRewardMaxPerOrder"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.orderRewardMaxPerOrder}
                                                onChange={(e) => handleChange('orderRewardMaxPerOrder', e.target.value)}
                                            />
                                            <span className={styles.hint}>Caps big orders. 0 = no cap.</span>
                                        </div>
                                    )}
                                    <div className={styles.formGroup}>
                                        <label htmlFor="orderRewardMinOrderValue">Minimum order value</label>
                                        <input
                                            id="orderRewardMinOrderValue"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={config.orderRewardMinOrderValue}
                                            onChange={(e) => handleChange('orderRewardMinOrderValue', e.target.value)}
                                        />
                                        <span className={styles.hint}>
                                            Smaller orders earn nothing, so tiny orders are not worth faking.
                                        </span>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="orderRewardOrderCount">Reward the first … orders</label>
                                        <input
                                            id="orderRewardOrderCount"
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="1"
                                            value={config.orderRewardOrderCount}
                                            onChange={(e) => handleChange('orderRewardOrderCount', e.target.value)}
                                        />
                                        <span className={styles.hint}>
                                            1 = first order only. Counts the referred customer's completed orders.
                                        </span>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="orderRewardWindowDays">Only orders within (days)</label>
                                        <input
                                            id="orderRewardWindowDays"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={config.orderRewardWindowDays}
                                            onChange={(e) => handleChange('orderRewardWindowDays', e.target.value)}
                                        />
                                        <span className={styles.hint}>
                                            Days after the referral. 0 = no time limit.
                                        </span>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="orderRewardHoldDays">Hold before paying (days)</label>
                                        <input
                                            id="orderRewardHoldDays"
                                            type="number"
                                            min="0"
                                            max="90"
                                            step="1"
                                            value={config.orderRewardHoldDays}
                                            onChange={(e) => handleChange('orderRewardHoldDays', e.target.value)}
                                        />
                                        <span className={styles.hint}>
                                            If the order is disputed or refunded during this time, the reward is
                                            cancelled. Match your refund window.
                                        </span>
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="orderRewardLifetimeCap">Lifetime cap per referred customer</label>
                                        <input
                                            id="orderRewardLifetimeCap"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={config.orderRewardLifetimeCap}
                                            onChange={(e) => handleChange('orderRewardLifetimeCap', e.target.value)}
                                        />
                                        <span className={styles.hint}>
                                            Most a referrer can ever earn from one customer's orders. 0 = no cap.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Quality & Restrictions */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>When a Referral Qualifies (join rewards)</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="requireOnboarding">Onboarding</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            id="requireOnboarding"
                                            type="checkbox"
                                            checked={config.requireOnboarding}
                                            onChange={() => handleToggle('requireOnboarding')}
                                        />
                                        <span>Member must complete onboarding</span>
                                    </div>
                                    <span className={styles.hint}>
                                        Until then the reward waits; it is paid automatically (checked every 10
                                        minutes) once every rule here is met.
                                    </span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="minimumDaysInServer">Minimum days in server</label>
                                    <input
                                        id="minimumDaysInServer"
                                        type="number"
                                        min="0"
                                        max="365"
                                        step="1"
                                        value={config.minimumDaysInServer}
                                        onChange={(e) => handleChange('minimumDaysInServer', e.target.value)}
                                    />
                                    <span className={styles.hint}>
                                        Leaving pauses the reward; if the member comes back the count restarts from
                                        the day they rejoin. 0 pays without waiting.
                                    </span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="minimumRetentionRate">Minimum retention rate (%)</label>
                                    <input
                                        id="minimumRetentionRate"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={config.minimumRetentionRate}
                                        onChange={(e) => handleChange('minimumRetentionRate', e.target.value)}
                                    />
                                    <span className={styles.hint}>
                                        A referrer's rewards wait while fewer than this share of their invites are
                                        still in the server. Applies from 5 referrals. 0 turns it off.
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Anti-Abuse Limits (join rewards)</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="maxRewardsPerDay">Max rewards per referrer per day</label>
                                    <input
                                        id="maxRewardsPerDay"
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={config.maxRewardsPerDay}
                                        onChange={(e) => handleChange('maxRewardsPerDay', e.target.value)}
                                    />
                                    <span className={styles.hint}>Extra rewards wait and are paid on a later day.</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="cooldownMinutes">Cooldown between rewards (minutes)</label>
                                    <input
                                        id="cooldownMinutes"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={config.cooldownMinutes}
                                        onChange={(e) => handleChange('cooldownMinutes', e.target.value)}
                                    />
                                    <span className={styles.hint}>
                                        Minimum gap between two rewards to the same referrer. Rewards inside the gap
                                        wait. 0 turns it off.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Discord Notifications</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="notifyDiscord">Referral channel</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            id="notifyDiscord"
                                            type="checkbox"
                                            checked={config.notifyDiscord}
                                            onChange={() => handleToggle('notifyDiscord')}
                                        />
                                        <span>Post new referrals and paid rewards</span>
                                    </div>
                                    <span className={styles.hint}>
                                        Uses the channel in DISCORD_REFERRAL_CHANNEL_ID on the bot server.
                                    </span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="notifyDM">Direct message</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            id="notifyDM"
                                            type="checkbox"
                                            checked={config.notifyDM}
                                            onChange={() => handleToggle('notifyDM')}
                                        />
                                        <span>DM the referrer</span>
                                    </div>
                                    <span className={styles.hint}>
                                        When someone joins with their link and when a reward is paid.
                                    </span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label htmlFor="currencyName">Currency symbol</label>
                                    <input
                                        id="currencyName"
                                        type="text"
                                        maxLength={10}
                                        value={config.currencyName}
                                        onChange={(e) => handleChange('currencyName', e.target.value)}
                                        placeholder="$"
                                    />
                                    <span className={styles.hint}>Shown in Discord messages (e.g. $, coins).</span>
                                </div>
                            </div>
                        </div>

                        {/* Live summary of what these settings do */}
                        <div className={styles.explainer}>
                            <strong>What these settings do{isDirty ? ' (after you save)' : ''}:</strong>
                            <ul style={{ margin: '8px 0 0', paddingLeft: '18px' }}>
                                {summary.map(line => <li key={line}>{line}</li>)}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions} style={{ alignItems: 'center' }}>
                            {isDirty && (
                                <span className={styles.hint} style={{ marginRight: 'auto', color: '#f59e0b' }}>
                                    You have unsaved changes
                                </span>
                            )}
                            <Button
                                secondary
                                onClick={handleDiscard}
                                disabled={!isDirty || saving}
                            >
                                Discard
                            </Button>
                            <Button
                                primary
                                onClick={handleSave}
                                disabled={saving || !isDirty || !!loadError}
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
