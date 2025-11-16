import React, { useState, useEffect } from 'react'
import styles from './serviceForm.module.scss'
import { useRouter } from 'next/router'
import services from '@/controllers/services'
import categories from '@/controllers/categories'
import { notify } from '@/config/error'
import ServiceForm from '@/components/forms/ServiceForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import SuccessActionModal from '@/components/shared/SuccessActionModal'

const NewService = () => {
  const router = useRouter()
  const { categoryId } = router.query
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [cats, setCats] = useState([])
  const [successModal, setSuccessModal] = useState(null)
  const [initialCategoryId, setInitialCategoryId] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const res = await categories.getAllCategories()
        if (res && res.success) {
          const list = res.data?.categories || res.data?.items || res.data?.list || []
          setCats(Array.isArray(list) ? list : [])

          // Set initial category from URL param
          if (categoryId && list.length > 0) {
            setInitialCategoryId(categoryId)
          }
        }
      } catch (e) {
        notify('Error loading categories')
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [categoryId])

  const submit = async (payload) => {
    console.log('[NewService.submit] Called with payload:', payload)
    const errors = []
    if (!(payload.name || '').trim()) errors.push('Name is required')
    if (!payload.categoryId) errors.push('Category is required')
    if (errors.length) {
      console.log('[NewService.submit] Validation errors:', errors)
      notify(errors[0])
      return
    }

    try {
      setLoading(true)
      console.log('[NewService.submit] Calling createService API...')
      const res = await services.createService(payload)
      console.log('[NewService.submit] API response:', JSON.stringify(res))
      if (res && !res.error) {
        notify('Service created successfully', 'success')
        const serviceData = res.data
        const serviceId = serviceData?.id
        console.log('[NewService] Service created successfully:', {
          serviceData,
          serviceId,
          allKeys: serviceData ? Object.keys(serviceData) : []
        })

        if (!serviceId) {
          console.error('[NewService] ERROR: Service ID not found in response!', res)
          notify('Service created but ID not found. Redirecting to services list...', 'warning')
          setTimeout(() => router.push('/services'), 2000)
          return
        }

        setSuccessModal({
          id: serviceId,
          name: payload.name,
          categoryId: payload.categoryId
        })
      } else {
        notify(res?.msg || 'Failed to create service', 'error')
      }
    } finally { setLoading(false) }
  }

  if (categoriesLoading) return <Loading />

  return (
    <div className={styles.serviceFormPage}>
      <PageHead current="Services">
        <Head title="Create new Service" back="/services" />
      </PageHead>
      {initialCategoryId && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 16px', padding: '0 24px' }}>
          <div style={{ padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '14px', color: '#1e40af' }}>
            📍 Adding to: <strong>{cats.find(c => c.id === initialCategoryId)?.name}</strong>
          </div>
        </div>
      )}
      <Container>
        <Card>
          <ServiceForm
            submitting={loading}
            onCancel={() => router.push('/services')}
            onSubmit={submit}
            categories={cats}
            initial={initialCategoryId ? { categoryId: initialCategoryId } : {}}
          />
        </Card>
      </Container>

      <SuccessActionModal
        show={!!successModal}
        onHide={() => setSuccessModal(null)}
        itemType="service"
        itemId={successModal?.id}
        itemName={successModal?.name}
        categoryId={successModal?.categoryId}
      />
    </div>
  )
}

export default NewService


