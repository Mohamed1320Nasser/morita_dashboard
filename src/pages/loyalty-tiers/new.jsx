import React, { useState } from 'react'
import { useRouter } from 'next/router'
import loyaltyTiersController from '@/controllers/loyaltyTiers'
import { notify } from '@/config/error'
import LoyaltyTierForm from '@/components/forms/LoyaltyTierForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'

const NewLoyaltyTier = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

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
      setLoading(true)
      const res = await loyaltyTiersController.createTier(payload)
      if (res && !res.error) {
        notify('Loyalty tier created successfully', 'success')
        setTimeout(() => router.push('/loyalty-tiers'), 500)
      } else {
        notify(res?.msg || res?.error?.message || 'Failed to create loyalty tier', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHead current="Loyalty Tiers">
        <Head title="Create new Loyalty Tier" back="/loyalty-tiers" />
      </PageHead>
      <Container>
        <Card>
          <LoyaltyTierForm
            submitting={loading}
            onCancel={() => router.push('/loyalty-tiers')}
            onSubmit={submit}
          />
        </Card>
      </Container>
    </div>
  )
}

export default NewLoyaltyTier
