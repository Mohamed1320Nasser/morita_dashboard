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

const NewService = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [cats, setCats] = useState([])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        const res = await categories.getAllCategories()
        if (res && res.success) {
          const list = res.data?.categories || res.data?.items || res.data?.list || []
          setCats(Array.isArray(list) ? list : [])
        }
      } catch (e) {
        notify('Error loading categories')
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const submit = async (payload) => {
    const errors = []
    if (!(payload.name || '').trim()) errors.push('Name is required')
    if (!(payload.slug || '').trim()) errors.push('Slug is required')
    if (!payload.categoryId) errors.push('Category is required')
    if (errors.length) { notify(errors[0]); return }

    try {
      setLoading(true)
      const res = await services.createService(payload)
      if (res && res.success) {
        notify('Service created successfully', 'success')
        router.push('/services')
      } else {
        notify(res?.error?.message || 'Failed to create service')
      }
    } finally { setLoading(false) }
  }

  if (categoriesLoading) return <Loading />

  return (
    <div className={styles.serviceFormPage}>
      <PageHead current="Services">
        <Head title="Create new Service" back="/services" />
      </PageHead>
      <Container>
        <Card>
          <ServiceForm
            submitting={loading}
            onCancel={() => router.push('/services')}
            onSubmit={submit}
            categories={cats}
          />
        </Card>
      </Container>
    </div>
  )
}

export default NewService


