import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import services from '@/controllers/services'
import { notify } from '@/config/error'
import Loading from '@/components/atoms/loading'
import ServiceModifiers from '@/components/service/ServiceModifiers'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'

const ServiceModifiersPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [serviceName, setServiceName] = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        const res = await services.getServiceById(id)
        if (res && res.success) {
          const s = res?.data?.service?.data ?? res?.data?.service ?? res?.data ?? {}
          setServiceName(s?.name || 'Service')
        } else {
          notify('Failed to load service')
          router.push('/services')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <Loading />

  return (
    <>
      <PageHead current="Services">
        <Head
          title={`Service Modifiers - ${serviceName}`}
          back={`/services/${id}`}
        />
      </PageHead>
      <div style={{
        minHeight: '100vh',
        background: '#f9fafb',
        paddingBottom: '60px',
        width: '100%'
      }}>
        <div style={{
          padding: '24px',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Card style={{ padding: '32px' }}>
            <ServiceModifiers serviceId={id} />
          </Card>
        </div>
      </div>
    </>
  )
}

export default ServiceModifiersPage
