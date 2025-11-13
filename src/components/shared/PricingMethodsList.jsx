import React, { useCallback, useEffect, useState } from 'react'
import Table from '@/components/shared/Table'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Badge from '@/components/atoms/badge'
import KebabMenu from '@/components/shared/KebabMenu'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import Pagination from '@mui/material/Pagination'
import pricingController from '@/controllers/pricing'
import servicesController from '@/controllers/services'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'

/**
 * Shared Pricing Methods List Component
 * Can be used in two modes:
 * 1. All Methods Mode (sidebar): Shows all pricing methods from all services
 * 2. Service-Specific Mode: Auto-filters by serviceId, showing only methods for that service
 */
const PricingMethodsList = ({
  serviceId = null, // If provided, filters methods by this service
  showServiceColumn = true, // Show/hide service column
  showCreateButton = true, // Show/hide create button in parent
  onCreateClick = null, // Callback for create button
}) => {
  const router = useRouter()

  const [items, setItems] = useState([])
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [filterServiceId, setFilterServiceId] = useState(serviceId || '')
  const [pricingUnit, setPricingUnit] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(15)
  const [filterCount, setFilterCount] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteModal, setDeleteModal] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [loading, setLoading] = useState(true)

  // Sync filterServiceId when serviceId prop changes
  useEffect(() => {
    if (serviceId) {
      setFilterServiceId(serviceId)
    }
  }, [serviceId])

  const handleSearchChange = (event) => {
    setSearch(event)
    setPage(1)
  }

  const handleServiceChange = (value) => {
    setFilterServiceId(value)
    setPage(1)
  }

  const handlePricingUnitChange = (value) => {
    setPricingUnit(value)
    setPage(1)
  }

  const handleActiveFilterChange = (value) => {
    setActiveFilter(value)
    setPage(1)
  }

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const queryParams = new URLSearchParams()

        if (search) queryParams.append('search', search)
        if (filterServiceId) queryParams.append('serviceId', filterServiceId)
        if (pricingUnit) queryParams.append('pricingUnit', pricingUnit)
        if (activeFilter !== '') queryParams.append('active', activeFilter)
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        queryParams.append('sortBy', 'displayOrder')
        queryParams.append('sortOrder', 'asc')

        const query = queryParams.toString()

        const [methodsRes, servicesRes] = await Promise.all([
          pricingController.getAllPricingMethods(query),
          servicesController.getAllServices()
        ])

        if (methodsRes && methodsRes.success) {
          const itemsList = methodsRes.data.items || methodsRes.data.pricingMethods || []
          setItems(itemsList)
          setFilterCount(methodsRes.data.filterCount || methodsRes.data.total || 0)
        } else {
          notify(methodsRes?.error?.message || 'Failed to load pricing methods')
        }

        if (servicesRes && servicesRes.success) {
          const svcList = servicesRes.data?.services || servicesRes.data?.items || servicesRes.data?.list || []
          setServices(Array.isArray(svcList) ? svcList : [])
        }
      } catch (e) {
        notify('Error loading pricing methods')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [refreshKey, page, limit, search, filterServiceId, pricingUnit, activeFilter])

  const handleEdit = (method) => {
    const svcId = method.service?.id || method.serviceId || serviceId
    router.push(`/pricing/services/${svcId}/methods/${method.id}/edit`)
  }

  const handleManageModifiers = (method) => {
    const svcId = method.service?.id || method.serviceId || serviceId
    router.push(`/pricing/services/${svcId}/methods/${method.id}/modifiers`)
  }

  const handleDeleteClick = (method) => setDeleteModal(method)

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return
    try {
      setDeleting(true)
      const res = await pricingController.deletePricingMethod(deleteModal.id)
      if (res && res.success !== false) {
        setItems(prev => prev.filter(x => x.id !== deleteModal.id))
        setFilterCount(prev => prev - 1)
        setDeleteModal(null)
        notify('Pricing method deleted successfully', 'success')
      } else {
        notify(res?.error?.message || 'Failed to delete pricing method')
      }
    } catch {
      notify('Failed to delete pricing method')
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
    [page, filterCount, limit]
  )

  /**
   * Professional price formatting:
   * - FIXED: Always 2 decimals (e.g., $150.00)
   * - PER_LEVEL: 2 decimals if >= 1, otherwise up to 8 decimals removing trailing zeros (e.g., $0.000054)
   * - Others: 2 decimals (e.g., $25.50/kill)
   */
  const formatPrice = (method) => {
    const price = Number(method.basePrice)

    if (isNaN(price) || price <= 0) return '-'

    // Show price without unit suffix since the unit is already displayed in the Pricing Unit column
    if (method.pricingUnit === 'PER_LEVEL') {
      // For very small per-level prices (< 1), show up to 8 decimals without trailing zeros
      if (price < 1) {
        const formatted = price.toFixed(8).replace(/\.?0+$/, '')
        return `$${formatted}`
      }
      // For larger per-level prices, show 2 decimals
      return `$${price.toFixed(2)}`
    }

    // All units (FIXED, PER_KILL, PER_ITEM, PER_HOUR): 2 decimals, no unit suffix
    return `$${price.toFixed(2)}`
  }

  /**
   * Professional badge colors for each pricing unit
   * Maps to Badge component supported types: success, pending, danger, purple, blue, yellow
   */
  const getPricingUnitBadgeType = (unit) => {
    switch (unit) {
      case 'FIXED': return 'blue'        // Blue - for one-time services
      case 'PER_LEVEL': return 'success'  // Green - for skill-based services
      case 'PER_KILL': return 'yellow'   // Yellow - for boss/combat services
      case 'PER_ITEM': return 'purple'    // Purple - for item-based services
      case 'PER_HOUR': return 'pending'  // Orange/Warning - for time-based services
      default: return 'pending'
    }
  }

  const formatPricingUnit = (unit) => {
    return unit ? unit.replace('_', ' ') : 'N/A'
  }

  // Build columns dynamically based on props
  const buildColumns = () => {
    const columns = [
      {
        key: 'index',
        header: '#',
        className: 'index',
        width: '48px',
        render: (_method, idx) => (page - 1) * limit + idx + 1
      }
    ]

    // Conditionally add service column
    if (showServiceColumn) {
      columns.push({
        key: 'service',
        header: 'Service',
        className: 'service',
        flex: 2,
        render: (method) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 18 }}>{method.service?.emoji || '🎮'}</span>
            <span>{method.service?.name || '-'}</span>
          </div>
        )
      })
    }

    columns.push(
      {
        key: 'name',
        header: 'Method Name',
        className: 'name',
        flex: 2,
        render: (method) => method.name
      },
      {
        key: 'pricingUnit',
        header: 'Pricing Unit',
        className: 'pricingUnit',
        flex: 1,
        render: (method) => (
          <Badge type={getPricingUnitBadgeType(method.pricingUnit)}>
            {formatPricingUnit(method.pricingUnit)}
          </Badge>
        )
      },
      {
        key: 'basePrice',
        header: 'Base Price',
        className: 'basePrice',
        flex: 1,
        render: (method) => formatPrice(method)
      },
      {
        key: 'modifiers',
        header: 'Modifiers',
        className: 'modifiers',
        flex: 1,
        render: (method) => {
          const count = method._count?.modifiers || 0
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {count > 0 ? (
                <Badge
                  type="success"
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleManageModifiers(method)
                  }}
                >
                  {count}
                </Badge>
              ) : (
                <span style={{ color: '#999', fontSize: '0.9rem' }}>0</span>
              )}
            </div>
          )
        }
      },
      {
        key: 'status',
        header: 'Status',
        className: 'status',
        flex: 1,
        render: (method) => (
          method.active ? <Badge type="success">Active</Badge> : <Badge type="danger">Inactive</Badge>
        )
      },
      {
        key: 'displayOrder',
        header: 'Order',
        className: 'displayOrder',
        width: '80px',
        render: (method) => method.displayOrder || 0
      },
      {
        key: 'createdAt',
        header: 'Created At',
        className: 'createdAt',
        flex: 1,
        render: (method) => method.createdAt ? moment(method.createdAt).format('DD/MM/YYYY') : '-'
      },
      {
        key: 'actions',
        header: 'Actions',
        className: 'actions',
        width: '120px',
        render: (method) => (
          <KebabMenu actions={[
            { label: 'Edit', onClick: () => handleEdit(method) },
            { label: 'Manage Modifiers', onClick: () => handleManageModifiers(method) },
            { label: 'Delete', onClick: () => handleDeleteClick(method) },
          ]} />
        )
      }
    )

    return columns
  }

  return (
    <>
      <div className="mb-4">
        <SearchInput
          value={search}
          valueChange={handleSearchChange}
          placeHolder="Search by method name or description"
          defaultInput={true}
        />
      </div>

      {/* Filters - Always show, but lock service filter if serviceId provided */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <select
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #f6f6f6',
            fontSize: '14px',
            minWidth: '150px',
            backgroundColor: serviceId ? '#f8f9fa' : 'white',
            cursor: serviceId ? 'not-allowed' : 'pointer'
          }}
          value={filterServiceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          disabled={!!serviceId}
        >
          <option value="">All Services</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>
              {s.emoji} {s.name}
            </option>
          ))}
        </select>

        <select
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #f6f6f6',
            fontSize: '14px',
            minWidth: '150px'
          }}
          value={pricingUnit}
          onChange={(e) => handlePricingUnitChange(e.target.value)}
        >
          <option value="">All Units</option>
          <option value="FIXED">Fixed</option>
          <option value="PER_LEVEL">Per Level</option>
          <option value="PER_KILL">Per Kill</option>
          <option value="PER_ITEM">Per Item</option>
          <option value="PER_HOUR">Per Hour</option>
        </select>

        <select
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #f6f6f6',
            fontSize: '14px',
            minWidth: '150px'
          }}
          value={activeFilter}
          onChange={(e) => handleActiveFilterChange(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <Table
          columns={buildColumns()}
          data={items}
          loading={loading}
        />
      </div>

      {items.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          <p>No pricing methods found</p>
          {serviceId && onCreateClick && (
            <p style={{ marginTop: '12px' }}>
              <button
                onClick={onCreateClick}
                style={{
                  color: '#007bff',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Create your first pricing method
              </button>
            </p>
          )}
        </div>
      )}

      {items.length > 0 && (
        <div className="tableFooter">
          <div className="limit">
            <span>View</span>
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={6}>6</option>
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <span>methods per page</span>
          </div>
          <Pagination
            page={page}
            count={Math.ceil(filterCount / limit)}
            shape="rounded"
            onClick={handlePaginate}
          />
        </div>
      )}

      <DeleteConfirmModal
        show={!!deleteModal}
        onHide={() => !deleting && setDeleteModal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Pricing Method"
        itemName={deleteModal?.name || ''}
        itemType="Pricing Method"
        loading={deleting}
      />
    </>
  )
}

export default PricingMethodsList
