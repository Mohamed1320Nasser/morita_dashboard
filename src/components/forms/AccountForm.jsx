import React, { useEffect, useState, useRef } from 'react'
import Button from '@/components/atoms/buttons/button'
import styles from '@/pages/accounts/accountForm.module.scss'

const ACCOUNT_CATEGORIES = [
    { value: 'MAIN', label: 'Main' },
    { value: 'IRONS', label: 'Irons' },
    { value: 'HCIM', label: 'HCIM' },
    { value: 'ZERK', label: 'Zerk' },
    { value: 'PURE', label: 'Pure' },
    { value: 'ACCOUNTS', label: 'Accounts' },
]

const ACCOUNT_STATUSES = [
    { value: 'IN_STOCK', label: 'In Stock' },
    { value: 'RESERVED', label: 'Reserved' },
    { value: 'SOLD', label: 'Sold' },
]

const AccountForm = ({
    initial = {},
    submitting = false,
    onCancel,
    onSubmit,
    isEdit = false,
}) => {
    const fileInputRef = useRef(null)

    const [form, setForm] = useState({
        name: initial.name || '',
        price: initial.price || '',
        quantity: initial.quantity || 1,
        source: initial.source || '',
        category: initial.category || '',
        status: initial.status || 'IN_STOCK',
        accountData: initial.accountData ? JSON.stringify(initial.accountData, null, 2) : '',
    })

    const [existingImages, setExistingImages] = useState(initial.images || [])
    const [newImages, setNewImages] = useState([])
    const [deleteImageIds, setDeleteImageIds] = useState([])
    const [jsonError, setJsonError] = useState('')

    const lastInitialRef = useRef(JSON.stringify(initial))

    useEffect(() => {
        const currentKey = JSON.stringify(initial)
        if (currentKey !== lastInitialRef.current && (initial.name || initial.id)) {
            lastInitialRef.current = currentKey
            setForm({
                name: initial.name || '',
                price: initial.price || '',
                quantity: initial.quantity || 1,
                source: initial.source || '',
                category: initial.category || '',
                status: initial.status || 'IN_STOCK',
                accountData: initial.accountData ? JSON.stringify(initial.accountData, null, 2) : '',
            })
            setExistingImages(initial.images || [])
            setNewImages([])
            setDeleteImageIds([])
        }
    }, [initial])

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const handleAccountDataChange = (value) => {
        setForm(prev => ({ ...prev, accountData: value }))
        if (value.trim()) {
            try {
                JSON.parse(value)
                setJsonError('')
            } catch (e) {
                setJsonError('Invalid JSON format')
            }
        } else {
            setJsonError('')
        }
    }

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files || [])
        const totalImages = existingImages.length - deleteImageIds.length + newImages.length + files.length
        if (totalImages > 10) {
            alert('Maximum 10 images allowed')
            return
        }

        const newImageObjects = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: `new-${Date.now()}-${Math.random()}`,
        }))
        setNewImages(prev => [...prev, ...newImageObjects])
        e.target.value = ''
    }

    const handleDeleteExisting = (imageId) => {
        setDeleteImageIds(prev => [...prev, imageId])
    }

    const handleDeleteNew = (imageId) => {
        setNewImages(prev => {
            const img = prev.find(i => i.id === imageId)
            if (img?.preview) URL.revokeObjectURL(img.preview)
            return prev.filter(i => i.id !== imageId)
        })
    }

    const handleSubmit = () => {
        if (jsonError) {
            alert('Please fix the JSON error before submitting')
            return
        }

        const activeExistingImages = existingImages.filter(img => !deleteImageIds.includes(img.id))
        if (activeExistingImages.length === 0 && newImages.length === 0) {
            alert('At least one image is required')
            return
        }

        let accountDataParsed = null
        if (form.accountData.trim()) {
            try {
                accountDataParsed = JSON.parse(form.accountData)
            } catch (e) {
                alert('Invalid JSON in account data')
                return
            }
        }

        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('price', form.price)
        formData.append('quantity', form.quantity || 1)
        if (form.source) formData.append('source', form.source)
        formData.append('category', form.category)
        formData.append('status', form.status)
        if (accountDataParsed) {
            formData.append('accountData', JSON.stringify(accountDataParsed))
        }

        newImages.forEach(img => {
            formData.append('images', img.file)
        })

        if (isEdit && deleteImageIds.length > 0) {
            formData.append('deleteImageIds', JSON.stringify(deleteImageIds))
        }

        onSubmit?.(formData)
    }

    const activeExistingImages = existingImages.filter(img => !deleteImageIds.includes(img.id))
    const totalImages = activeExistingImages.length + newImages.length
    const canAddMore = totalImages < 10

    return (
        <div className={styles.wrap}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit() }}>
                {/* Basic Information Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Basic Information</div>
                    <div className={styles.grid}>
                        <div className={styles.fieldGroup}>
                            <label>Name <span className={styles.required}>*</span></label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => update('name', e.target.value)}
                                placeholder="Account name"
                                required
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Price <span className={styles.required}>*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.price}
                                onChange={(e) => update('price', e.target.value)}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Quantity</label>
                            <input
                                type="number"
                                min="1"
                                value={form.quantity}
                                onChange={(e) => update('quantity', parseInt(e.target.value) || 1)}
                                placeholder="1"
                            />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Source</label>
                            <input
                                type="text"
                                value={form.source}
                                onChange={(e) => update('source', e.target.value)}
                                placeholder="Where this account came from"
                            />
                        </div>
                    </div>
                </div>

                {/* Classification Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Classification</div>
                    <div className={styles.grid}>
                        <div className={styles.fieldGroup}>
                            <label>Category <span className={styles.required}>*</span></label>
                            <select
                                value={form.category}
                                onChange={(e) => update('category', e.target.value)}
                                required
                            >
                                <option value="">Select category</option>
                                {ACCOUNT_CATEGORIES.map(c => (
                                    <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Status</label>
                            <select
                                value={form.status}
                                onChange={(e) => update('status', e.target.value)}
                            >
                                {ACCOUNT_STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Account Data Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>Account Data (JSON)</div>
                    <div className={styles.fieldGroup}>
                        <label>Custom account data (stats, items, etc.)</label>
                        <textarea
                            value={form.accountData}
                            onChange={(e) => handleAccountDataChange(e.target.value)}
                            placeholder='{"stats": {"attack": 99}, "items": ["dragon scimitar"]}'
                        />
                        {jsonError && <div className={styles.jsonError}>{jsonError}</div>}
                    </div>
                </div>

                {/* Images Section */}
                <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                        Images <span className={styles.required}>*</span>
                        <span style={{ fontWeight: 400, fontSize: 13, color: '#6b7280', marginLeft: 8 }}>
                            ({totalImages}/10)
                        </span>
                    </div>
                    <div className={styles.imagesGrid}>
                        {/* Existing Images */}
                        {activeExistingImages.map(img => (
                            <div key={img.id} className={styles.imagePreview}>
                                <img src={img.url} alt="Account" />
                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteExisting(img.id)}
                                >
                                    x
                                </button>
                            </div>
                        ))}

                        {/* New Images */}
                        {newImages.map(img => (
                            <div key={img.id} className={`${styles.imagePreview} ${styles.newImage}`}>
                                <img src={img.preview} alt="New" />
                                <button
                                    type="button"
                                    className={styles.deleteBtn}
                                    onClick={() => handleDeleteNew(img.id)}
                                >
                                    x
                                </button>
                            </div>
                        ))}

                        {/* Upload Button */}
                        {canAddMore && (
                            <div
                                className={styles.uploadBox}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className={styles.uploadIcon}>+</div>
                                <div className={styles.uploadText}>Add Image</div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className={styles.actionsRow}>
                    <div />
                    <div className={styles.actionsRight}>
                        <Button type="button" onClick={onCancel} secondary>Cancel</Button>
                        <Button type="submit" primary disabled={submitting}>
                            {submitting ? 'Saving...' : (isEdit ? 'Update Account' : 'Create Account')}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default AccountForm
