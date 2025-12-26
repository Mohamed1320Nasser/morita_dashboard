import React, { useEffect, useState } from 'react'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import { notify } from '@/config/error'
import onboardingController from '@/controllers/onboarding'
import InputBox from '@/components/molecules/inputBox/inputBox'
import grid from '@/components/forms/forms.module.scss'

const TermsOfServicePage = () => {
    const [pageLoading, setPageLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTos, setActiveTos] = useState(null)
    const [stats, setStats] = useState(null)
    const [showPreview, setShowPreview] = useState(false)

    // Form state
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [bannerUrl, setBannerUrl] = useState('')
    const [thumbnailUrl, setThumbnailUrl] = useState('')
    const [embedColor, setEmbedColor] = useState('5865F2')
    const [footerText, setFooterText] = useState('')
    const [buttonLabel, setButtonLabel] = useState('Accept Terms')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setPageLoading(true)

            // Fetch active TOS
            const tosRes = await onboardingController.getActiveTos()
            if (tosRes.success && tosRes.data) {
                setActiveTos(tosRes.data)
                setTitle(tosRes.data.title || '')
                setContent(tosRes.data.content || '')
                setBannerUrl(tosRes.data.bannerUrl || '')
                setThumbnailUrl(tosRes.data.thumbnailUrl || '')
                setEmbedColor(tosRes.data.embedColor || '5865F2')
                setFooterText(tosRes.data.footerText || '')
                setButtonLabel(tosRes.data.buttonLabel || 'Accept Terms')

                // Fetch stats only if TOS has an ID
                if (tosRes.data.id) {
                    const statsRes = await onboardingController.getTosStats(tosRes.data.id)
                    if (statsRes.success) {
                        setStats(statsRes.data)
                    }
                }
            }
        } catch (error) {
            notify(error)
        } finally {
            setPageLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            // Validation
            if (!title || !content) {
                notify({ message: 'Title and Content are required', type: 'error' })
                return
            }

            setSaving(true)

            const data = {
                title,
                content,
                bannerUrl: bannerUrl || undefined,
                thumbnailUrl: thumbnailUrl || undefined,
                embedColor,
                footerText: footerText || undefined,
                buttonLabel,
                isActive: true
            }

            let result
            if (activeTos && activeTos.id) {
                result = await onboardingController.updateTos(activeTos.id, data)
                if (result.success) {
                    notify({ message: 'Terms of Service updated successfully!', type: 'success' })
                }
            } else {
                result = await onboardingController.createTos(data)
                if (result.success) {
                    notify({ message: 'Terms of Service created successfully!', type: 'success' })
                }
            }

            if (result.success) {
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

    const handlePublishToDiscord = async () => {
        try {
            if (!activeTos || !activeTos.id) {
                notify({ message: 'Please save TOS first', type: 'error' })
                return
            }

            const result = await onboardingController.publishToDiscord(activeTos.id)
            if (result.success) {
                notify({ message: 'TOS published to Discord successfully!', type: 'success' })
            } else {
                notify(result.error)
            }
        } catch (error) {
            notify(error)
        }
    }

    if (pageLoading) {
        return (
            <Container>
                <Head title="Terms of Service" />
                <Loading />
            </Container>
        )
    }

    return (
        <div style={{ width: '100%' }}>
            <PageHead current="Terms of Service">
                <Head title="Terms of Service Management" back="/" />
            </PageHead>

            <Container>
                <Card>
                <div className={grid.wrap}>
                    <div className={grid.grid}>
                        {/* Header Section */}
                        <div className={grid.span2} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: 18, fontWeight: 600 }}>Edit Terms of Service</h3>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Button onClick={() => setShowPreview(true)} secondary>
                                        👁️ Preview
                                    </Button>
                                    <Button onClick={handlePublishToDiscord} disabled={!activeTos || !activeTos.id} secondary>
                                        Publish to Discord
                                    </Button>
                                    <Button onClick={handleSave} primary disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        {stats && (
                            <div className={grid.span2} style={{ marginBottom: 24 }}>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(4, 1fr)',
                                    gap: 12,
                                    padding: 16,
                                    background: '#f8f9fa',
                                    borderRadius: 8
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{stats.totalAcceptances}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>Total Acceptances</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{stats.todayAcceptances}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>Today</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>{stats.weeklyAcceptances}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>This Week</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>v{stats.currentVersion}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>Version</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Title */}
                        <div className={grid.span2}>
                            <InputBox
                                label="Title"
                                placeholder="Enter TOS title"
                                value={title}
                                valueChange={setTitle}
                            />
                        </div>

                        {/* Content */}
                        <div className={grid.span2}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Content
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={12}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    resize: 'vertical',
                                    lineHeight: 1.6,
                                }}
                                placeholder="Enter your Terms of Service content here..."
                            />
                        </div>

                        {/* Banner & Thumbnail URLs */}
                        <InputBox
                            label="Banner Image/GIF URL"
                            placeholder="https://example.com/banner.gif"
                            value={bannerUrl}
                            valueChange={setBannerUrl}
                        />
                        <InputBox
                            label="Thumbnail URL"
                            placeholder="https://example.com/thumbnail.png"
                            value={thumbnailUrl}
                            valueChange={setThumbnailUrl}
                        />

                        {/* Embed Color & Button Label */}
                        <InputBox
                            label="Embed Color (Hex)"
                            placeholder="5865F2"
                            value={embedColor}
                            valueChange={setEmbedColor}
                        />
                        <InputBox
                            label="Button Label"
                            placeholder="Accept Terms"
                            value={buttonLabel}
                            valueChange={setButtonLabel}
                        />

                        {/* Footer Text */}
                        <div className={grid.span2}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                                Footer Text (optional)
                            </label>
                            <textarea
                                value={footerText}
                                onChange={(e) => setFooterText(e.target.value)}
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: 12,
                                    border: '1px solid #ddd',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    resize: 'vertical',
                                }}
                                placeholder="Additional footer information..."
                            />
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
                            borderLeft: `4px solid #${embedColor}`
                        }}>
                            <div style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}>
                                {title || 'Untitled'}
                            </div>

                            {bannerUrl && (
                                <div style={{ marginBottom: 12 }}>
                                    <img
                                        src={bannerUrl}
                                        alt="Banner"
                                        style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 4 }}
                                    />
                                </div>
                            )}

                            <div style={{ whiteSpace: 'pre-wrap', marginBottom: 12, fontSize: 14, lineHeight: 1.6 }}>
                                {content || 'No content yet...'}
                            </div>

                            {footerText && (
                                <div style={{ fontSize: 12, color: '#b9bbbe', marginBottom: 12 }}>
                                    {footerText}
                                </div>
                            )}

                            <div style={{ marginTop: 12 }}>
                                <button style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#3ba55d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    fontWeight: 500
                                }}>
                                    ✅ {buttonLabel}
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

export default TermsOfServicePage
