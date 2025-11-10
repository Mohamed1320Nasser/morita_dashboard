import React from 'react'
import styles from './methods.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import PricingMethodsList from '@/components/shared/PricingMethodsList'

const PricingMethodsPage = () => {
  return (
    <div className={styles.pricingMethods}>
      <PageHead current="Pricing Methods">
        <Head title="Pricing Methods" />
      </PageHead>

      <Container>
        <Card>
          <PricingMethodsList
            showServiceColumn={true}
            showCreateButton={false}
          />
        </Card>
      </Container>
    </div>
  )
}

export default PricingMethodsPage
