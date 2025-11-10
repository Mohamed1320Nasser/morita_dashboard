import React, { useCallback, useEffect, useState } from 'react'
import styles from './categories.module.scss'
import PageTitle from '@/components/atoms/labels/pageTitle'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import { MdCategory } from 'react-icons/md'
import Button from '@/components/atoms/buttons/button'
import SearchInput from '@/components/atoms/inputs/searchInput'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import categoriesController from '@/controllers/categories'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import KebabMenu from '@/components/shared/KebabMenu'
import Table from '@/components/shared/Table'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import moment from 'moment'
import Pagination from '@mui/material/Pagination'

const CategoriesPage = () => {
  const router = useRouter()
  const [pageLoading, setPageLoading] = useState(true) // full page loading
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams()
        if (search) queryParams.append('search', search)
        queryParams.append('page', String(page))
        queryParams.append('limit', String(limit))
        const query = queryParams.toString()
        
        const res = await categoriesController.getAllCategories(query)
        if (res && res.success) {
          setItems(res.data.items || res.data.categories || [])
          setFilterCount(res.data.filterCount || res.data.total || 0)
        } else {
          notify(res?.error?.message || 'Failed to load categories')
        }
      } catch (e) {
        notify('Error loading categories')
      } finally {
        setPageLoading(false)
      }
    }
    fetchData()
  }, [refreshKey, page, limit, search])

  const filtered = items

  const handleNew = () => router.push('/categories/new')
  const handleEdit = (id) => router.push(`/categories/${id}`)
  const handleDeleteClick = (cat) => {
    setDeleteModal(cat)
  }
  const handleDeleteConfirm = async () => {
    if (!deleteModal) return
    try {
      setDeleting(true)
      const res = await categoriesController.deleteCategory(deleteModal.id)
      if (res && res.success !== false) {
        setItems(prev => prev.filter(x => x.id !== deleteModal.id))
        setDeleteModal(null)
        notify('Category deleted successfully', 'success')
      } else {
        notify(res?.error?.message || 'Failed to delete category')
      }
    } catch {
      notify('Failed to delete category')
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
      if (isPrev && page > 1) {
        newPage = page - 1
      } else if (isNext && page < Math.ceil(filterCount / limit)) {
        newPage = page + 1
      } else if (!isPrev && !isNext && !isNaN(+e.target.textContent)) {
        newPage = +e.target.textContent
      }

      if (newPage) {
        setPage(newPage)
      }
    },
    [page, filterCount, limit],
  )

  if (pageLoading) return <Loading />

  return (
    <div className={styles.categories}>
      <PageHead current="Categories">
        <Head title="Service Categories" onClick={handleNew}>Create new Category</Head>
      </PageHead>
      <Container>
        <Card>
          <div className="mb-4">
            <SearchInput value={search} valueChange={handleSearchChange} placeHolder="Search by category name" defaultInput={true} />
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead} />
            <Table
            columns={[
              { key: 'index', header: '#', className: 'index', width: '48px', render: (_cat, idx) => (page - 1) * limit + idx + 1 },
              { key: 'icon', header: 'Icon', className: 'icon', render: (cat) => (<span style={{ fontSize: 18 }}>{cat.emoji || <MdCategory />}</span>) },
              { key: 'name', header: 'Name', className: 'name', flex: 2, render: (cat) => cat.name },
              { key: 'status', header: 'Status', className: 'status', flex: 1, render: (cat) => (cat.active ? <Badge type="success">Active</Badge> : <Badge type="danger">Inactive</Badge>) },
              { key: 'createdAt', header: 'Created At', className: 'createdAt', flex: 1, render: (cat) => cat.createdAt ? moment(cat.createdAt).format('DD/MM/YYYY') : '-' },
              { key: 'actions', header: 'Actions', className: 'actions', width: '88px', render: (cat) => (
                <KebabMenu actions={[
                  { label: 'Edit', onClick: () => handleEdit(cat.id) },
                  { label: 'Delete', onClick: () => handleDeleteClick(cat) },
                ]} />
              ) },
            ]}
            data={filtered}
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
            <span>categories per page</span>
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
        title="Delete Category"
        itemName={deleteModal?.name || ''}
        itemType="Category"
        loading={deleting}
      />
    </div>
  )
}

export default CategoriesPage
