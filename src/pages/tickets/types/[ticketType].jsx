import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import Button from '@/components/atoms/buttons/button'
import InputBox from '@/components/molecules/inputBox/inputBox'
import ticketTypeSettings from '@/controllers/ticketTypeSettings'
import { notify } from '@/config/error'
import styles from './ticketTypeSettings.module.scss'

// Available template variables
const TEMPLATE_VARIABLES = [
    { name: '{customer}', description: 'Customer mention (@username)' },
    { name: '{support}', description: 'Support role mention' },
    { name: '{service}', description: 'Selected service name' },
    { name: '{price}', description: 'Calculated price' },
    { name: '{currency}', description: 'Currency code (USD)' },
    { name: '{ticket_id}', description: 'Ticket number' },
    { name: '{account_name}', description: 'Account name (for account purchases)' },
]

// Group information
const GROUP_INFO = {
    'services': { label: 'Services', icon: '🎮' },
    'buy-gold': { label: 'Buy Gold', icon: '💰' },
    'sell-gold': { label: 'Sell Gold', icon: '💵' },
    'crypto-swap': { label: 'Crypto Swap', icon: '🔄' },
    'account-purchase': { label: 'Account Purchase', icon: '🎮' },
    'general': { label: 'General Support', icon: '💬' },
}

