import React from 'react'
import styles from './pricingMethods.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import PricingMethodsList from '@/components/shared/PricingMethodsList'
import { useRouter } from 'next/router'

const PricingMethodsPage = () => {
  const router = useRouter()
  const { serviceId } = router.query

  const handleCreateNew = () => {
    if (serviceId) {
      router.push(`/pricing/services/${serviceId}/methods/new`)
    }
  }

  return (
    <div className={styles.pricingMethods}>
      <PageHead current="Pricing Methods">
        <Head title="Pricing Methods" onClick={handleCreateNew}>
          Create new Pricing Method
        </Head>
      </PageHead>

      <Container>
        <Card>
          {/* Pass serviceId to auto-filter by this service */}
          <PricingMethodsList
            serviceId={serviceId}
            showServiceColumn={true}
          />
        </Card>
      </Container>
    </div>
  )
}

export default PricingMethodsPage

