import React, { useCallback, useEffect, useState } from 'react'
import styles from './services.module.scss'
import PageTitle from '@/components/atoms/labels/pageTitle'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import { LuGamepad2 } from 'react-icons/lu'
import Table from '@/components/shared/Table'
import Button from '@/components/atoms/buttons/button'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import servicesController from '@/controllers/services'
import categoriesController from '@/controllers/categories'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import KebabMenu from '@/components/shared/KebabMenu'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const ServicesPage = () => {
const router = useRouter()
const [pageLoading, setPageLoading] = useState(true) // full page loading

const [items, setItems] = useState([])
const [categories, setCategories] = useState([])
const [search, setSearch] = useState('')
const [categoryId, setCategoryId] = useState('')
const [page, setPage] = useState(1)
const [limit, setLimit] = useState(6)
const [filterCount, setFilterCount] = useState(0)
const [refreshKey, setRefreshKey] = useState(0)
const [deleteModal, setDeleteModal] = useState(null)
const [deleting, setDeleting] = useState(false)

const handleSearchChange = (event) => {
setSearch(event)
setPage(1)
}

const handleCategoryChange = (value) => {
setCategoryId(value)
setPage(1)
}

useEffect(() => {
const fetchAll = async () => {
try {
    const queryParams = new URLSearchParams()
    if (search) queryParams.append('search', search)
    if (categoryId) queryParams.append('categoryId', categoryId)
    queryParams.append('page', String(page))
    queryParams.append('limit', String(limit))
    const query = queryParams.toString()

    const [svcRes, catRes] = await Promise.all([
      servicesController.getAllServices(query),
      categoriesController.getAllCategories(),
    ])

    if (svcRes && svcRes.success) {
      setItems(svcRes.data.items || svcRes.data.services || [])
      setFilterCount(svcRes.data.filterCount || svcRes.data.total || 0)
    } else {
      notify(svcRes?.error?.message || 'Failed to load services')
    }

    if (catRes && catRes.success) {
      const catList = catRes.data?.categories || catRes.data?.items || catRes.data?.list || []
      setCategories(Array.isArray(catList) ? catList : [])
    }
  } catch (e) {
    notify('Error loading services')
  } finally {
    setPageLoading(false)
  }
}
fetchAll()

}, [refreshKey, page, limit, search, categoryId])

const handleNew = () => router.push('/services/new')
const handleEdit = (id) => router.push(`/services/${id}`)
const handleDeleteClick = (svc) => setDeleteModal(svc)

const handleDeleteConfirm = async () => {
if (!deleteModal) return
try {
setDeleting(true)
const res = await servicesController.deleteService(deleteModal.id)
if (res && res.success !== false) {
setItems(prev => prev.filter(x => x.id !== deleteModal.id))
setDeleteModal(null)
notify('Service deleted successfully', 'success')
} else {
notify(res?.error?.message || 'Failed to delete service')
}
} catch {
notify('Failed to delete service')
} finally {
setDeleting(false)
}
}

const handleRefresh = () => setRefreshKey(v => v + 1)

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

if (pageLoading) return <Loading />

return ( <div className={styles.services}> <PageHead current="Services"> <Head title="Services" onClick={handleNew}>Create new Service</Head> </PageHead>

  <Container>
    <Card>
      <div className="mb-4">
        <SearchInput
          value={search}
          valueChange={handleSearchChange}
          placeHolder="Search by service name"
          defaultInput={true}
        />
      </div>

      <div className={styles.table}>
        <div className={styles.tableHead}>
          <div />
          <select
            className={styles.select}
            value={categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.emoji} {c.name}
              </option>
            ))}
          </select>
        </div>

        <Table
          columns={[
            { key: 'index', header: '#', className: 'index', width: '48px', render: (_svc, idx) => (page - 1) * limit + idx + 1 },
            { key: 'icon', header: 'Icon', className: 'icon', render: (svc) => (<span style={{ fontSize: 18 }}>{svc.emoji || <LuGamepad2 />}</span>) },
            { key: 'name', header: 'Name', className: 'name', flex: 2, render: (svc) => svc.name },
            { key: 'category', header: 'Category', className: 'category', render: (svc) => (svc.category?.name || categories.find(c => String(c.id) === String(svc.categoryId))?.name || '-') },
            { key: 'pricing', header: 'Pricing', className: 'pricing', flex: 1, render: (svc) => {
              const count = svc.pricingMethods?.length || 0
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {count > 0 ? (
                    <Badge 
                      type="success" 
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/pricing/services/${svc.id}/methods`)
                      }}
                    >
                      {count} Method{count !== 1 ? 's' : ''}
                    </Badge>
                  ) : (
                    <span style={{ color: '#999', fontSize: '0.9rem' }}>No pricing</span>
                  )}
                </div>
              )
            } },
            { key: 'status', header: 'Status', className: 'status', flex: 1, render: (svc) => (svc.active ? <Badge type="success">Active</Badge> : <Badge type="danger">Inactive</Badge>) },
            { key: 'createdAt', header: 'Created At', className: 'createdAt', flex: 1, render: (svc) => svc.createdAt ? moment(svc.createdAt).format('DD/MM/YYYY') : '-' },
            { key: 'actions', header: 'Actions', className: 'actions', width: '120px', render: (svc) => (
              <KebabMenu actions={[
                { label: 'Edit', onClick: () => handleEdit(svc.id) },
                { label: 'Manage Modifiers', onClick: () => router.push(`/services/${svc.id}/modifiers`) },
                { label: 'Manage Pricing', onClick: () => router.push(`/pricing/services/${svc.id}/methods`) },
                { label: 'Delete', onClick: () => handleDeleteClick(svc) },
              ]} />
            ) },
          ]}
          data={items}
        />
      </div>

      <div className="tableFooter">
        <div className="limit">
          <span>View</span>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
            <option value={6}>6</option>
            <option value={15}>15</option>
            <option value={30}>30</option>
          </select>
          <span>services per page</span>
        </div>
        <Pagination
          page={page}
          count={Math.ceil(filterCount / limit)}
          shape="rounded"
          onClick={handlePaginate}
        />
      </div>
    </Card>
  </Container>

  <DeleteConfirmModal
    show={!!deleteModal}
    onHide={() => !deleting && setDeleteModal(null)}
    onConfirm={handleDeleteConfirm}
    title="Delete Service"
    itemName={deleteModal?.name || ''}
    itemType="Service"
    loading={deleting}
  />
</div>

)
}

export default ServicesPage