const TicketTypeSettingsPage = () => {
    const router = useRouter()
    const { ticketType: groupKey } = router.query // Route param is called ticketType but we use it as groupKey

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [typesInGroup, setTypesInGroup] = useState([])
    const [activeTab, setActiveTab] = useState(0)

    // Shared settings (same for all types in group)
    const [welcomeTitle, setWelcomeTitle] = useState('')
    const [welcomeMessage, setWelcomeMessage] = useState('')
    const [footerText, setFooterText] = useState('')
    const [bannerUrl, setBannerUrl] = useState('')
    const [embedColor, setEmbedColor] = useState('5865F2')

    // Per-type settings
    const [customFieldsByType, setCustomFieldsByType] = useState({})

    // Preview state
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        if (groupKey) {
            fetchGroupSettings()
        }
    }, [groupKey])

    const fetchGroupSettings = async () => {
        try {
            setLoading(true)
            const response = await ticketTypeSettings.getSettingsByGroup(groupKey)

            if (response && response.success && response.data) {
                const types = response.data?.data || response.data

                if (!Array.isArray(types) || types.length === 0) {
                    notify('No ticket types found in this group', 'error')
                    router.push('/tickets/types')
                    return
                }

                setTypesInGroup(types)

                // Set shared settings from first type (all should be the same)
                const primary = types[0]
                setWelcomeTitle(primary.welcomeTitle || '')
                setWelcomeMessage(primary.welcomeMessage || '')
                setFooterText(primary.footerText || '')
                setBannerUrl(primary.bannerUrl || '')
                setEmbedColor(primary.embedColor || '5865F2')

                // Set custom fields for each type
                const fieldsMap = {}
                types.forEach((type) => {
                    fieldsMap[type.ticketType] = type.customFields || { fields: [] }
                })
                setCustomFieldsByType(fieldsMap)
            } else {
                notify('Failed to load settings', 'error')
                router.push('/tickets/types')
            }
        } catch (error) {
            console.error('[TicketTypeSettings] Error fetching:', error)
            notify('Error loading settings', 'error')
            router.push('/tickets/types')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)

            // Save each type individually
            for (const type of typesInGroup) {
                const payload = {
                    welcomeTitle,
                    welcomeMessage,
                    footerText,
                    bannerUrl,
                    embedColor,
                    customFields: customFieldsByType[type.ticketType],
                    // Keep per-type settings
                    groupKey: type.groupKey,
                    buttonLabel: type.buttonLabel,
                    buttonColor: type.buttonColor,
                    displayOrder: type.displayOrder,
                    isActive: type.isActive,
                }

                const response = await ticketTypeSettings.upsertSettings(type.ticketType, payload)

                if (!response || !response.success) {
                    notify(`Failed to save ${type.buttonLabel}`, 'error')
                    setSaving(false)
                    return
                }
            }

            notify('All settings saved successfully!', 'success')
            fetchGroupSettings()
        } catch (error) {
            console.error('[TicketTypeSettings] Save error:', error)
            notify('Error saving settings', 'error')
        } finally {
            setSaving(false)
        }
    }

    const insertVariable = (variable) => {
        setWelcomeMessage((prev) => prev + variable)
    }

    const handleAddField = () => {
        const currentType = typesInGroup[activeTab]
        if (!currentType) return

        const newField = {
            id: `field_${Date.now()}`,
            label: 'New Field',
            type: 'text',
            required: false,
            placeholder: '',
            maxLength: 100,
        }

        setCustomFieldsByType((prev) => ({
            ...prev,
            [currentType.ticketType]: {
                fields: [...(prev[currentType.ticketType]?.fields || []), newField],
            },
        }))
    }

    const handleRemoveField = (index) => {
        const currentType = typesInGroup[activeTab]
        if (!currentType) return

        setCustomFieldsByType((prev) => ({
            ...prev,
            [currentType.ticketType]: {
                fields: prev[currentType.ticketType].fields.filter((_, i) => i !== index),
            },
        }))
    }

    const handleFieldChange = (index, key, value) => {
        const currentType = typesInGroup[activeTab]
        if (!currentType) return

        setCustomFieldsByType((prev) => ({
            ...prev,
            [currentType.ticketType]: {
                fields: prev[currentType.ticketType].fields.map((field, i) =>
                    i === index ? { ...field, [key]: value } : field
                ),
            },
        }))
    }

    if (loading) return <Loading />

    const groupInfo = GROUP_INFO[groupKey] || { label: groupKey, icon: '📋' }
    const currentType = typesInGroup[activeTab]
    const currentFields = currentType ? customFieldsByType[currentType.ticketType]?.fields || [] : []

    return (
        <div className={styles.ticketTypeSettingsPage}>
            <PageHead current={`${groupInfo.label} Settings`}>
                <Head title={`${groupInfo.label} Settings`} back="/tickets/types" />
            </PageHead>

            <Container>
                {/* Shared Welcome Message Settings */}
                <Card className={styles.settingsCard}>
                    <h3>Shared Welcome Message</h3>
                    <p className={styles.subtitle}>
                        This welcome message is shared across all ticket types in this group
                    </p>

                    {/* Welcome Title */}
                    <div className={styles.formGroup}>
                        <InputBox
                            label="Welcome Message Title"
                            placeholder="e.g., Welcome to Your Ticket"
                            value={welcomeTitle}
                            valueChange={setWelcomeTitle}
                        />
                    </div>

                    {/* Template Variables */}
                    <div className={styles.formGroup}>
                        <label>Available Variables</label>
                        <div className={styles.variablesGrid}>
                            {TEMPLATE_VARIABLES.map((v) => (
                                <button
                                    key={v.name}
                                    type="button"
                                    onClick={() => insertVariable(v.name)}
                                    className={styles.variableButton}
                                    title={v.description}
                                >
                                    {v.name}
                                </button>
                            ))}
                        </div>
                        <small>Click a variable to insert it into the welcome message</small>
                    </div>

                    {/* Welcome Message */}
                    <div className={styles.formGroup}>
                        <label>Welcome Message (supports Markdown)</label>
                        <textarea
                            value={welcomeMessage}
                            onChange={(e) => setWelcomeMessage(e.target.value)}
                            rows={12}
                            className={styles.textarea}
                            placeholder="Enter the welcome message..."
                        />
                        <small>This message will be sent when a ticket is created</small>
                    </div>

                    {/* Banner URL */}
                    <div className={styles.formGroup}>
                        <InputBox
                            label="Banner Image URL (Optional)"
                            placeholder="https://example.com/banner.png"
                            value={bannerUrl}
                            valueChange={setBannerUrl}
                        />
                    </div>

                    {/* Footer Text */}
                    <div className={styles.formGroup}>
                        <InputBox
                            label="Footer Text (Optional)"
                            placeholder="e.g., Thank you for contacting support"
                            value={footerText}
                            valueChange={setFooterText}
                        />
                    </div>

                    {/* Embed Color */}
                    <div className={styles.formGroup}>
                        <label>Embed Color (Hex without #)</label>
                        <div className={styles.colorInput}>
                            <input
                                type="text"
                                value={embedColor}
                                onChange={(e) => setEmbedColor(e.target.value)}
                                placeholder="5865F2"
                                maxLength={6}
                                className={styles.colorTextInput}
                            />
                            <div
                                className={styles.colorPreview}
                                style={{ backgroundColor: `#${embedColor}` }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Custom Fields per Type */}
                <Card className={styles.settingsCard}>
                    <div className={styles.sectionHeader}>
                        <div>
                            <h3>Custom Form Fields</h3>
                            <p className={styles.subtitle}>
                                Define custom fields for each ticket type. Each type can have different fields.
                            </p>
                        </div>
                        <Button onClick={handleAddField} secondary>
                            + Add Field
                        </Button>
                    </div>

                    {/* Type Tabs */}
                    {typesInGroup.length > 1 && (
                        <div className={styles.typeTabs}>
                            {typesInGroup.map((type, index) => (
                                <button
                                    key={type.ticketType}
                                    onClick={() => setActiveTab(index)}
                                    className={`${styles.typeTab} ${activeTab === index ? styles.active : ''} ${styles[type.buttonColor]}`}
                                >
                                    {type.buttonLabel || type.ticketType}
                                    <span className={styles.fieldBadge}>
                                        {customFieldsByType[type.ticketType]?.fields?.length || 0}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Fields List */}
                    {currentFields.length > 0 ? (
                        <div className={styles.fieldsList}>
                            {currentFields.map((field, index) => (
                                <div key={field.id || index} className={styles.fieldCard}>
                                    <div className={styles.fieldHeader}>
                                        <span className={styles.fieldNumber}>Field {index + 1}</span>
                                        <Button
                                            onClick={() => handleRemoveField(index)}
                                            danger
                                            small
                                        >
                                            Remove
                                        </Button>
                                    </div>

                                    <div className={styles.fieldForm}>
                                        <div className={styles.fieldRow}>
                                            <InputBox
                                                label="Field ID"
                                                value={field.id}
                                                valueChange={(val) => handleFieldChange(index, 'id', val)}
                                                placeholder="field_name"
                                            />
                                            <InputBox
                                                label="Label"
                                                value={field.label}
                                                valueChange={(val) => handleFieldChange(index, 'label', val)}
                                                placeholder="Field Label"
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <div className={styles.selectGroup}>
                                                <label>Type</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                                    className={styles.select}
                                                >
                                                    <option value="text">Text</option>
                                                    <option value="textarea">Textarea</option>
                                                    <option value="number">Number</option>
                                                    <option value="select">Select</option>
                                                    <option value="checkbox">Checkbox</option>
                                                </select>
                                            </div>

                                            <InputBox
                                                label="Placeholder"
                                                value={field.placeholder || ''}
                                                valueChange={(val) => handleFieldChange(index, 'placeholder', val)}
                                                placeholder="Enter placeholder text..."
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <InputBox
                                                label="Max Length"
                                                type="number"
                                                value={field.maxLength || ''}
                                                valueChange={(val) => handleFieldChange(index, 'maxLength', parseInt(val) || undefined)}
                                            />

                                            <label className={styles.checkbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={field.required || false}
                                                    onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                                />
                                                <span>Required field</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.emptyState}>
                            <p>No custom fields defined for {currentType?.buttonLabel}. Click "Add Field" to create one.</p>
                        </div>
                    )}
                </Card>

                {/* Action Buttons */}
                <div className={styles.actionsBar}>
                    <div className={styles.rightActions}>
                        <Button onClick={() => router.push('/tickets/types')} secondary>
                            Cancel
                        </Button>
                        <Button onClick={() => setShowPreview(true)} secondary>
                            Preview
                        </Button>
                        <Button onClick={handleSave} primary disabled={saving}>
                            {saving ? 'Saving...' : 'Save All Settings'}
                        </Button>
                    </div>
                </div>

                {/* Preview Modal */}
                {showPreview && (
                    <div className={styles.previewModal} onClick={() => setShowPreview(false)}>
                        <div className={styles.previewContent} onClick={(e) => e.stopPropagation()}>
                            <h4>Discord Preview</h4>
                            <div
                                className={styles.discordEmbed}
                                style={{ borderLeftColor: `#${embedColor}` }}
                            >
                                {bannerUrl && (
                                    <img src={bannerUrl} alt="Banner" className={styles.banner} />
                                )}
                                <div className={styles.embedTitle}>{welcomeTitle}</div>
                                <div className={styles.embedDescription}>
                                    {welcomeMessage
                                        .replace(/{customer}/g, '@JohnDoe')
                                        .replace(/{support}/g, '@Support')
                                        .replace(/{service}/g, 'Example Service')
                                        .replace(/{price}/g, '$25.00')
                                        .replace(/{currency}/g, 'USD')
                                        .replace(/{ticket_id}/g, '1234')}
                                </div>
                                {footerText && <div className={styles.embedFooter}>{footerText}</div>}
                            </div>
                            <Button onClick={() => setShowPreview(false)} primary>
                                Close Preview
                            </Button>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default TicketTypeSettingsPage
