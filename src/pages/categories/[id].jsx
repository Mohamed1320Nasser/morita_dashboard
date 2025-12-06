import React, { useEffect, useState } from 'react'
import styles from './categoryForm.module.scss'
import Button from '@/components/atoms/buttons/button'
import { useRouter } from 'next/router'
import categories from '@/controllers/categories'
import { notify } from '@/config/error'
import Loading from '@/components/atoms/loading'
import CategoryForm from '@/components/forms/CategoryForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'

const EditCategory = () => {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [initial, setInitial] = useState(null)

  useEffect(() => {
    if (!id) return
    const fetchCategory = async () => {
      try {
        setLoading(true)
        const res = await categories.getCategoryById(id)
        console.log('[EditCategory] res', res)
        if (res && res.success) {
          // Handle nested response structure like services
          const cat = res?.data?.category?.data ?? res?.data?.category ?? res?.data ?? {}
          console.log('[EditCategory] mapped category', cat)
          setInitial({
            name: cat?.name || '',
            slug: cat?.slug || '',
            description: cat?.description || '',
            emoji: cat?.emoji || '',
            active: Boolean(cat?.active),
            // Include ticket settings from backend
            ticketSettings: cat?.ticketSettings || null,
          })
        } else {
          notify(res?.error?.message || 'Failed to fetch category')
          router.push('/categories')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchCategory()
  }, [id])

  const handleUpdate = async (payload) => {
    const errors = []
    if ((payload.name || '').trim().length < 3) errors.push('Please enter a valid name (at least 3 characters)')
    if (errors.length) { notify(errors[0]); return }
    try {
      setSaving(true)
      const res = await categories.updateCategory(id, payload)
      if (res && res.success) { notify('Category updated successfully!', 'success'); router.push('/categories') }
      else { notify(res?.error?.message || 'Failed to update category') }
    } finally { setSaving(false) }
  }

  if (loading) return <Loading />

  return (
    <div className={styles.categoryForm}>
      <PageHead current="Categories">
        <Head title="Edit Category" back="/categories">
          <Button
            onClick={() => router.push(`/categories/${id}/add-services`)}
            primary
            style={{ marginLeft: 'auto' }}
          >
            📦 Add Multiple Services
          </Button>
        </Head>
      </PageHead>
      <Container>
        <Card>
          <CategoryForm
            key={id}
            initial={initial || {}}
            onCancel={() => router.push('/categories')}
            onSubmit={handleUpdate}
            submitting={saving}
          />
        </Card>
      </Container>
    </div>
  )
}

export default EditCategory