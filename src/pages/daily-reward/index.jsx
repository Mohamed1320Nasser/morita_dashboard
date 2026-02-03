import React, { useEffect, useState } from 'react'
import styles from './dailyReward.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import dailyRewardController from '@/controllers/dailyReward'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'

const DailyRewardConfigPage = () => {
    const router = useRouter()
    const [pageLoading, setPageLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [config, setConfig] = useState({
        minAmount: 1,
        maxAmount: 5,
        cooldownHours: 24,
        isEnabled: true,
        currencyName: '$',
        currencyEmoji: '',
        gifUrl: '',
        thumbnailUrl: '',
    })

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await dailyRewardController.getConfig()
                if (res && res.success) {
                    setConfig({
                        minAmount: res.data.minAmount || 1,
                        maxAmount: res.data.maxAmount || 5,
                        cooldownHours: res.data.cooldownHours || 24,
                        isEnabled: res.data.isEnabled ?? true,
                        currencyName: res.data.currencyName || '$',
                        currencyEmoji: res.data.currencyEmoji || '',
                        gifUrl: res.data.gifUrl || '',
                        thumbnailUrl: res.data.thumbnailUrl || '',
                    })
                } else {
                    notify(res?.error?.message || 'Failed to load config')
                }
            } catch (e) {
                notify('Error loading config')
            } finally {
                setPageLoading(false)
            }
        }
        fetchConfig()
    }, [])

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    const handleToggle = () => {
        setConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))
    }

    const handleSave = async () => {
        // Validation
        if (config.minAmount < 1) {
            notify('Min amount must be at least 1')
            return
        }
        if (config.maxAmount < config.minAmount) {
            notify('Max amount must be greater than min amount')
            return
        }
        if (config.cooldownHours < 1 || config.cooldownHours > 168) {
            notify('Cooldown must be between 1 and 168 hours')
            return
        }

        try {
            setSaving(true)
            const res = await dailyRewardController.updateConfig({
                minAmount: Number(config.minAmount),
                maxAmount: Number(config.maxAmount),
                cooldownHours: Number(config.cooldownHours),
                isEnabled: config.isEnabled,
                currencyName: config.currencyName,
                currencyEmoji: config.currencyEmoji,
                gifUrl: config.gifUrl || null,
                thumbnailUrl: config.thumbnailUrl || null,
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
        <div className={styles.dailyReward}>
            <PageHead current="Daily Reward">
                <Head title="Daily Reward Configuration" />
            </PageHead>

            <Container>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${config.isEnabled ? styles.enabled : styles.disabled}`}>
                        <div className={styles.statLabel}>Status</div>
                        <div className={styles.statValue}>{config.isEnabled ? 'Enabled' : 'Disabled'}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.amount}`}>
                        <div className={styles.statLabel}>Reward Range</div>
                        <div className={styles.statValue}>{config.currencyName}{config.minAmount} - {config.currencyName}{config.maxAmount}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.cooldown}`}>
                        <div className={styles.statLabel}>Cooldown</div>
                        <div className={styles.statValue}>{config.cooldownHours}h</div>
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
                                    onClick={handleToggle}
                                >
                                    <div className={styles.toggleHandle} />
                                </div>
                                <span className={styles.toggleLabel}>
                                    {config.isEnabled ? 'Daily Reward is Enabled' : 'Daily Reward is Disabled'}
                                </span>
                            </div>
                        </div>

                        {/* Reward Settings */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Reward Settings</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Minimum Amount</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.minAmount}
                                        onChange={(e) => handleChange('minAmount', e.target.value)}
                                    />
                                    <span className={styles.hint}>Minimum reward amount users can receive</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Maximum Amount</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={config.maxAmount}
                                        onChange={(e) => handleChange('maxAmount', e.target.value)}
                                    />
                                    <span className={styles.hint}>Maximum reward amount users can receive</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Cooldown (Hours)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="168"
                                        value={config.cooldownHours}
                                        onChange={(e) => handleChange('cooldownHours', e.target.value)}
                                    />
                                    <span className={styles.hint}>Hours between claims (1-168)</span>
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
                                    <span className={styles.hint}>Symbol or name shown in Discord (e.g., $, coins)</span>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Currency Emoji</label>
                                    <input
                                        type="text"
                                        value={config.currencyEmoji}
                                        onChange={(e) => handleChange('currencyEmoji', e.target.value)}
                                        placeholder=""
                                    />
                                    <span className={styles.hint}>Emoji shown with the reward</span>
                                </div>
                            </div>
                        </div>

                        {/* Media Settings */}
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Media Settings</div>
                            <div className={styles.formGrid}>
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label>GIF URL</label>
                                    <input
                                        type="text"
                                        value={config.gifUrl}
                                        onChange={(e) => handleChange('gifUrl', e.target.value)}
                                        placeholder="https://media.tenor.com/..."
                                    />
                                    <span className={styles.hint}>GIF shown when user claims reward (Tenor/Giphy URL)</span>
                                </div>
                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label>Thumbnail URL</label>
                                    <input
                                        type="text"
                                        value={config.thumbnailUrl}
                                        onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    <span className={styles.hint}>Small thumbnail image for the embed</span>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className={styles.previewSection}>
                            <div className={styles.previewTitle}>Discord Preview</div>
                            <div className={styles.previewEmbed}>
                                <div className={styles.embedTitle}>
                                    {config.currencyEmoji || ''} Daily Reward Claimed!
                                </div>
                                <div className={styles.embedDescription}>
                                    You've received <strong>{config.minAmount}-{config.maxAmount}</strong> {config.currencyEmoji || config.currencyName}.<br />
                                    You can use this on your next order.
                                </div>
                                <div className={styles.embedField}>
                                    <div className={styles.fieldName}>New Balance</div>
                                    <div className={styles.fieldValue}><strong>XXX</strong> {config.currencyName}</div>
                                </div>
                                {config.gifUrl && (
                                    <img
                                        src={config.gifUrl}
                                        alt="Preview GIF"
                                        className={styles.embedGif}
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                )}
                                <div className={styles.embedFooter}>
                                    Come back in {config.cooldownHours} hours!
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

export default DailyRewardConfigPage
