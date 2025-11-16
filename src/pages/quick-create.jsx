import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import QuickCreateWizard from '@/components/wizard/QuickCreateWizard'
import categoriesController from '@/controllers/categories'
import quickCreateController from '@/controllers/quickCreate'
import PageTitle from '@/components/atoms/labels/pageTitle'
import { notify } from '@/config/error'

const QuickCreatePage = () => {
  const router = useRouter()
  const { categoryId, serviceId } = router.query
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [prefilledData, setPrefilledData] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const result = await categoriesController.getAllCategories()
    if (result.success) {
      const loadedCategories = result.data.categories || []
      setCategories(loadedCategories)

      // Fix Bug #5: Set prefilled data after categories load (prevents race condition)
      // Fix Bug #1: Use String() comparison to handle type mismatch
      if (categoryId && loadedCategories.length > 0) {
        const category = loadedCategories.find(c => String(c.id) === String(categoryId))
        if (category) {
          // Fix Bug #2: Correct prefilled data structure
          setPrefilledData({
            category: {
              mode: 'existing',
              existingId: categoryId
            },
            categoryName: category.name // Keep for banner display
          })
        }
      }
    } else {
      notify('Failed to load categories', 'error')
    }
    setLoading(false)
  }

  const handleSubmit = async (payload) => {
    setSubmitting(true)
    const result = await quickCreateController.quickCreate(payload)

    if (result.success) {
      notify('Service created successfully! 🎉', 'success')

      // Redirect to the newly created service
      if (result.data.service?.id) {
        router.push(`/services/${result.data.service.id}`)
      } else {
        router.push('/services')
      }

      return result
    } else {
      notify(result.error || 'Failed to create service', 'error')
      setSubmitting(false)
      return result
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', paddingBottom: '60px' }}>
      <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '20px 24px', marginBottom: '24px' }}>
        <PageTitle title="Quick Create Service" />
        {prefilledData && prefilledData.categoryName && (
          <div style={{ marginTop: '12px', padding: '12px 16px', background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '8px', fontSize: '14px', color: '#1e40af' }}>
            📍 Adding to: <strong>{prefilledData.categoryName}</strong>
          </div>
        )}
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          Create a complete service with category, pricing methods, and modifiers in one streamlined workflow
        </p>
      </div>

      <QuickCreateWizard
        categories={categories}
        onSubmit={handleSubmit}
        submitting={submitting}
        prefilled={prefilledData}
      />
    </div>
  )
}

export default QuickCreatePage
