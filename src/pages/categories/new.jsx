import React, { useState } from 'react'
import styles from './categoryForm.module.scss'
import Button from '@/components/atoms/buttons/button'
import { useRouter } from 'next/router'
import categories from '@/controllers/categories'
import { notify } from '@/config/error'
import CategoryForm from '@/components/forms/CategoryForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'

const NewCategory = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleCreateCategory = async (payload) => {
    const errors = []
    if ((payload.name || '').trim().length < 3) errors.push('Please enter a valid name (at least 3 characters)')
    if (errors.length) { notify(errors[0]); return }
    try {
      setSubmitting(true)
      const response = await categories.createCategory(payload)
      if (response && response.success) { notify('Category created successfully!', 'success'); router.push('/categories') }
      else { notify(response?.error?.message || 'Failed to create category') }
    } finally { setSubmitting(false) }
  }

    return (
    <div className={styles.categoryForm}>
      <PageHead current="Categories">
        <Head title="Create new Category" back="/categories" />
      </PageHead>
      <Container>
        <Card>
          <CategoryForm
            onCancel={() => router.push('/categories')}
            onSubmit={handleCreateCategory}
            submitting={submitting}
          />
        </Card>
      </Container>
    </div>
    )
}

export default NewCategory