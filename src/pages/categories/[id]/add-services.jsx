import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BatchServiceTable from '@/components/batch/BatchServiceTable'
import batchServices from '@/controllers/batchServices'
import categories from '@/controllers/categories'
import { notify } from '@/config/error'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'

const AddBatchServices = () => {
  const router = useRouter()
  const { id: categoryId } = router.query
  const [category, setCategory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categoryId) {
      fetchCategory()
    }
  }, [categoryId])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const res = await categories.getCategoryById(categoryId)
      if (res && res.success) {
        setCategory(res.data.category || res.data)
      } else {
        notify('Category not found', 'error')
        router.push('/categories')
      }
    } catch (error) {
      notify('Error loading category', 'error')
      router.push('/categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (payload) => {
    try {
      const res = await batchServices.batchCreateServices(payload)

      if (res && !res.error) {
        // Global wrapper returns: {data: resultObject, error: false, msg: "ok", status: 200}
        const { created, failed, errors } = res.data

        if (failed === 0) {
          // All services created successfully
          notify(`✅ Successfully created ${created} service${created !== 1 ? 's' : ''}!`, 'success')
          router.push(`/categories/${categoryId}`)
        } else {
          // Partial success
          notify(
            `⚠️ Created ${created} service${created !== 1 ? 's' : ''}, but ${failed} failed. See details below.`,
            'warning'
          )

          // Show individual errors
          errors.forEach(err => {
            notify(`❌ ${err.name}: ${err.error}`, 'error')
          })

          // Ask user what to do
          const goToCategory = window.confirm(
            `${created} service${created !== 1 ? 's' : ''} created successfully.\n\nGo to category page to view them?`
          )
          if (goToCategory) {
            router.push(`/categories/${categoryId}`)
          }
        }

        return { success: true }
      } else {
        notify(res?.msg || 'Failed to create services', 'error')
        return { success: false }
      }
    } catch (error) {
      notify('Error creating services', 'error')
      return { success: false }
    }
  }

  if (loading) return <Loading />
  if (!category) return null

  return (
    <>
      <PageHead current="Categories">
        <Head
          title={`Add Multiple Services`}
          back={`/categories/${categoryId}`}
        />
      </PageHead>

      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        paddingBottom: '60px',
        width: '100%'
      }}>
        <div style={{
          padding: '20px',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Card style={{ padding: '24px' }}>
            <BatchServiceTable
              categoryId={categoryId}
              categoryName={category.name}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/categories/${categoryId}`)}
            />
          </Card>
        </div>
      </div>
    </>
  )
}

export default AddBatchServices
