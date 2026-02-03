import React, { useEffect, useState } from 'react'
import styles from '../accountView.module.scss'
import { useRouter } from 'next/router'
import accountsController from '@/controllers/accounts'
import { notify } from '@/config/error'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import Button from '@/components/atoms/buttons/button'
import moment from 'moment'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'

const ACCOUNT_CATEGORIES = {
    MAIN: 'Main',
    IRONS: 'Irons',
    HCIM: 'HCIM',
    ZERK: 'Zerk',
    PURE: 'Pure',
    ACCOUNTS: 'Accounts',
}

const ACCOUNT_STATUSES = {
    IN_STOCK: { label: 'In Stock', type: 'success' },
    RESERVED: { label: 'Reserved', type: 'warning' },
    SOLD: { label: 'Sold', type: 'info' },
}

const ViewAccount = () => {
    const router = useRouter()
    const { id } = router.query
    const [loading, setLoading] = useState(true)
    const [account, setAccount] = useState(null)
    const [deleteModal, setDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [lightboxIndex, setLightboxIndex] = useState(null)

    useEffect(() => {
        if (!id) return
        const load = async () => {
            try {
                setLoading(true)
                const res = await accountsController.getAccountById(id)

                if (res && res.success) {
                    const acc = res.data?.account?.data ?? res.data?.account ?? res.data ?? {}
                    setAccount(acc)
                } else {
                    notify(res?.error?.message || 'Failed to load account')
                    router.push('/accounts')
                }
            } catch (err) {
                notify('Failed to load account')
                router.push('/accounts')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [id])

    const handleDelete = async () => {
        try {
            setDeleting(true)
            const res = await accountsController.deleteAccount(id)
            if (res && res.success !== false) {
                notify('Account deleted successfully', 'success')
                router.push('/accounts')
            } else {
                notify(res?.error?.message || 'Failed to delete account')
            }
        } catch {
            notify('Failed to delete account')
        } finally {
            setDeleting(false)
            setDeleteModal(false)
        }
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price || 0)
    }

    const openLightbox = (index) => setLightboxIndex(index)
    const closeLightbox = () => setLightboxIndex(null)

    const nextImage = (e) => {
        e.stopPropagation()
        if (account?.images?.length) {
            setLightboxIndex((prev) => (prev + 1) % account.images.length)
        }
    }

    const prevImage = (e) => {
        e.stopPropagation()
        if (account?.images?.length) {
            setLightboxIndex((prev) => (prev - 1 + account.images.length) % account.images.length)
        }
    }

    if (loading) return <Loading />
    if (!account) return null

    const statusConfig = ACCOUNT_STATUSES[account.status] || { label: account.status, type: 'default' }

    return (
        <div className={styles.viewPage}>
            <PageHead current="Accounts">
                <Head title="Account Details" back="/accounts">
                    <Button style="outline" onClick={() => router.push(`/accounts/${id}`)}>
                        Edit
                    </Button>
                    <Button style="outline" onClick={() => setDeleteModal(true)}>
                        Delete
                    </Button>
                </Head>
            </PageHead>

            <Container>
                {/* Account Details Card */}
                <Card>
                    <h3 className={styles.cardTitle}>Account Details</h3>

                    <div className={styles.row}>
                        <span className={styles.label}>Name</span>
                        <span className={styles.value}>{account.name}</span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Price</span>
                        <span className={styles.value}>{formatPrice(account.price)}</span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Quantity</span>
                        <span className={styles.value}>{account.quantity || 1}</span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Category</span>
                        <span className={styles.value}>{ACCOUNT_CATEGORIES[account.category] || account.category}</span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Status</span>
                        <span className={styles.value}>
                            <Badge type={statusConfig.type}>{statusConfig.label}</Badge>
                        </span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Source</span>
                        <span className={styles.value}>{account.source || '-'}</span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Added At</span>
                        <span className={styles.value}>{moment(account.createdAt).format('DD/MM/YYYY')}</span>
                    </div>

                    <div className={styles.row}>
                        <span className={styles.label}>Last Updated</span>
                        <span className={styles.value}>{moment(account.updatedAt).format('DD/MM/YYYY')}</span>
                    </div>

                    {/* Customer Info for SOLD accounts */}
                    {account.status === 'SOLD' && account.soldTo && (
                        <>
                            <div className={styles.sectionDivider}>
                                <span>Customer Information</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Sold To</span>
                                <span className={styles.value}>{account.soldTo.fullname || 'Unknown'}</span>
                            </div>
                            {account.soldTo.email && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Email</span>
                                    <span className={styles.value}>{account.soldTo.email}</span>
                                </div>
                            )}
                            {account.soldTo.discordId && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Discord ID</span>
                                    <span className={styles.value}>{account.soldTo.discordId}</span>
                                </div>
                            )}
                            {account.soldAt && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Sold At</span>
                                    <span className={styles.value}>{moment(account.soldAt).format('DD/MM/YYYY HH:mm')}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Support Info for SOLD accounts */}
                    {account.status === 'SOLD' && account.soldBy && (
                        <>
                            <div className={styles.sectionDivider}>
                                <span>Support Information</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Delivered By</span>
                                <span className={styles.value}>{account.soldBy.fullname || 'Unknown'}</span>
                            </div>
                            {account.soldBy.email && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Email</span>
                                    <span className={styles.value}>{account.soldBy.email}</span>
                                </div>
                            )}
                            {account.soldBy.discordId && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Discord ID</span>
                                    <span className={styles.value}>{account.soldBy.discordId}</span>
                                </div>
                            )}
                        </>
                    )}

                    {/* Reserved Info for RESERVED accounts */}
                    {account.status === 'RESERVED' && account.reservedBy && (
                        <>
                            <div className={styles.sectionDivider}>
                                <span>Reservation Information</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Reserved By</span>
                                <span className={styles.value}>{account.reservedBy.fullname || 'Unknown'}</span>
                            </div>
                            {account.reservedBy.discordId && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Discord ID</span>
                                    <span className={styles.value}>{account.reservedBy.discordId}</span>
                                </div>
                            )}
                            {account.reservedAt && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Reserved At</span>
                                    <span className={styles.value}>{moment(account.reservedAt).format('DD/MM/YYYY HH:mm')}</span>
                                </div>
                            )}
                            {account.reservationExpiry && (
                                <div className={styles.row}>
                                    <span className={styles.label}>Expires At</span>
                                    <span className={styles.value}>{moment(account.reservationExpiry).format('DD/MM/YYYY HH:mm')}</span>
                                </div>
                            )}
                        </>
                    )}
                </Card>

                {/* Account Data Card */}
                {account.accountData && (
                    <Card>
                        <h3 className={styles.cardTitle}>Account Data</h3>
                        <pre className={styles.jsonContent}>
                            {typeof account.accountData === 'string'
                                ? account.accountData
                                : JSON.stringify(account.accountData, null, 2)}
                        </pre>
                    </Card>
                )}

                {/* Images Card */}
                <Card>
                    <h3 className={styles.cardTitle}>Images ({account.images?.length || 0})</h3>

                    {account.images?.length > 0 ? (
                        <div className={styles.imagesGrid}>
                            {account.images.map((img, idx) => {
                                const imageUrl = img?.file?.url || img?.url
                                return (
                                    <div
                                        key={img.id}
                                        className={styles.imageItem}
                                        onClick={() => openLightbox(idx)}
                                    >
                                        <img src={imageUrl} alt={`Image ${idx + 1}`} />
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className={styles.noImages}>No images available</div>
                    )}
                </Card>
            </Container>

            {/* Lightbox */}
            {lightboxIndex !== null && account.images?.length > 0 && (
                <div className={styles.lightbox} onClick={closeLightbox}>
                    <button className={styles.lightboxClose} onClick={closeLightbox}>&times;</button>
                    {account.images.length > 1 && (
                        <>
                            <button className={`${styles.lightboxNav} ${styles.prev}`} onClick={prevImage}>&#8249;</button>
                            <button className={`${styles.lightboxNav} ${styles.next}`} onClick={nextImage}>&#8250;</button>
                        </>
                    )}
                    <img
                        src={account.images[lightboxIndex]?.file?.url || account.images[lightboxIndex]?.url}
                        alt="Full size"
                        className={styles.lightboxImage}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className={styles.lightboxCounter}>{lightboxIndex + 1} / {account.images.length}</div>
                </div>
            )}

            <DeleteConfirmModal
                show={deleteModal}
                onHide={() => !deleting && setDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Account"
                itemName={account?.name || ''}
                itemType="Account"
                loading={deleting}
            />
        </div>
    )
}

export default ViewAccount
