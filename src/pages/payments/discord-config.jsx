import React, { useEffect, useState } from 'react'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import { notify } from '@/config/error'
import paymentsController from '@/controllers/payments'
import InputBox from '@/components/molecules/inputBox/inputBox'
import grid from '@/components/forms/forms.module.scss'

const BUTTON_STYLES = [
    { value: 'PRIMARY', label: 'Primary (Blue)' },
    { value: 'SECONDARY', label: 'Secondary (Gray)' },
    { value: 'SUCCESS', label: 'Success (Green)' },
    { value: 'DANGER', label: 'Danger (Red)' },
]

const DiscordConfigPage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [config, setConfig] = useState(null)
    const [showPreview, setShowPreview] = useState(false)

    // Form state
    const [title, setTitle] = useState('💳 Payment Methods')
    const [description, setDescription] = useState('')
    const [color, setColor] = useState('5865F2')
    const [bannerUrl, setBannerUrl] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [cryptoButtonLabel, setCryptoButtonLabel] = useState('🔗 Cryptocurrency')
    const [cryptoButtonStyle, setCryptoButtonStyle] = useState('PRIMARY')
    const [paymentButtonLabel, setPaymentButtonLabel] = useState('💵 Other Payments')
    const [paymentButtonStyle, setPaymentButtonStyle] = useState('SECONDARY')
    const [footerText, setFooterText] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setPageLoading(true)
            const res = await paymentsController.getDiscordConfig()
            if (res.success && res.data) {
                setConfig(res.data)
                setTitle(res.data.title || '💳 Payment Methods')
                setDescription(res.data.description || '')
                setColor((res.data.color || '5865F2').replace('#', ''))
                setBannerUrl(res.data.bannerUrl || '')
                setThumbnailUrl(res.data.thumbnailUrl || '')
                setCryptoButtonLabel(res.data.cryptoButtonLabel || '🔗 Cryptocurrency')
                setCryptoButtonStyle(res.data.cryptoButtonStyle || 'PRIMARY')
                setPaymentButtonLabel(res.data.paymentButtonLabel || '💵 Other Payments')
                setPaymentButtonStyle(res.data.paymentButtonStyle || 'SECONDARY')
                setFooterText(res.data.footerText || '')
            }
        } catch (error) {
            notify(error)
        } finally {
            setPageLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            if (!title) {
                notify({ message: 'Title is required', type: 'error' })
                return
            }

            setSaving(true)

            const data = {
                title,
                description: description || undefined,
                color: color.replace('#', ''),
                bannerUrl: bannerUrl || undefined,
                thumbnailUrl: thumbnailUrl || undefined,
                cryptoButtonLabel,
                cryptoButtonStyle,
                paymentButtonLabel,
                paymentButtonStyle,
                footerText: footerText || undefined,
            }

            const result = await paymentsController.updateDiscordConfig(data)
            if (result.success) {
                notify({ message: 'Discord configuration saved successfully!', type: 'success' })
                fetchData()
            } else {
                notify(result.error)
            }
        } catch (error) {
            notify(error)
        } finally {
            setSaving(false)
        }
    }

    const getButtonColor = (style) => {
        switch (style) {
            case 'PRIMARY': return '#5865F2'
            case 'SECONDARY': return '#4F545C'
            case 'SUCCESS': return '#57F287'
            case 'DANGER': return '#ED4245'
            default: return '#5865F2'
        }
    }

    if (pageLoading) {
        return (
            <Container>
                <Head title="Discord Configuration" />
                <Loading />
            </Container>
        )
    }

    return (
        <div style={{ width: '100%' }}>
            <PageHead current="Discord Configuration">
                <Head title="Payment Discord Configuration" back="/payments/methods" />
            </PageHead>

            <Container>
                <Card>
                    <div className={grid.wrap}>
                        <div className={grid.grid}>
                            {/* Header Section */}
                            <div className={grid.span2} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ fontSize: 18, fontWeight: 600 }}>Discord Message Configuration</h3>
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <Button onClick={() => setShowPreview(true)} secondary>
                                            Preview
                                        </Button>
                                        <Button onClick={handleSave} primary disabled={saving}>
                                            {saving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                                <p style={{ fontSize: 13, color: '#666', marginTop: 8 }}>
                                    Configure the payment message appearance. Go to Settings → Discord Channels to publish.
                                </p>
                            </div>

                            {/* Title */}
                            <div className={grid.span2}>
                                <InputBox
                                    label="Title"
                                    placeholder="💳 Payment Methods"
                                    value={title}
                                    valueChange={setTitle}
                                />
                            </div>

                            {/* Description */}
                            <div className={grid.span2}>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: 12,
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        resize: 'vertical',
                                        lineHeight: 1.6,
                                    }}
                                    placeholder="Select your preferred payment method to complete your purchase."
                                />
                            </div>

                            {/* Embed Color & Banner URL */}
                            <InputBox
                                label="Embed Color (Hex)"
                                placeholder="5865F2"
                                value={color}
                                valueChange={setColor}
                            />
                            <InputBox
                                label="Banner Image/GIF URL"
                                placeholder="https://example.com/banner.gif"
                                value={bannerUrl}
                                valueChange={setBannerUrl}
                            />

                            {/* Thumbnail & Footer */}
                            <InputBox
                                label="Thumbnail URL"
                                placeholder="https://example.com/thumbnail.png"
                                value={thumbnailUrl}
                                valueChange={setThumbnailUrl}
                            />
                            <InputBox
                                label="Footer Text"
                                placeholder="Need help? Open a ticket!"
                                value={footerText}
                                valueChange={setFooterText}
                            />

                            {/* Button Configuration Section */}
                            <div className={grid.span2} style={{ marginTop: 16 }}>
                                <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Button Configuration</h4>
                            </div>

                            {/* Crypto Button */}
                            <InputBox
                                label="Crypto Button Label"
                                placeholder="🔗 Cryptocurrency"
                                value={cryptoButtonLabel}
                                valueChange={setCryptoButtonLabel}
                            />
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                    Crypto Button Style
                                </label>
                                <select
                                    value={cryptoButtonStyle}
                                    onChange={(e) => setCryptoButtonStyle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 12,
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                        fontSize: 14,
                                    }}
                                >
                                    {BUTTON_STYLES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Payment Button */}
                            <InputBox
                                label="Payment Button Label"
                                placeholder="💵 Other Payments"
                                value={paymentButtonLabel}
                                valueChange={setPaymentButtonLabel}
                            />
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                    Payment Button Style
                                </label>
                                <select
                                    value={paymentButtonStyle}
                                    onChange={(e) => setPaymentButtonStyle(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 12,
                                        border: '1px solid #ddd',
                                        borderRadius: 8,
                                        fontSize: 14,
                                    }}
                                >
                                    {BUTTON_STYLES.map(s => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Discord Preview Modal */}
                {showPreview && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: 8,
                            width: '100%',
                            maxWidth: 600,
                            maxHeight: '90vh',
                            overflow: 'auto',
                            padding: 24
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Discord Preview</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: 24,
                                        cursor: 'pointer',
                                        padding: 0,
                                        color: '#666'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{
                                padding: 16,
                                backgroundColor: '#36393f',
                                color: 'white',
                                borderRadius: 8,
                                borderLeft: `4px solid #${color}`
                            }}>
                                {thumbnailUrl && (
                                    <div style={{ float: 'right', marginLeft: 16 }}>
                                        <img
                                            src={thumbnailUrl}
                                            alt="Thumbnail"
                                            style={{ width: 80, height: 80, borderRadius: 4, objectFit: 'cover' }}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}

                                <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>
                                    {title || 'Untitled'}
                                </div>

                                {description && (
                                    <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}>
                                        {description}
                                    </div>
                                )}

                                {bannerUrl && (
                                    <div style={{ marginBottom: 12, clear: 'both' }}>
                                        <img
                                            src={bannerUrl}
                                            alt="Banner"
                                            style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 4 }}
                                            onError={(e) => e.target.style.display = 'none'}
                                        />
                                    </div>
                                )}

                                {footerText && (
                                    <div style={{ fontSize: 12, color: '#b9bbbe', marginBottom: 12 }}>
                                        {footerText}
                                    </div>
                                )}

                                <div style={{ marginTop: 12, display: 'flex', gap: 8, clear: 'both' }}>
                                    <button style={{
                                        padding: '10px 20px',
                                        backgroundColor: getButtonColor(cryptoButtonStyle),
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}>
                                        {cryptoButtonLabel}
                                    </button>
                                    <button style={{
                                        padding: '10px 20px',
                                        backgroundColor: getButtonColor(paymentButtonStyle),
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        fontWeight: 500
                                    }}>
                                        {paymentButtonLabel}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button onClick={() => setShowPreview(false)} primary>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Container>
        </div>
    )
}

export default DiscordConfigPage
