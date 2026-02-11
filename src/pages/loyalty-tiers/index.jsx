import React, { useEffect, useState } from 'react'
import styles from './loyaltyTiers.module.scss'
import PageTitle from '@/components/atoms/labels/pageTitle'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Table from '@/components/shared/Table'
import Button from '@/components/atoms/buttons/button'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import loyaltyTiersController from '@/controllers/loyaltyTiers'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import KebabMenu from '@/components/shared/KebabMenu'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import moment from 'moment'

const LoyaltyTiersPage = () => {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true)
  const [items, setItems] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [recalculating, setRecalculating] = useState(false)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await loyaltyTiersController.getAllTiers()
        if (res && res.success) {
          setItems(res.data.items || res.data.tiers || [])
        } else {
          notify(res?.error?.message || 'Failed to load loyalty tiers')
        }
      } catch (e) {
        notify('Error loading loyalty tiers')
      } finally {
        setPageLoading(false)
      }
    }
    fetchAll()
  }, [refreshKey])

  const handleNew = () => router.push('/loyalty-tiers/new')
  const handleEdit = (id) => router.push(`/loyalty-tiers/${id}`)
  const handleDeleteClick = (tier) => setDeleteModal(tier)

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return
    try {
      setDeleting(true)
      const res = await loyaltyTiersController.deleteTier(deleteModal.id)
      if (res && res.success !== false) {
        setItems((prev) => prev.filter((x) => x.id !== deleteModal.id))
        setDeleteModal(null)
        notify('Loyalty tier deleted successfully', 'success')
      } else {
        notify(res?.error?.message || 'Failed to delete loyalty tier')
      }
    } catch {
      notify('Failed to delete loyalty tier')
    } finally {
      setDeleting(false)
    }
  }

  const handleRecalculate = async () => {
    if (!confirm('This will recalculate all user loyalty tiers. Continue?')) return
    try {
      setRecalculating(true)
      const res = await loyaltyTiersController.recalculateAllTiers()
      if (res && res.success !== false) {
        const data = res.data || {}
        notify(
          `Recalculation completed: ${data.totalProcessed || 0} users processed, ${
            data.tiersUpdated || 0
          } tiers updated`,
          'success'
        )
      } else {
        notify(res?.error?.message || 'Failed to recalculate tiers')
      }
    } catch {
      notify('Failed to recalculate tiers')
    } finally {
      setRecalculating(false)
    }
  }

  const handleRefresh = () => setRefreshKey((v) => v + 1)

  if (pageLoading) return <Loading />

  return (
    <div className={styles.loyaltyTiers}>
      <PageHead current="Loyalty Tiers">
        <Head title="Loyalty Tiers" onClick={handleNew}>
          Create new Tier
        </Head>
      </PageHead>

      <Container>
        <Card>
          <div className={styles.actionsRow}>
            <Button onClick={handleRecalculate} disabled={recalculating}>
              {recalculating ? 'Recalculating...' : 'Recalculate All User Tiers'}
            </Button>
          </div>

          <div className={styles.table}>
            <Table
              columns={[
                {
                  key: 'sortOrder',
                  header: '#',
                  className: 'index',
                  width: '48px',
                  render: (tier) => tier.sortOrder,
                },
                {
                  key: 'emoji',
                  header: 'Icon',
                  className: 'icon',
                  render: (tier) => <span style={{ fontSize: 20 }}>{tier.emoji}</span>,
                },
                {
                  key: 'name',
                  header: 'Name',
                  className: 'name',
                  flex: 1,
                  render: (tier) => tier.name,
                },
                {
                  key: 'spending',
                  header: 'Spending Range',
                  className: 'spending',
                  flex: 2,
                  render: (tier) =>
                    tier.maxSpending
                      ? `$${tier.minSpending} - $${tier.maxSpending}`
                      : `$${tier.minSpending}+`,
                },
                {
                  key: 'discount',
                  header: 'Discount',
                  className: 'discount',
                  flex: 1,
                  render: (tier) => (
                    <Badge type={tier.discountPercent > 0 ? 'success' : 'default'}>
                      {tier.discountPercent}%
                    </Badge>
                  ),
                },
                {
                  key: 'discordRole',
                  header: 'Discord Role',
                  className: 'discordRole',
                  flex: 1,
                  render: (tier) =>
                    tier.discordRoleId ? (
                      <Badge type="info">Linked</Badge>
                    ) : (
                      <span style={{ color: '#999', fontSize: '0.9rem' }}>Not linked</span>
                    ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  className: 'status',
                  flex: 1,
                  render: (tier) =>
                    tier.isActive ? <Badge type="success">Active</Badge> : <Badge type="danger">Inactive</Badge>,
                },
                {
                  key: 'createdAt',
                  header: 'Created At',
                  className: 'createdAt',
                  flex: 1,
                  render: (tier) =>
                    tier.createdAt ? moment(tier.createdAt).format('DD/MM/YYYY') : '-',
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  className: 'actions',
                  width: '120px',
                  render: (tier) => (
                    <KebabMenu
                      actions={[
                        { label: 'Edit', onClick: () => handleEdit(tier.id) },
                        { label: 'Delete', onClick: () => handleDeleteClick(tier) },
                      ]}
                    />
                  ),
                },
              ]}
              data={items}
            />
          </div>
        </Card>
      </Container>

      <DeleteConfirmModal
        show={!!deleteModal}
        onHide={() => !deleting && setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Loyalty Tier"
        itemName={deleteModal?.name || ''}
        itemType="Tier"
        loading={deleting}
      />
    </div>
  )
}

export default LoyaltyTiersPage
