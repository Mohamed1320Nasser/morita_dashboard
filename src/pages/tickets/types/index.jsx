import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import Button from '@/components/atoms/buttons/button'
import ticketTypeSettings from '@/controllers/ticketTypeSettings'
import { notify } from '@/config/error'
import styles from './ticketTypes.module.scss'

// Group information
const GROUP_INFO = {
    'services': {
        label: 'Services',
        icon: '🎮',
        color: '#5865F2',
        description: 'OSRS & RS3 service tickets',
    },
    'buy-gold': {
        label: 'Buy Gold',
        icon: '💰',
        color: '#F1C40F',
        description: 'Gold purchase tickets',
    },
    'sell-gold': {
        label: 'Sell Gold',
        icon: '💵',
        color: '#27AE60',
        description: 'Gold selling tickets',
    },
    'crypto-swap': {
        label: 'Crypto Swap',
        icon: '🔄',
        color: '#E67E22',
        description: 'Cryptocurrency swapping',
    },
    'general': {
        label: 'General Support',
        icon: '💬',
        color: '#95A5A6',
        description: 'General support tickets',
    },
}

const TicketTypesPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [ticketTypes, setTicketTypes] = useState([])
    const [groupedTypes, setGroupedTypes] = useState({})

    useEffect(() => {
        fetchTicketTypes()
    }, [])

    useEffect(() => {
        // Group ticket types by groupKey
        if (ticketTypes.length > 0) {
            const grouped = {}
            ticketTypes.forEach((type) => {
                const groupKey = type.groupKey || 'general'
                if (!grouped[groupKey]) {
                    grouped[groupKey] = []
                }
                grouped[groupKey].push(type)
            })

            // Sort types within each group by displayOrder
            Object.keys(grouped).forEach((key) => {
                grouped[key].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
            })

            setGroupedTypes(grouped)
        }
    }, [ticketTypes])

    const fetchTicketTypes = async () => {
        try {
            setLoading(true)
            const response = await ticketTypeSettings.getAllSettings()

            if (response && response.success) {
                // Handle different response formats
                const data = response.data?.data || response.data

                // Ensure data is an array
                if (Array.isArray(data)) {
                    setTicketTypes(data)
                } else {
                    console.error('[TicketTypes] Data is not an array:', data)
                    notify('Invalid data format received', 'error')
                    setTicketTypes([])
                }
            } else {
                notify('Failed to load ticket types', 'error')
                setTicketTypes([])
            }
        } catch (error) {
            console.error('[TicketTypes] Error fetching:', error)
            notify('Error loading ticket types', 'error')
            setTicketTypes([])
        } finally {
            setLoading(false)
        }
    }

    const handleEditGroup = (groupKey) => {
        router.push(`/tickets/types/${groupKey}`)
    }

    const handleToggleType = async (ticketType, currentStatus) => {
        try {
            const response = await ticketTypeSettings.updateSettings(ticketType.ticketType, {
                isActive: !currentStatus,
            })

            if (response && response.success) {
                notify(
                    `${ticketType.buttonLabel || ticketType.ticketType} ${!currentStatus ? 'enabled' : 'disabled'}`,
                    'success'
                )
                fetchTicketTypes()
            } else {
                notify('Failed to update status', 'error')
            }
        } catch (error) {
            console.error('[TicketTypes] Toggle error:', error)
            notify('Error updating status', 'error')
        }
    }

    const handleInitializeDefaults = async () => {
        try {
            const response = await ticketTypeSettings.initializeDefaults()
            if (response && response.success) {
                notify('Default settings initialized successfully!', 'success')
                fetchTicketTypes()
            } else {
                notify('Failed to initialize defaults', 'error')
            }
        } catch (error) {
            console.error('[TicketTypes] Initialize error:', error)
            notify('Error initializing defaults', 'error')
        }
    }

    if (loading) return <Loading />

    return (
        <div className={styles.ticketTypesPage}>
            <PageHead current="Ticket Types">
                <Head title="Manage Ticket Types" back="/dashboard" />
            </PageHead>

            <Container>
                <div className={styles.header}>
                    <div>
                        <h2>Ticket Type Settings</h2>
                        <p>Customize welcome messages, custom fields, and appearance for each ticket type</p>
                    </div>
                    <Button onClick={handleInitializeDefaults} secondary>
                        Initialize Defaults
                    </Button>
                </div>

                <div className={styles.ticketTypesGrid}>
                    {Object.entries(groupedTypes).map(([groupKey, types]) => {
                        const groupInfo = GROUP_INFO[groupKey] || {}
                        const primaryType = types[0] // First type in group holds the primary settings

                        return (
                            <Card key={groupKey} className={styles.ticketTypeCard}>
                                <div className={styles.cardHeader} style={{ borderLeftColor: groupInfo.color }}>
                                    <div className={styles.iconAndTitle}>
                                        <span className={styles.icon}>{groupInfo.icon}</span>
                                        <div>
                                            <h3>{groupInfo.label}</h3>
                                            <p className={styles.description}>{groupInfo.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardContent}>
                                    <div className={styles.settingRow}>
                                        <span className={styles.label}>Welcome Title:</span>
                                        <span className={styles.value}>{primaryType?.welcomeTitle}</span>
                                    </div>

                                    {/* Show sub-types with toggle */}
                                    <div className={styles.subTypesSection}>
                                        <span className={styles.label}>Ticket Types:</span>
                                        <div className={styles.subTypesList}>
                                            {types.map((type) => (
                                                <div key={type.ticketType} className={styles.subTypeRow}>
                                                    <div className={styles.subTypeInfo}>
                                                        <span className={`${styles.buttonBadge} ${styles[type.buttonColor]}`}>
                                                            {type.buttonLabel || type.ticketType}
                                                        </span>
                                                        <span className={styles.fieldCount}>
                                                            {type.customFields?.fields?.length || 0} fields
                                                        </span>
                                                    </div>
                                                    <div className={styles.toggleWrapper}>
                                                        <label className={styles.switch}>
                                                            <input
                                                                type="checkbox"
                                                                checked={type.isActive}
                                                                onChange={() => handleToggleType(type, type.isActive)}
                                                            />
                                                            <span className={styles.slider}></span>
                                                        </label>
                                                        <span className={type.isActive ? styles.active : styles.inactive}>
                                                            {type.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardActions}>
                                    <Button onClick={() => handleEditGroup(groupKey)} primary fullWidth>
                                        Edit Settings
                                    </Button>
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </Container>
        </div>
    )
}

export default TicketTypesPage
