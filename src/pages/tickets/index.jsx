import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import Button from '@/components/atoms/buttons/button'
import tickets from '@/controllers/tickets'
import { notify } from '@/config/error'
import styles from './tickets.module.scss'

// Ticket type labels with icons
const TICKET_TYPE_INFO = {
    PURCHASE_SERVICES_OSRS: { label: 'OSRS Services', icon: '🎮', color: '#5865F2' },
    PURCHASE_SERVICES_RS3: { label: 'RS3 Services', icon: '🎮', color: '#5865F2' },
    BUY_GOLD_OSRS: { label: 'Buy OSRS Gold', icon: '💰', color: '#F1C40F' },
    BUY_GOLD_RS3: { label: 'Buy RS3 Gold', icon: '💰', color: '#F1C40F' },
    SELL_GOLD_OSRS: { label: 'Sell OSRS Gold', icon: '💵', color: '#27AE60' },
    SELL_GOLD_RS3: { label: 'Sell RS3 Gold', icon: '💵', color: '#27AE60' },
    SWAP_CRYPTO: { label: 'Crypto Swap', icon: '🔄', color: '#E67E22' },
    GENERAL: { label: 'General Support', icon: '💬', color: '#95A5A6' },
}

// Status colors and labels
const STATUS_INFO = {
    OPEN: { label: 'Open', color: '#3498db', icon: '🆕' },
    IN_PROGRESS: { label: 'In Progress', color: '#f39c12', icon: '⏳' },
    AWAITING_CONFIRMATION: { label: 'Awaiting Confirmation', color: '#9b59b6', icon: '⏸️' },
    COMPLETED: { label: 'Completed', color: '#27ae60', icon: '✅' },
    CANCELLED: { label: 'Cancelled', color: '#e74c3c', icon: '❌' },
    CLOSED: { label: 'Closed', color: '#95a5a6', icon: '🔒' },
}

const TicketsPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [ticketsList, setTicketsList] = useState([])
    const [stats, setStats] = useState(null)

    // Filters
    const [statusFilter, setStatusFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchTickets()
        fetchStats()
    }, [statusFilter, typeFilter])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const filters = {}

            if (statusFilter) filters.status = statusFilter
            if (typeFilter) filters.ticketType = typeFilter
            if (searchQuery) filters.search = searchQuery

            const response = await tickets.getAllTickets(filters)

            if (response && response.success && response.data) {
                setTicketsList(response.data.data || response.data)
            } else {
                notify('Failed to load tickets', 'error')
            }
        } catch (error) {
            console.error('[Tickets] Error fetching:', error)
            notify('Error loading tickets', 'error')
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await tickets.getTicketStats()
            if (response && response.success && response.data) {
                setStats(response.data)
            }
        } catch (error) {
            console.error('[Tickets] Error fetching stats:', error)
        }
    }

    const handleViewTicket = (ticketId) => {
        router.push(`/tickets/${ticketId}`)
    }

    const handleSearch = () => {
        fetchTickets()
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading && !ticketsList.length) return <Loading />

    return (
        <div className={styles.ticketsPage}>
            <PageHead current="Tickets">
                <Head title="Manage Tickets" back="/dashboard" />
            </PageHead>

            <Container>
                {/* Statistics Cards */}
                {stats && (
                    <div className={styles.statsGrid}>
                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#3498db' }}>
                                🎫
                            </div>
                            <div className={styles.statInfo}>
                                <div className={styles.statValue}>{stats.total || 0}</div>
                                <div className={styles.statLabel}>Total Tickets</div>
                            </div>
                        </Card>

                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#f39c12' }}>
                                ⏳
                            </div>
                            <div className={styles.statInfo}>
                                <div className={styles.statValue}>{stats.inProgress || 0}</div>
                                <div className={styles.statLabel}>In Progress</div>
                            </div>
                        </Card>

                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#3498db' }}>
                                🆕
                            </div>
                            <div className={styles.statInfo}>
                                <div className={styles.statValue}>{stats.open || 0}</div>
                                <div className={styles.statLabel}>Open</div>
                            </div>
                        </Card>

                        <Card className={styles.statCard}>
                            <div className={styles.statIcon} style={{ background: '#27ae60' }}>
                                ✅
                            </div>
                            <div className={styles.statInfo}>
                                <div className={styles.statValue}>{stats.completed || 0}</div>
                                <div className={styles.statLabel}>Completed</div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Filters */}
                <Card className={styles.filtersCard}>
                    <div className={styles.filtersRow}>
                        <div className={styles.filterGroup}>
                            <label>Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">All Statuses</option>
                                {Object.entries(STATUS_INFO).map(([key, info]) => (
                                    <option key={key} value={key}>
                                        {info.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Ticket Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className={styles.select}
                            >
                                <option value="">All Types</option>
                                {Object.entries(TICKET_TYPE_INFO).map(([key, info]) => (
                                    <option key={key} value={key}>
                                        {info.icon} {info.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.filterGroup}>
                            <label>Search</label>
                            <div className={styles.searchRow}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder="Ticket number or customer..."
                                    className={styles.searchInput}
                                />
                                <Button onClick={handleSearch} primary small>
                                    Search
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tickets List */}
                <Card className={styles.ticketsListCard}>
                    <div className={styles.listHeader}>
                        <h3>Tickets ({ticketsList.length})</h3>
                        <Button onClick={() => router.push('/tickets/types')} secondary>
                            Ticket Settings
                        </Button>
                    </div>

                    {ticketsList.length > 0 ? (
                        <div className={styles.ticketsList}>
                            {ticketsList.map((ticket) => {
                                const typeInfo = TICKET_TYPE_INFO[ticket.ticketType] || {}
                                const statusInfo = STATUS_INFO[ticket.status] || {}

                                return (
                                    <div
                                        key={ticket.id}
                                        className={styles.ticketRow}
                                        onClick={() => handleViewTicket(ticket.id)}
                                    >
                                        <div className={styles.ticketMain}>
                                            <div className={styles.ticketNumber}>
                                                <span className={styles.hash}>#</span>
                                                {String(ticket.ticketNumber).padStart(4, '0')}
                                            </div>

                                            <div className={styles.ticketInfo}>
                                                <div className={styles.ticketTitle}>
                                                    <span className={styles.typeIcon}>{typeInfo.icon}</span>
                                                    <span className={styles.typeName}>{typeInfo.label}</span>
                                                </div>
                                                <div className={styles.ticketCustomer}>
                                                    Customer: {ticket.customer?.fullname || 'Unknown'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className={styles.ticketMeta}>
                                            <div
                                                className={styles.statusBadge}
                                                style={{ background: statusInfo.color }}
                                            >
                                                {statusInfo.icon} {statusInfo.label}
                                            </div>

                                            <div className={styles.ticketDate}>
                                                {formatDate(ticket.createdAt)}
                                            </div>

                                            {ticket.calculatedPrice && (
                                                <div className={styles.ticketPrice}>
                                                    ${ticket.calculatedPrice.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🎫</div>
                            <h3>No tickets found</h3>
                            <p>No tickets match your current filters</p>
                        </div>
                    )}
                </Card>
            </Container>
        </div>
    )
}

export default TicketsPage
