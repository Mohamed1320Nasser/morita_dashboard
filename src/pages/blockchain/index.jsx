import React, { useEffect, useState } from 'react'
import styles from './blockchain.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import blockchainController from '@/controllers/blockchain'
import { notify } from '@/config/error'

const CURRENCY_ICONS = {
    BTC: '₿',
    LTC: '🪙',
    ETH: '⟠',
    USDT: '💵',
    USDC: '💲',
    SOL: '◎',
    XRP: '✕',
}

// Currency to Network mapping for auto-selection
const CURRENCY_NETWORK_MAP = {
    BTC: 'bitcoin',
    LTC: 'litecoin',
    ETH: 'ethereum',
    USDT: 'ethereum',
    USDC: 'ethereum',
    SOL: 'solana',
    XRP: 'ripple',
}

const NETWORKS = [
    { value: 'bitcoin', label: 'Bitcoin' },
    { value: 'litecoin', label: 'Litecoin' },
    { value: 'ethereum', label: 'Ethereum' },
    { value: 'solana', label: 'Solana' },
    { value: 'ripple', label: 'XRP Ledger' },
]

const CURRENCIES = [
    { value: 'BTC', label: 'BTC (Bitcoin)' },
    { value: 'LTC', label: 'LTC (Litecoin)' },
    { value: 'ETH', label: 'ETH (Ethereum)' },
    { value: 'USDT', label: 'USDT (Tether)' },
    { value: 'USDC', label: 'USDC (USD Coin)' },
    { value: 'SOL', label: 'SOL (Solana)' },
    { value: 'XRP', label: 'XRP (Ripple)' },
]

const BlockchainWalletsPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [wallets, setWallets] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingWallet, setEditingWallet] = useState(null)
    const [deletingWallet, setDeletingWallet] = useState(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        currency: 'BTC',
        network: 'bitcoin',
        address: '',
        upchargePercent: 0,
    })

    const fetchWallets = async () => {
        try {
            const res = await blockchainController.getAllWallets()
            if (res && res.success) {
                setWallets(res.data || [])
            } else {
                notify(res?.error?.message || 'Failed to load wallets')
            }
        } catch (e) {
            notify('Error loading wallets')
        } finally {
            setPageLoading(false)
        }
    }

    useEffect(() => {
        fetchWallets()
    }, [])

    const handleOpenModal = (wallet = null) => {
        if (wallet) {
            setEditingWallet(wallet)
            setFormData({
                name: wallet.name,
                currency: wallet.currency,
                network: wallet.network,
                address: wallet.address,
                upchargePercent: wallet.upchargePercent || 0,
            })
        } else {
            setEditingWallet(null)
            setFormData({
                name: '',
                currency: 'BTC',
                network: 'bitcoin',
                address: '',
                upchargePercent: 0,
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingWallet(null)
    }

    const handleChange = (field, value) => {
        if (field === 'currency') {
            // Auto-select network based on currency
            const network = CURRENCY_NETWORK_MAP[value] || 'bitcoin'
            setFormData(prev => ({ ...prev, currency: value, network }))
        } else {
            setFormData(prev => ({ ...prev, [field]: value }))
        }
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            notify('Please enter a wallet name')
            return
        }
        if (!formData.address.trim()) {
            notify('Please enter a wallet address')
            return
        }

        try {
            setSaving(true)
            let res

            if (editingWallet) {
                res = await blockchainController.updateWallet(editingWallet.id, formData)
            } else {
                res = await blockchainController.createWallet(formData)
            }

            if (res && res.success) {
                notify(editingWallet ? 'Wallet updated successfully' : 'Wallet created successfully', 'success')
                handleCloseModal()
                fetchWallets()
            } else {
                notify(res?.error?.message || 'Failed to save wallet')
            }
        } catch (e) {
            notify('Error saving wallet')
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (wallet) => {
        try {
            const res = await blockchainController.updateWallet(wallet.id, {
                isActive: !wallet.isActive,
            })

            if (res && res.success) {
                notify(`Wallet ${wallet.isActive ? 'deactivated' : 'activated'}`, 'success')
                fetchWallets()
            } else {
                notify(res?.error?.message || 'Failed to update wallet')
            }
        } catch (e) {
            notify('Error updating wallet')
        }
    }

    const handleDeleteClick = (wallet) => {
        setDeletingWallet(wallet)
        setShowDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingWallet(null)
    }

    const handleDelete = async () => {
        if (!deletingWallet) return

        try {
            setSaving(true)
            const res = await blockchainController.deleteWallet(deletingWallet.id)

            if (res && res.success) {
                notify('Wallet deleted successfully', 'success')
                handleCloseDeleteModal()
                fetchWallets()
            } else {
                notify(res?.error?.message || 'Failed to delete wallet')
            }
        } catch (e) {
            notify('Error deleting wallet')
        } finally {
            setSaving(false)
        }
    }

    const getNetworkLabel = (networkValue) => {
        const network = NETWORKS.find(n => n.value === networkValue)
        return network ? network.label : networkValue
    }

    const activeWallets = wallets.filter(w => w.isActive).length

    if (pageLoading) return <Loading />

    return (
        <div className={styles.blockchain}>
            <PageHead current="Blockchain">
                <Head title="Crypto Wallets" />
            </PageHead>

            <Container>
                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.total}`}>
                        <div className={styles.statLabel}>Total Wallets</div>
                        <div className={styles.statValue}>{wallets.length}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.active}`}>
                        <div className={styles.statLabel}>Active Wallets</div>
                        <div className={styles.statValue}>{activeWallets}</div>
                    </div>
                </div>

                {/* Header Actions */}
                <div className={styles.headerActions}>
                    <Button primary onClick={() => handleOpenModal()}>
                        + Add Wallet
                    </Button>
                </div>

                {/* Wallet List */}
                <Card>
                    {wallets.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔐</div>
                            <div className={styles.emptyText}>No wallets configured</div>
                            <div className={styles.emptyHint}>Add your first crypto wallet address to receive payments</div>
                        </div>
                    ) : (
                        <div className={styles.walletList}>
                            {wallets.map(wallet => (
                                <div
                                    key={wallet.id}
                                    className={`${styles.walletCard} ${!wallet.isActive ? styles.inactive : ''}`}
                                >
                                    <div className={styles.walletInfo}>
                                        <div className={`${styles.walletIcon} ${styles[wallet.currency.toLowerCase()]}`}>
                                            {CURRENCY_ICONS[wallet.currency] || '💰'}
                                        </div>
                                        <div className={styles.walletDetails}>
                                            <div className={styles.walletName}>{wallet.name}</div>
                                            <div className={styles.walletAddress}>{wallet.address}</div>
                                            <div className={styles.walletMeta}>
                                                <span className={`${styles.badge} ${styles.currency}`}>
                                                    {wallet.currency}
                                                </span>
                                                <span className={`${styles.badge} ${styles.network}`}>
                                                    {getNetworkLabel(wallet.network)}
                                                </span>
                                                {wallet.upchargePercent > 0 && (
                                                    <span className={`${styles.badge}`} style={{ background: '#fef3c7', color: '#d97706' }}>
                                                        +{wallet.upchargePercent}% fee
                                                    </span>
                                                )}
                                                <span className={`${styles.badge} ${wallet.isActive ? styles.active : styles.inactive}`}>
                                                    {wallet.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.walletActions}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleToggleActive(wallet)}
                                        >
                                            {wallet.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button
                                            className={styles.editBtn}
                                            onClick={() => handleOpenModal(wallet)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDeleteClick(wallet)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </Container>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2>{editingWallet ? 'Edit Wallet' : 'Add New Wallet'}</h2>

                        <div className={styles.configForm}>
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>Wallet Information</div>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Wallet Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                            placeholder="e.g., Main BTC Wallet"
                                        />
                                        <span className={styles.hint}>A friendly name to identify this wallet</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Currency</label>
                                        <select
                                            value={formData.currency}
                                            onChange={e => handleChange('currency', e.target.value)}
                                        >
                                            {CURRENCIES.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Network</label>
                                        <select
                                            value={formData.network}
                                            onChange={e => handleChange('network', e.target.value)}
                                        >
                                            {NETWORKS.map(n => (
                                                <option key={n.value} value={n.value}>{n.label}</option>
                                            ))}
                                        </select>
                                        <span className={styles.hint}>The blockchain network for this wallet</span>
                                    </div>

                                    <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                        <label>Wallet Address</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={e => handleChange('address', e.target.value)}
                                            placeholder="Enter your wallet public address"
                                        />
                                        <span className={styles.hint}>The public address to receive payments</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Upcharge Fee (%)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={formData.upchargePercent}
                                            onChange={e => handleChange('upchargePercent', parseFloat(e.target.value) || 0)}
                                            placeholder="0"
                                        />
                                        <span className={styles.hint}>Additional fee percentage (e.g., 5 = 5% extra)</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : (editingWallet ? 'Update Wallet' : 'Add Wallet')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingWallet && (
                <div className={styles.modal} onClick={handleCloseDeleteModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2>Delete Wallet</h2>
                        <p>Are you sure you want to delete "<strong>{deletingWallet.name}</strong>"?</p>
                        <p style={{ color: '#6b7280', fontSize: '13px' }}>
                            This action cannot be undone.
                        </p>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={handleCloseDeleteModal}>
                                Cancel
                            </button>
                            <button className={styles.dangerBtn} onClick={handleDelete} disabled={saving}>
                                {saving ? 'Deleting...' : 'Delete Wallet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BlockchainWalletsPage
