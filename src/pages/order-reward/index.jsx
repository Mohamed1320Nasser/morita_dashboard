import React, { useEffect, useState } from 'react'
import styles from './orderReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import orderRewardController from '@/controllers/orderReward'
import { notify } from '@/config/error'

const OrderRewardConfigPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [stats, setStats] = useState({ totalClaims: 0, totalRewarded: 0, firstOrderClaims: 0 })

    const [config, setConfig] = useState({
        isEnabled: false,
        rewardType: 'PERCENTAGE',
        fixedAmount: 5,
        percentage: 2,
        minReward: 1,
        maxReward: 50,
        minOrderAmount: 20,
        firstOrderBonus: 0,
        notifyDiscord: true,
        currencyName: '$',
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, statsRes] = await Promise.all([
                    orderRewardController.getConfig(),
                    orderRewardController.getStats()
                ])

                if (configRes && configRes.success) {
                    setConfig({
                        isEnabled: configRes.data.isEnabled ?? false,
                        rewardType: configRes.data.rewardType || 'PERCENTAGE',
                        fixedAmount: configRes.data.fixedAmount || 5,
                        percentage: configRes.data.percentage || 2,
                        minReward: configRes.data.minReward || 1,
                        maxReward: configRes.data.maxReward || 50,
                        minOrderAmount: configRes.data.minOrderAmount || 20,
                        firstOrderBonus: configRes.data.firstOrderBonus || 0,
                        notifyDiscord: configRes.data.notifyDiscord ?? true,
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
        if (config.rewardType === 'FIXED' && config.fixedAmount <= 0) {
            notify('Fixed amount must be greater than 0')
            return
        }
        if (config.rewardType === 'PERCENTAGE' && (config.percentage <= 0 || config.percentage > 100)) {
            notify('Percentage must be between 0 and 100')
            return
        }
        if (config.minReward < 0 || config.maxReward < 0) {
            notify('Min/Max reward cannot be negative')
            return
        }
        if (config.minReward > config.maxReward) {
            notify('Min reward cannot be greater than max reward')
            return
        }

        try {
            setSaving(true)
            const res = await orderRewardController.updateConfig({
                isEnabled: config.isEnabled,
                rewardType: config.rewardType,
                fixedAmount: Number(config.fixedAmount),
                percentage: Number(config.percentage),
                minReward: Number(config.minReward),
                maxReward: Number(config.maxReward),
                minOrderAmount: Number(config.minOrderAmount),
                firstOrderBonus: Number(config.firstOrderBonus),
                notifyDiscord: config.notifyDiscord,
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
        <div className={styles.orderReward}>
            <PageHead current="Order Reward">
                <Head title="Order Reward Configuration" />
            </PageHead>

            <Container>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${config.isEnabled ? styles.enabled : styles.disabled}`}>
                        <div className={styles.statLabel}>Status</div>
                        <div className={styles.statValue}>{config.isEnabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.amount}`}>
                        <div className={styles.statLabel}>Total Claims</div>
                        <div className={styles.statValue}>{stats.totalClaims}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.percentage}`}>
                        <div className={styles.statLabel}>Total Rewarded</div>
                        <div className={styles.statValue}>{config.currencyName}{stats.totalRewarded.toFixed(2)}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.firstOrder}`}>
                        <div className={styles.statLabel}>First Order Bonuses</div>
                        <div className={styles.statValue}>{stats.firstOrderClaims}</div>
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
                                    {config.isEnabled ? 'Order Rewards are Enabled' : 'Order Rewards are Disabled'}
                                </span>
                            </div>
                        </div>

                        {/* Reward Type */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Reward Calculation Method</div>
                            <div className={styles.radioGroup}>
                                <label
                                    className={`${styles.radioOption} ${config.rewardType === 'PERCENTAGE' ? styles.selected : ''}`}
                                    onClick={() => handleChange('rewardType', 'PERCENTAGE')}
                                >
                                    <input
                                        type="radio"
                                        name="rewardType"
                                        checked={config.rewardType === 'PERCENTAGE'}
                                        onChange={() => handleChange('rewardType', 'PERCENTAGE')}
                                    />
                                    <div className={styles.radioContent}>
                                        <span className={styles.radioTitle}>Percentage of Order Value</span>
                                        <span className={styles.radioDesc}>Reward is calculated as a percentage of the order total</span>
                                    </div>
                                </label>
                                <label
                                    className={`${styles.radioOption} ${config.rewardType === 'FIXED' ? styles.selected : ''}`}
                                    onClick={() => handleChange('rewardType', 'FIXED')}
                                >
                                    <input
                                        type="radio"
                                        name="rewardType"
                                        checked={config.rewardType === 'FIXED'}
                                        onChange={() => handleChange('rewardType', 'FIXED')}
                                    />
                                    <div className={styles.radioContent}>
                                        <span className={styles.radioTitle}>Fixed Amount</span>
                                        <span className={styles.radioDesc}>Same reward amount for every completed order</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Reward Settings */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Reward Settings</div>
                            <div className={styles.formGrid}>
                                {config.rewardType === 'FIXED' ? (
                                    <div className={styles.formGroup}>
                                        <label>Fixed Reward Amount</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={config.fixedAmount}
                                            onChange={(e) => handleChange('fixedAmount', e.target.value)}
                                        />
                                        <span className={styles.hint}>Fixed amount given for every completed order</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.formGroup}>
                                            <label>Percentage (%)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                step="0.1"
                                                value={config.percentage}
                                                onChange={(e) => handleChange('percentage', e.target.value)}
                                            />
                                            <span className={styles.hint}>Percentage of order value as reward</span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Minimum Reward</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.minReward}
                                                onChange={(e) => handleChange('minReward', e.target.value)}
                                            />
                                            <span className={styles.hint}>Minimum reward amount (floor)</span>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>Maximum Reward</label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={config.maxReward}
                                                onChange={(e) => handleChange('maxReward', e.target.value)}
                                            />
                                            <span className={styles.hint}>Maximum reward amount (cap)</span>
                                        </div>
                                    </>
                                )}
                                <div className={styles.formGroup}>
                                    <label>Minimum Order Amount</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={config.minOrderAmount}
                                        onChange={(e) => handleChange('minOrderAmount', e.target.value)}
                                    />
                                    <span className={styles.hint}>Orders below this value won't get rewards</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>First Order Bonus</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={config.firstOrderBonus}
                                        onChange={(e) => handleChange('firstOrderBonus', e.target.value)}
                                    />
                                    <span className={styles.hint}>Extra bonus for customer's first completed order</span>
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
                                    <span className={styles.hint}>Symbol shown in messages (e.g., $, coins)</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Discord Notification</label>
                                    <div className={styles.checkboxGroup}>
                                        <input
                                            type="checkbox"
                                            checked={config.notifyDiscord}
                                            onChange={() => handleToggle('notifyDiscord')}
                                        />
                                        <span>Notify customer in Discord when reward is given</span>
                                    </div>
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

export default OrderRewardConfigPage
