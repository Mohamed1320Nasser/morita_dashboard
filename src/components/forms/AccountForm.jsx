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


// Existing accounts hold arbitrary JSON, so the rows have to survive a
// round trip through it. Arrays become a comma-separated string, which is
// how the bot renders them anyway; nested objects flatten to "parent.child"
// so nothing already saved is silently dropped by the editor.
const objectToRows = (data) => {
    if (!data || typeof data !== 'object') return []

    const rows = []
    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            rows.push({ key, value: value.join(', ') })
        } else if (value && typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
                rows.push({ key: `${key}.${subKey}`, value: String(subValue ?? '') })
            })
        } else {
            rows.push({ key, value: String(value ?? '') })
        }
    })
    return rows
}

// A value the admin typed as a number or yes/no is stored as one, so the bot
// formats it the way it always has - thousands separators, checkmarks - rather
// than printing every field as a plain string.
const coerce = (raw) => {
    const value = raw.trim()
    if (value === '') return ''
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value)
    if (/^(true|yes)$/i.test(value)) return true
    if (/^(false|no)$/i.test(value)) return false
    if (value.includes(',')) {
        const parts = value.split(',').map(v => v.trim()).filter(Boolean)
        if (parts.length > 1) return parts
    }
    return value
}

const rowsToObject = (rows) => {
    const result = {}
    rows.forEach(({ key, value }) => {
        const name = key.trim()
        if (!name) return

        if (name.includes('.')) {
            const [parent, ...rest] = name.split('.')
            const child = rest.join('.')
            if (!result[parent] || typeof result[parent] !== 'object' || Array.isArray(result[parent])) {
                result[parent] = {}
            }
            result[parent][child] = coerce(value)
            return
        }

        result[name] = coerce(value)
    })
    return result
}

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
    })

    const [dataRows, setDataRows] = useState(objectToRows(initial.accountData))
    const [existingImages, setExistingImages] = useState(initial.images || [])
    const [newImages, setNewImages] = useState([])
    const [deleteImageIds, setDeleteImageIds] = useState([])

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
            })
            setDataRows(objectToRows(initial.accountData))
            setExistingImages(initial.images || [])
            setNewImages([])
            setDeleteImageIds([])
        }
    }, [initial])

    const update = (key, value) => {
        setForm(prev => ({ ...prev, [key]: value }))
    }

    const updateRow = (index, field, value) => {
        setDataRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
    }

    const addRow = () => {
        setDataRows(prev => [...prev, { key: '', value: '' }])
    }

    const removeRow = (index) => {
        setDataRows(prev => prev.filter((_, i) => i !== index))
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
        const activeExistingImages = existingImages.filter(img => !deleteImageIds.includes(img.id))
        if (activeExistingImages.length === 0 && newImages.length === 0) {
            alert('At least one image is required')
            return
        }

        const accountDataParsed = rowsToObject(dataRows)

        const formData = new FormData()
        formData.append('name', form.name)
        formData.append('price', form.price)
        formData.append('quantity', form.quantity || 1)
        if (form.source) formData.append('source', form.source)
        formData.append('category', form.category)
        formData.append('status', form.status)
        if (Object.keys(accountDataParsed).length > 0) {
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
                    <div className={styles.sectionTitle}>Account Details</div>
                    <div className={styles.fieldGroup}>
                        <label>Shown to customers on the account listing</label>

                        {dataRows.length > 0 && (
                            <div className={styles.dataRows}>
                                {dataRows.map((row, index) => (
                                    <div key={index} className={styles.dataRow}>
                                        <input
                                            type="text"
                                            className={styles.dataKey}
                                            value={row.key}
                                            onChange={(e) => updateRow(index, 'key', e.target.value)}
                                            placeholder="Label (e.g. Combat Level)"
                                        />
                                        <input
                                            type="text"
                                            className={styles.dataValue}
                                            value={row.value}
                                            onChange={(e) => updateRow(index, 'value', e.target.value)}
                                            placeholder="Value (e.g. 126)"
                                        />
                                        <button
                                            type="button"
                                            className={styles.dataRemove}
                                            onClick={() => removeRow(index)}
                                            title="Remove this detail"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button type="button" className={styles.addRowButton} onClick={addRow}>
                            + Add detail
                        </button>

                        <div className={styles.dataHint}>
                            Separate several values with commas to show them as a list.
                            Numbers and yes/no are recognised automatically.
                        </div>
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
