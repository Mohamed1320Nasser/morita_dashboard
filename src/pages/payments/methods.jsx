import React, { useEffect, useState } from 'react'
import styles from '../blockchain/blockchain.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import paymentsController from '@/controllers/payments'
import { notify } from '@/config/error'

// Payment type configurations
const PAYMENT_TYPES = [
    { value: 'PAYPAL', label: 'PayPal', icon: '💳', color: '#003087' },
    { value: 'ZELLE', label: 'Zelle', icon: '🏦', color: '#6D1ED4' },
    { value: 'WISE', label: 'Wise', icon: '💸', color: '#9FE870' },
    { value: 'REVOLUT', label: 'Revolut', icon: '🔄', color: '#0075EB' },
    { value: 'E_TRANSFER', label: 'E-Transfer', icon: '📧', color: '#FFB800' },
    { value: 'CASHAPP', label: 'CashApp', icon: '💵', color: '#00D632' },
    { value: 'VENMO', label: 'Venmo', icon: '📱', color: '#3D95CE' },
    { value: 'OTHER', label: 'Other', icon: '💰', color: '#6B7280' },
]

// Field configurations for each payment type
const PAYMENT_FIELDS = {
    PAYPAL: [
        { key: 'email', label: 'PayPal Email', required: true, placeholder: 'payment@example.com' },
        { key: 'paypalMe', label: 'PayPal.Me Link', required: false, placeholder: 'paypal.me/username (optional)' },
    ],
    ZELLE: [
        { key: 'email', label: 'Email', required: false, placeholder: 'email@example.com' },
        { key: 'phone', label: 'Phone Number', required: false, placeholder: '+1 234 567 8900' },
        { key: 'bankName', label: 'Bank Name', required: false, placeholder: 'e.g., Chase, Bank of America' },
    ],
    WISE: [
        { key: 'email', label: 'Wise Email', required: true, placeholder: 'email@example.com' },
        { key: 'accountHolder', label: 'Account Holder Name', required: false, placeholder: 'John Doe' },
    ],
    REVOLUT: [
        { key: 'username', label: '@Username', required: false, placeholder: '@username' },
        { key: 'phone', label: 'Phone Number', required: false, placeholder: '+1 234 567 8900' },
    ],
    E_TRANSFER: [
        { key: 'email', label: 'E-Transfer Email', required: true, placeholder: 'email@example.com' },
        { key: 'securityQuestion', label: 'Security Question', required: false, placeholder: 'What is the answer?' },
        { key: 'securityAnswer', label: 'Security Answer', required: false, placeholder: 'Answer' },
    ],
    CASHAPP: [
        { key: 'cashtag', label: '$Cashtag', required: true, placeholder: '$username' },
    ],
    VENMO: [
        { key: 'username', label: '@Username', required: true, placeholder: '@username' },
    ],
    OTHER: [
        { key: 'customLabel', label: 'Label', required: true, placeholder: 'e.g., Bank Account' },
        { key: 'customValue', label: 'Value/Details', required: true, placeholder: 'Account details...' },
    ],
}

const PaymentMethodsPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [paymentOptions, setPaymentOptions] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editingOption, setEditingOption] = useState(null)
    const [deletingOption, setDeletingOption] = useState(null)
    const [saving, setSaving] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        type: 'PAYPAL',
        icon: '💳',
        details: {},
        instructions: '',
        upchargePercent: 0,
    })

    const fetchPaymentOptions = async () => {
        try {
            const res = await paymentsController.getAllPaymentOptions()
            if (res && res.success) {
                setPaymentOptions(res.data || [])
            } else {
                notify(res?.error?.message || 'Failed to load payment options')
            }
        } catch (e) {
            notify('Error loading payment options')
        } finally {
            setPageLoading(false)
        }
    }

    useEffect(() => {
        fetchPaymentOptions()
    }, [])

    const handleOpenModal = (option = null) => {
        if (option) {
            setEditingOption(option)
            setFormData({
                name: option.name,
                type: option.type,
                icon: option.icon || getTypeConfig(option.type)?.icon || '💰',
                details: option.details || {},
                instructions: option.instructions || '',
                upchargePercent: option.upchargePercent || 0,
            })
        } else {
            setEditingOption(null)
            const defaultType = 'PAYPAL'
            setFormData({
                name: '',
                type: defaultType,
                icon: getTypeConfig(defaultType)?.icon || '💳',
                details: {},
                instructions: '',
                upchargePercent: 0,
            })
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingOption(null)
    }

    const getTypeConfig = (type) => {
        return PAYMENT_TYPES.find(t => t.value === type)
    }

    const handleTypeChange = (type) => {
        const config = getTypeConfig(type)
        setFormData(prev => ({
            ...prev,
            type,
            icon: config?.icon || '💰',
            details: {}, // Reset details when type changes
        }))
    }

    const handleDetailChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            details: { ...prev.details, [key]: value }
        }))
    }

    const handleSave = async () => {
        if (!formData.name.trim()) {
            notify('Please enter a name for this payment method')
            return
        }

        // Validate required fields based on type
        const fields = PAYMENT_FIELDS[formData.type] || []
        for (const field of fields) {
            if (field.required && !formData.details[field.key]?.trim()) {
                notify(`Please enter ${field.label}`)
                return
            }
        }

        // Special validation for Zelle (at least email or phone)
        if (formData.type === 'ZELLE' && !formData.details.email?.trim() && !formData.details.phone?.trim()) {
            notify('Zelle requires at least email or phone number')
            return
        }

        // Special validation for Revolut (at least username or phone)
        if (formData.type === 'REVOLUT' && !formData.details.username?.trim() && !formData.details.phone?.trim()) {
            notify('Revolut requires at least username or phone number')
            return
        }

        try {
            setSaving(true)
            let res

            if (editingOption) {
                res = await paymentsController.updatePaymentOption(editingOption.id, formData)
            } else {
                res = await paymentsController.createPaymentOption(formData)
            }

            if (res && res.success) {
                notify(editingOption ? 'Payment method updated successfully' : 'Payment method created successfully', 'success')
                handleCloseModal()
                fetchPaymentOptions()
            } else {
                notify(res?.error?.message || 'Failed to save payment method')
            }
        } catch (e) {
            notify('Error saving payment method')
        } finally {
            setSaving(false)
        }
    }

    const handleToggleActive = async (option) => {
        try {
            const res = await paymentsController.updatePaymentOption(option.id, {
                isActive: !option.isActive,
            })

            if (res && res.success) {
                notify(`Payment method ${option.isActive ? 'deactivated' : 'activated'}`, 'success')
                fetchPaymentOptions()
            } else {
                notify(res?.error?.message || 'Failed to update payment method')
            }
        } catch (e) {
            notify('Error updating payment method')
        }
    }

    const handleDeleteClick = (option) => {
        setDeletingOption(option)
        setShowDeleteModal(true)
    }

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setDeletingOption(null)
    }

    const handleDelete = async () => {
        if (!deletingOption) return

        try {
            setSaving(true)
            const res = await paymentsController.deletePaymentOption(deletingOption.id)

            if (res && res.success) {
                notify('Payment method deleted successfully', 'success')
                handleCloseDeleteModal()
                fetchPaymentOptions()
            } else {
                notify(res?.error?.message || 'Failed to delete payment method')
            }
        } catch (e) {
            notify('Error deleting payment method')
        } finally {
            setSaving(false)
        }
    }

    const getDetailsDisplay = (option) => {
        const details = option.details || {}
        const fields = PAYMENT_FIELDS[option.type] || []

        return fields
            .filter(f => details[f.key])
            .map(f => `${f.label}: ${details[f.key]}`)
            .join(' | ') || 'No details'
    }

    const activeOptions = paymentOptions.filter(o => o.isActive).length

    if (pageLoading) return <Loading />

    return (
        <div className={styles.blockchain}>
            <PageHead current="Payments">
                <Head title="Payment Methods" />
            </PageHead>

            <Container>
                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={`${styles.statCard} ${styles.total}`}>
                        <div className={styles.statLabel}>Total Methods</div>
                        <div className={styles.statValue}>{paymentOptions.length}</div>
                    </div>
                    <div className={`${styles.statCard} ${styles.active}`}>
                        <div className={styles.statLabel}>Active Methods</div>
                        <div className={styles.statValue}>{activeOptions}</div>
                    </div>
                </div>

                {/* Header Actions */}
                <div className={styles.headerActions}>
                    <Button primary onClick={() => handleOpenModal()}>
                        + Add Payment Method
                    </Button>
                </div>

                {/* Payment Options List */}
                <Card>
                    {paymentOptions.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>💳</div>
                            <div className={styles.emptyText}>No payment methods configured</div>
                            <div className={styles.emptyHint}>Add PayPal, Zelle, Wise and other payment options for customers</div>
                        </div>
                    ) : (
                        <div className={styles.walletList}>
                            {paymentOptions.map(option => {
                                const typeConfig = getTypeConfig(option.type)
                                return (
                                    <div
                                        key={option.id}
                                        className={`${styles.walletCard} ${!option.isActive ? styles.inactive : ''}`}
                                    >
                                        <div className={styles.walletInfo}>
                                            <div
                                                className={styles.walletIcon}
                                                style={{ background: `${typeConfig?.color}20`, color: typeConfig?.color }}
                                            >
                                                {option.icon || typeConfig?.icon || '💰'}
                                            </div>
                                            <div className={styles.walletDetails}>
                                                <div className={styles.walletName}>{option.name}</div>
                                                <div className={styles.walletAddress}>{getDetailsDisplay(option)}</div>
                                                <div className={styles.walletMeta}>
                                                    <span className={`${styles.badge} ${styles.currency}`}>
                                                        {typeConfig?.label || option.type}
                                                    </span>
                                                    {option.upchargePercent > 0 && (
                                                        <span className={`${styles.badge}`} style={{ background: '#fef3c7', color: '#d97706' }}>
                                                            +{option.upchargePercent}% fee
                                                        </span>
                                                    )}
                                                    <span className={`${styles.badge} ${option.isActive ? styles.active : styles.inactive}`}>
                                                        {option.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                {option.instructions && (
                                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                                        {option.instructions.substring(0, 50)}{option.instructions.length > 50 ? '...' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.walletActions}>
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleToggleActive(option)}
                                            >
                                                {option.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => handleOpenModal(option)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleDeleteClick(option)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </Card>
            </Container>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className={styles.modal} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2>{editingOption ? 'Edit Payment Method' : 'Add Payment Method'}</h2>

                        <div className={styles.configForm}>
                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>Basic Information</div>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Display Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., My PayPal"
                                        />
                                        <span className={styles.hint}>Name shown to customers</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Payment Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={e => handleTypeChange(e.target.value)}
                                        >
                                            {PAYMENT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>
                                                    {t.icon} {t.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>
                                    {getTypeConfig(formData.type)?.label} Details
                                </div>
                                <div className={styles.formGrid}>
                                    {(PAYMENT_FIELDS[formData.type] || []).map(field => (
                                        <div key={field.key} className={styles.formGroup}>
                                            <label>
                                                {field.label}
                                                {field.required && <span style={{ color: '#ef4444' }}> *</span>}
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.details[field.key] || ''}
                                                onChange={e => handleDetailChange(field.key, e.target.value)}
                                                placeholder={field.placeholder}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {(formData.type === 'ZELLE' || formData.type === 'REVOLUT') && (
                                    <div className={styles.hint} style={{ marginTop: '8px', color: '#f59e0b' }}>
                                        {formData.type === 'ZELLE'
                                            ? 'At least email or phone is required for Zelle'
                                            : 'At least username or phone is required for Revolut'
                                        }
                                    </div>
                                )}
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>Fee Settings</div>
                                <div className={styles.formGroup}>
                                    <label>Upcharge Fee (%)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={formData.upchargePercent}
                                        onChange={e => setFormData(prev => ({ ...prev, upchargePercent: parseFloat(e.target.value) || 0 }))}
                                        placeholder="0"
                                    />
                                    <span className={styles.hint}>Additional fee percentage (e.g., 5 = 5% extra charge)</span>
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <div className={styles.sectionTitle}>Instructions (Optional)</div>
                                <div className={styles.formGroup}>
                                    <label>Customer Instructions</label>
                                    <textarea
                                        value={formData.instructions}
                                        onChange={e => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                                        placeholder="e.g., Send as Friends & Family. Include your Discord username in notes."
                                        rows={3}
                                    />
                                    <span className={styles.hint}>Instructions shown to customers when selecting this payment method</span>
                                </div>
                            </div>

                            <div className={styles.modalActions}>
                                <button className={styles.cancelBtn} onClick={handleCloseModal}>
                                    Cancel
                                </button>
                                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                                    {saving ? 'Saving...' : (editingOption ? 'Update Method' : 'Add Method')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingOption && (
                <div className={styles.modal} onClick={handleCloseDeleteModal}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h2>Delete Payment Method</h2>
                        <p>Are you sure you want to delete "<strong>{deletingOption.name}</strong>"?</p>
                        <p style={{ color: '#6b7280', fontSize: '13px' }}>
                            This action cannot be undone.
                        </p>

                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={handleCloseDeleteModal}>
                                Cancel
                            </button>
                            <button className={styles.dangerBtn} onClick={handleDelete} disabled={saving}>
                                {saving ? 'Deleting...' : 'Delete Method'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PaymentMethodsPage
