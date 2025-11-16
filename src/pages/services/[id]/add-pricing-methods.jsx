import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import BatchPricingMethodsTable from '@/components/batch/BatchPricingMethodsTable'
import batchPricingMethods from '@/controllers/batchPricingMethods'
import services from '@/controllers/services'
import { notify } from '@/config/error'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'

const AddBatchPricingMethods = () => {
  const router = useRouter()
  const { id } = router.query
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchService()
    }
  }, [id])

  const fetchService = async () => {
    try {
      setLoading(true)
      const res = await services.getServiceById(id)
      if (res && res.success) {
        setService(res.data.service || res.data)
      } else {
        notify('Service not found', 'error')
        router.push('/services')
      }
    } catch (error) {
      notify('Error loading service', 'error')
      router.push('/services')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (payload) => {
    try {
      const res = await batchPricingMethods.batchCreatePricingMethods(payload)

      if (res && !res.error) {
        // Global wrapper returns: {data: resultObject, error: false, msg: "ok", status: 200}
        const { created, failed, errors } = res.data

        if (failed === 0) {
          // All pricing methods created successfully
          notify(`✅ Successfully created ${created} pricing method${created !== 1 ? 's' : ''}!`, 'success')
          router.push(`/services/${id}`)
        } else {
          // Partial success
          notify(
            `⚠️ Created ${created} pricing method${created !== 1 ? 's' : ''}, but ${failed} failed. See details below.`,
            'warning'
          )

          // Show individual errors
          errors.forEach(err => {
            notify(`❌ ${err.name}: ${err.error}`, 'error')
          })

          // Ask user what to do
          const goToService = window.confirm(
            `${created} pricing method${created !== 1 ? 's' : ''} created successfully.\n\nGo to service page to view them?`
          )
          if (goToService) {
            router.push(`/services/${id}`)
          }
        }

        return { success: true }
      } else {
        notify(res?.msg || 'Failed to create pricing methods', 'error')
        return { success: false }
      }
    } catch (error) {
      notify('Error creating pricing methods', 'error')
      return { success: false }
    }
  }

  if (loading) return <Loading />
  if (!service) return null

  return (
    <>
      <PageHead current="Services">
        <Head
          title={`Add Multiple Pricing Methods`}
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
          padding: '20px',
          maxWidth: '1600px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Card style={{ padding: '24px' }}>
            <BatchPricingMethodsTable
              serviceId={id}
              serviceName={service.name}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/services/${id}`)}
            />
          </Card>
        </div>
      </div>
    </>
  )
}

export default AddBatchPricingMethods
