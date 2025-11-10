import React, { useEffect, useState } from 'react'
import styles from './serviceForm.module.scss'
import Button from '@/components/atoms/buttons/button'
import { useRouter } from 'next/router'
import services from '@/controllers/services'
import categories from '@/controllers/categories'
import { notify } from '@/config/error'
import Loading from '@/components/atoms/loading'
import ServiceForm from '@/components/forms/ServiceForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'

const EditService = () => {
  const router = useRouter()
  const { id } = router.query
  const [initialLoading, setInitialLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initialService, setInitialService] = useState(null)
  const [cats, setCats] = useState([])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setInitialLoading(true)
        const [svcRes, catRes] = await Promise.all([
          services.getServiceById(id),
          categories.getAllCategories()
        ])
        console.log('[EditService] svcRes', svcRes)
        console.log('[EditService] catRes', catRes)
        if (svcRes && svcRes.success) {
          const s = svcRes?.data?.service?.data ?? svcRes?.data?.service ?? svcRes?.data ?? {}
          console.log('[EditService] mapped service', s)
          setInitialService({
            name: s?.name || '',
            slug: s?.slug || '',
            emoji: s?.emoji || '',
            description: s?.description || '',
            displayOrder: s?.displayOrder || 0,
            active: Boolean(s?.active),
            categoryId: s?.categoryId ? String(s.categoryId) : '',
          })
        } else {
          notify(svcRes?.error?.message || 'Failed to load service')
          router.push('/services')
        }
        if (catRes && catRes.success) {
          const list = catRes.data?.categories || catRes.data?.items || catRes.data?.list || catRes.data || []
          console.log('[EditService] mapped categories', list)
          setCats(list)
        }
      } finally { setInitialLoading(false) }
    }
    load()
  }, [id])

  const submit = async (payloadFromChild) => {
    const errors = []
    if (!(payloadFromChild.name || '').trim()) errors.push('Name is required')
    if (!(payloadFromChild.slug || '').trim()) errors.push('Slug is required')
    if (!payloadFromChild.categoryId) errors.push('Category is required')
    if (errors.length) { notify(errors[0]); return }

    try {
      setSaving(true)
      const res = await services.updateService(id, payloadFromChild)
      if (res && res.success) {
        notify('Service updated successfully', 'success')
        router.push('/services')
      } else {
        notify(res?.error?.message || 'Failed to update service')
      }
    } finally { setSaving(false) }
  }

  if (initialLoading) return <Loading />

  return (
    <div className={styles.serviceFormPage}>
      <PageHead current="Services">
        <Head title="Edit Service" back="/services" />
      </PageHead>
      <Container>
        <Card>
          <ServiceForm
            key={id}
            initial={initialService || {}}
            submitting={saving}
            onCancel={() => router.push('/services')}
            onSubmit={submit}
            categories={cats}
          />
        </Card>
      </Container>
    </div>
  )
}

export default EditService


