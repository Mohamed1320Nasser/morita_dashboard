import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import loyaltyTiersController from '@/controllers/loyaltyTiers'
import { notify } from '@/config/error'
import Loading from '@/components/atoms/loading'
import LoyaltyTierForm from '@/components/forms/LoyaltyTierForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'

const EditLoyaltyTier = () => {
  const router = useRouter()
  const { id } = router.query
  const [initialLoading, setInitialLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [initialTier, setInitialTier] = useState(null)

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setInitialLoading(true)
        const res = await loyaltyTiersController.getTierById(id)
        if (res && res.success) {
          const tier = res?.data?.tier || res?.data || {}
          setInitialTier({
            name: tier?.name || '',
            emoji: tier?.emoji || '',
            minSpending: tier?.minSpending || 0,
            maxSpending: tier?.maxSpending || '',
            discountPercent: tier?.discountPercent || 0,
            discordRoleId: tier?.discordRoleId || '',
            sortOrder: tier?.sortOrder || 0,
            isActive: Boolean(tier?.isActive),
          })
        } else {
          notify(res?.error?.message || 'Failed to load loyalty tier')
          router.push('/loyalty-tiers')
        }
      } finally {
        setInitialLoading(false)
      }
    }
    load()
  }, [id])

  const submit = async (payload) => {
    const errors = []
    if (!(payload.name || '').trim()) errors.push('Name is required')
    if (payload.minSpending < 0) errors.push('Min spending must be 0 or greater')
    if (payload.maxSpending && payload.maxSpending <= payload.minSpending) {
      errors.push('Max spending must be greater than min spending')
    }
    if (payload.discountPercent < 0 || payload.discountPercent > 100) {
      errors.push('Discount percent must be between 0 and 100')
    }
    if (errors.length) {
      notify(errors[0])
      return
    }

    try {
      setSaving(true)
      const res = await loyaltyTiersController.updateTier(id, payload)
      if (res && res.success) {
        notify('Loyalty tier updated successfully', 'success')
        router.push('/loyalty-tiers')
      } else {
        notify(res?.error?.message || 'Failed to update loyalty tier')
      }
    } finally {
      setSaving(false)
    }
  }

  if (initialLoading) return <Loading />

  return (
    <div>
      <PageHead current="Loyalty Tiers">
        <Head title="Edit Loyalty Tier" back="/loyalty-tiers" />
      </PageHead>
      <Container>
        <Card>
          <LoyaltyTierForm
            key={id}
            initial={initialTier || {}}
            submitting={saving}
            onCancel={() => router.push('/loyalty-tiers')}
            onSubmit={submit}
          />
        </Card>
      </Container>
    </div>
  )
}

export default EditLoyaltyTier
