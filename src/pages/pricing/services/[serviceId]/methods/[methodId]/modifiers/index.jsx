import React, { useState, useEffect, useCallback } from 'react'
import styles from './modifiers.module.scss'
import Card from '@/components/atoms/cards'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Loading from '@/components/atoms/loading'
import Table from '@/components/shared/Table'
import Badge from '@/components/atoms/badge'
import Button from '@/components/atoms/buttons/button'
import SearchInput from '@/components/atoms/inputs/searchInput'
import KebabMenu from '@/components/shared/KebabMenu'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import { useRouter } from 'next/router'
import pricingController from '@/controllers/pricing'
import modifiersController from '@/controllers/modifiers'
import servicesController from '@/controllers/services'
import { notify } from '@/config/error'
import { toast } from 'react-hot-toast'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const ModifiersPage = () => {
  const router = useRouter()
  const { serviceId, methodId } = router.query

  const [loading, setLoading] = useState(true)
  const [pricingMethod, setPricingMethod] = useState(null)
  const [service, setService] = useState(null)
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [filterCount, setFilterCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleSearchChange = (event) => {
    setSearch(event)
    setPage(1)
  }

  useEffect(() => {
    if (!serviceId || !methodId) return

    const fetchData = async () => {
      try {
        // Fetch service
        const serviceRes = await servicesController.getServiceById(serviceId)
        if (serviceRes.success && serviceRes.data?.service) {
          setService(serviceRes.data.service)
        }

        // Fetch pricing method
        const methodRes = await pricingController.getPricingMethodById(methodId)
        if (methodRes.success && methodRes.data?.pricingMethod) {
          setPricingMethod(methodRes.data.pricingMethod)
        }

        // Fetch modifiers
        const queryParams = new URLSearchParams({
          methodId: methodId,
          page: String(page),
          limit: String(limit),
          sortBy: 'priority',
          sortOrder: 'asc',
        })

        if (search) {
          queryParams.append('search', search)
        }

        const modifiersRes = await modifiersController.getAllModifiers(queryParams.toString())

        if (modifiersRes.success && modifiersRes.data) {
          const itemsList = modifiersRes.data.items || modifiersRes.data.modifiers || []
          setItems(itemsList)
          setFilterCount(modifiersRes.data.filterCount || modifiersRes.data.total || itemsList.length)
        } else {
          notify(modifiersRes.error?.message || 'Failed to fetch modifiers')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        notify('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [serviceId, methodId, refreshKey, page, limit, search])

  const handleNew = () => {
    router.push(`/pricing/services/${serviceId}/methods/${methodId}/modifiers/new`)
  }

  const handleEdit = (modifier) => {
    router.push(`/pricing/services/${serviceId}/methods/${methodId}/modifiers/${modifier.id}/edit`)
  }

  const handleDeleteClick = (modifier) => {
    setDeleteModal(modifier)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return

    try {
      setDeleting(true)
      const res = await modifiersController.deleteModifier(deleteModal.id)

      if (res.success) {
        toast.success('Modifier deleted successfully')
        setDeleteModal(null)
        setRefreshKey(v => v + 1)
      } else {
        notify(res.error?.message || 'Failed to delete modifier')
      }
    } catch {
      notify('Failed to delete modifier')
    } finally {
      setDeleting(false)
    }
  }

  const handlePaginate = useCallback(
    (e = null) => {
      e.stopPropagation()

      const pageItem = e.target.closest('.MuiPaginationItem-root')
      const isPrev = pageItem?.getAttribute('aria-label') === 'Go to previous page'
      const isNext = pageItem?.getAttribute('aria-label') === 'Go to next page'

      let newPage
      if (isPrev && page > 1) newPage = page - 1
      else if (isNext && page < Math.ceil(filterCount / limit)) newPage = page + 1
      else if (!isPrev && !isNext && !isNaN(+e.target.textContent)) newPage = +e.target.textContent

      if (newPage) setPage(newPage)
    },
    [page, filterCount, limit],
  )

  const formatModifierType = (type) => {
    return type === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'
  }

  const formatModifierValue = (value, type) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : Number(value)
    if (type === 'PERCENTAGE') {
      return `${numValue > 0 ? '+' : ''}${numValue}%`
    }
    return `${numValue > 0 ? '+' : ''}$${Math.abs(numValue).toFixed(2)}`
  }

  const parseCondition = (conditionStr) => {
    if (!conditionStr) return null
    try {
      return JSON.parse(conditionStr)
    } catch {
      return null
    }
  }

  const formatCondition = (conditionStr) => {
    const condition = parseCondition(conditionStr)
    if (!condition) return 'Always Applied'

    if (condition.type === 'price_range') {
      return `Price: $${condition.min} - $${condition.max}`
    }
    if (condition.type === 'custom_field') {
      return `${condition.field} = ${condition.value}`
    }
    if (condition.type === 'quantity_range') {
      return `Quantity: ${condition.min} - ${condition.max}`
    }
    return 'Custom Condition'
  }

  if (loading) return <Loading />

  return (
    <div className={styles.modifiers}>
      <PageHead
        parent="Pricing Methods"
        parentUrl={`/pricing/services/${serviceId}/methods`}
        current={`${pricingMethod?.name || 'Pricing Method'} - Modifiers`}
      >
        <Head
          title={`Pricing Modifiers${pricingMethod ? ` - ${pricingMethod.name}` : ''}`}
          onClick={handleNew}
        >
          Create new Modifier
        </Head>
      </PageHead>

      <Container>
        {/* Context Header */}
        {pricingMethod && service && (
          <Card className={styles.contextHeader}>
            <div className={styles.contextContent}>
              <div className={styles.contextInfo}>
                <h3 className={styles.contextTitle}>
                  {service.emoji && <span style={{ marginRight: '8px' }}>{service.emoji}</span>}
                  {service.name} - {pricingMethod.name}
                </h3>
                <p className={styles.contextSubtitle}>
                  Base Price: ${Number(pricingMethod.basePrice).toFixed(2)} ({formatModifierType(pricingMethod.pricingUnit || 'FIXED')})
                </p>
              </div>
              <div className={styles.contextStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Modifiers</span>
                  <span className={styles.statValue}>{filterCount}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Active</span>
                  <span className={styles.statValue}>
                    {items.filter(item => item.active).length}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-4">
            <SearchInput
              value={search}
              valueChange={handleSearchChange}
              placeHolder="Search by modifier name"
              defaultInput={true}
            />
          </div>

          {items.length === 0 && !search ? (
            <div className={styles.emptyState}>
              <h3>No Modifiers Yet</h3>
              <p>Create your first pricing modifier to add dynamic pricing rules to this pricing method.</p>
              <Button onClick={handleNew} style={{ marginTop: '1rem' }}>
                Create First Modifier
              </Button>
            </div>
          ) : (
            <>
              <div className={styles.table}>
                <Table
                  columns={[
                    {
                      key: 'priority',
                      header: 'Priority',
                      className: 'priority',
                      width: '80px',
                      render: (item) => (
                        <Badge type="default">
                          #{item.priority || 0}
                        </Badge>
                      )
                    },
                    {
                      key: 'name',
                      header: 'Name',
                      className: 'name',
                      flex: 2,
                      render: (item) => item.name
                    },
                    {
                      key: 'type',
                      header: 'Type',
                      className: 'type',
                      flex: 1,
                      render: (item) => (
                        <Badge type={item.modifierType === 'PERCENTAGE' ? 'info' : 'warning'}>
                          {formatModifierType(item.modifierType)}
                        </Badge>
                      )
                    },
                    {
                      key: 'value',
                      header: 'Value',
                      className: 'value',
                      flex: 1,
                      render: (item) => (
                        <strong>{formatModifierValue(item.value, item.modifierType)}</strong>
                      )
                    },
                    {
                      key: 'condition',
                      header: 'Condition',
                      className: 'condition',
                      flex: 2,
                      render: (item) => (
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          {formatCondition(item.condition)}
                        </span>
                      )
                    },
                    {
                      key: 'status',
                      header: 'Status',
                      className: 'status',
                      flex: 1,
                      render: (item) => (
                        item.active ? (
                          <Badge type="success">Active</Badge>
                        ) : (
                          <Badge type="danger">Inactive</Badge>
                        )
                      )
                    },
                    {
                      key: 'createdAt',
                      header: 'Created At',
                      className: 'createdAt',
                      flex: 1,
                      render: (item) => item.createdAt ? moment(item.createdAt).format('DD/MM/YYYY') : '-'
                    },
                    {
                      key: 'actions',
                      header: 'Actions',
                      className: 'actions',
                      width: '88px',
                      render: (item) => (
                        <KebabMenu actions={[
                          { label: 'Edit', onClick: () => handleEdit(item) },
                          { label: 'Delete', onClick: () => handleDeleteClick(item) },
                        ]} />
                      )
                    },
                  ]}
                  data={items}
                />
              </div>

              <div className="tableFooter">
                <div className="limit">
                  <span>View</span>
                  <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>modifiers per page</span>
                </div>
                <Pagination
                  page={page}
                  count={Math.ceil(filterCount / limit)}
                  shape="rounded"
                  onChange={(e, page) => setPage(page)}
                />
              </div>
            </>
          )}
        </Card>
      </Container>

      <DeleteConfirmModal
        show={!!deleteModal}
        onHide={() => !deleting && setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Modifier"
        itemName={deleteModal?.name || ''}
        itemType="Modifier"
        loading={deleting}
      />
    </div>
  )
}

export default ModifiersPage
