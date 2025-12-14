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
import styles from './ticketDetail.module.scss'

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

const STATUS_INFO = {
    OPEN: { label: 'Open', color: '#3498db' },
    IN_PROGRESS: { label: 'In Progress', color: '#f39c12' },
    AWAITING_CONFIRMATION: { label: 'Awaiting Confirmation', color: '#9b59b6' },
    COMPLETED: { label: 'Completed', color: '#27ae60' },
    CANCELLED: { label: 'Cancelled', color: '#e74c3c' },
    CLOSED: { label: 'Closed', color: '#95a5a6' },
}

const TicketDetailPage = () => {
    const router = useRouter()
    const { id } = router.query

    const [loading, setLoading] = useState(true)
    const [ticket, setTicket] = useState(null)
    const [metadata, setMetadata] = useState(null)
    const [messages, setMessages] = useState([])

    // Status update
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState('')

    useEffect(() => {
        if (id) {
            fetchTicketDetails()
        }
    }, [id])

    const fetchTicketDetails = async () => {
        try {
            setLoading(true)

            // Fetch ticket data
            const ticketResponse = await tickets.getTicketById(id)
            if (ticketResponse && ticketResponse.success && ticketResponse.data) {
                const ticketData = ticketResponse.data.data || ticketResponse.data
                setTicket(ticketData)
                setSelectedStatus(ticketData.status)
            } else {
                notify('Failed to load ticket', 'error')
                router.push('/tickets')
                return
            }

            // Fetch metadata
            try {
                const metadataResponse = await tickets.getTicketMetadata(id)
                if (metadataResponse && metadataResponse.success && metadataResponse.data) {
                    setMetadata(metadataResponse.data)
                }
            } catch (err) {
                console.log('No metadata found')
            }
        } catch (error) {
            console.error('[TicketDetail] Error fetching:', error)
            notify('Error loading ticket', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async () => {
        try {
            setUpdatingStatus(true)

            const response = await tickets.updateTicketStatus(id, selectedStatus)
            if (response && response.success) {
                notify('Ticket status updated!', 'success')
                fetchTicketDetails()
            } else {
                notify('Failed to update status', 'error')
            }
        } catch (error) {
            console.error('[TicketDetail] Status update error:', error)
            notify('Error updating status', 'error')
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleCloseTicket = async () => {
        if (!confirm('Are you sure you want to close this ticket?')) {
            return
        }

        try {
            const response = await tickets.closeTicket(id)
            if (response && response.success) {
                notify('Ticket closed successfully!', 'success')
                fetchTicketDetails()
            } else {
                notify('Failed to close ticket', 'error')
            }
        } catch (error) {
            console.error('[TicketDetail] Close error:', error)
            notify('Error closing ticket', 'error')
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) return <Loading />
    if (!ticket) return null

    const typeInfo = TICKET_TYPE_INFO[ticket.ticketType] || {}
    const statusInfo = STATUS_INFO[ticket.status] || {}

    return (
        <div className={styles.ticketDetailPage}>
            <PageHead current={`Ticket #${String(ticket.ticketNumber).padStart(4, '0')}`}>
                <Head
                    title={`Ticket #${String(ticket.ticketNumber).padStart(4, '0')}`}
                    back="/tickets"
                />
            </PageHead>

            <Container>
                {/* Ticket Header */}
                <Card className={styles.headerCard}>
                    <div className={styles.ticketHeader}>
                        <div className={styles.ticketTitle}>
                            <span className={styles.ticketNumber}>
                                #{String(ticket.ticketNumber).padStart(4, '0')}
                            </span>
                            <span className={styles.ticketType}>
                                {typeInfo.icon} {typeInfo.label}
                            </span>
                            <div
                                className={styles.statusBadge}
                                style={{ background: statusInfo.color }}
                            >
                                {statusInfo.label}
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <Button onClick={handleCloseTicket} danger small>
                                Close Ticket
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className={styles.contentGrid}>
                    {/* Left Column */}
                    <div className={styles.leftColumn}>
                        {/* Ticket Information */}
                        <Card className={styles.infoCard}>
                            <h3>Ticket Information</h3>

                            <div className={styles.infoRow}>
                                <span className={styles.label}>Customer:</span>
                                <span className={styles.value}>
                                    {ticket.customer?.fullname || 'Unknown'}
                                </span>
                            </div>

                            <div className={styles.infoRow}>
                                <span className={styles.label}>Discord ID:</span>
                                <span className={styles.value}>{ticket.customerDiscordId}</span>
                            </div>

                            {ticket.service && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Service:</span>
                                    <span className={styles.value}>{ticket.service.name}</span>
                                </div>
                            )}

                            {ticket.category && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Category:</span>
                                    <span className={styles.value}>{ticket.category.name}</span>
                                </div>
                            )}

                            {ticket.calculatedPrice && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Price:</span>
                                    <span className={styles.value}>
                                        ${ticket.calculatedPrice.toFixed(2)} {ticket.currency}
                                    </span>
                                </div>
                            )}

                            <div className={styles.infoRow}>
                                <span className={styles.label}>Created:</span>
                                <span className={styles.value}>{formatDate(ticket.createdAt)}</span>
                            </div>

                            {ticket.closedAt && (
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Closed:</span>
                                    <span className={styles.value}>{formatDate(ticket.closedAt)}</span>
                                </div>
                            )}
                        </Card>

                        {/* Customer Notes */}
                        {ticket.customerNotes && (
                            <Card className={styles.notesCard}>
                                <h3>Customer Notes</h3>
                                <div className={styles.notesContent}>
                                    {ticket.customerNotes.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Metadata */}
                        {metadata && Object.keys(metadata).length > 0 && (
                            <Card className={styles.metadataCard}>
                                <h3>Additional Information</h3>

                                {metadata.goldAmount && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Gold Amount:</span>
                                        <span className={styles.value}>{metadata.goldAmount}M</span>
                                    </div>
                                )}

                                {metadata.osrsUsername && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>OSRS Username:</span>
                                        <span className={styles.value}>{metadata.osrsUsername}</span>
                                    </div>
                                )}

                                {metadata.deliveryMethod && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Delivery Method:</span>
                                        <span className={styles.value}>{metadata.deliveryMethod}</span>
                                    </div>
                                )}

                                {metadata.cryptoType && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Crypto Type:</span>
                                        <span className={styles.value}>{metadata.cryptoType}</span>
                                    </div>
                                )}

                                {metadata.cryptoAmount && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Crypto Amount:</span>
                                        <span className={styles.value}>{metadata.cryptoAmount}</span>
                                    </div>
                                )}

                                {metadata.walletAddress && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Wallet Address:</span>
                                        <span className={styles.value}>{metadata.walletAddress}</span>
                                    </div>
                                )}

                                {metadata.specialNotes && (
                                    <div className={styles.infoRow}>
                                        <span className={styles.label}>Special Notes:</span>
                                        <span className={styles.value}>{metadata.specialNotes}</span>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className={styles.rightColumn}>
                        {/* Status Management */}
                        <Card className={styles.statusCard}>
                            <h3>Manage Status</h3>

                            <div className={styles.statusSelect}>
                                <label>Update Status:</label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className={styles.select}
                                >
                                    {Object.entries(STATUS_INFO).map(([key, info]) => (
                                        <option key={key} value={key}>
                                            {info.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                onClick={handleStatusUpdate}
                                primary
                                fullWidth
                                disabled={updatingStatus || selectedStatus === ticket.status}
                            >
                                {updatingStatus ? 'Updating...' : 'Update Status'}
                            </Button>
                        </Card>

                        {/* Channel Link */}
                        {ticket.channelId && (
                            <Card className={styles.channelCard}>
                                <h3>Discord Channel</h3>
                                <div className={styles.channelInfo}>
                                    <span className={styles.channelIcon}>💬</span>
                                    <div>
                                        <div className={styles.channelLabel}>Channel ID</div>
                                        <div className={styles.channelId}>{ticket.channelId}</div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    )
}

export default TicketDetailPage
