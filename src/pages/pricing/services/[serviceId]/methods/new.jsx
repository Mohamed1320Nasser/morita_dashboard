import React, { useState, useEffect } from 'react'
import styles from './pricingMethodForm.module.scss'
import Button from '@/components/atoms/buttons/button'
import { useRouter } from 'next/router'
import pricingController from '@/controllers/pricing'
import servicesController from '@/controllers/services'
import { notify } from '@/config/error'
import PricingMethodForm from '@/components/forms/PricingMethodForm'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Head from '@/components/molecules/head/head'
import Card from '@/components/atoms/cards'
import Loading from '@/components/atoms/loading'
import { toast } from 'react-hot-toast'

const NewPricingMethod = () => {
  const router = useRouter()
  const { serviceId } = router.query
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [service, setService] = useState(null)

  useEffect(() => {
    if (!serviceId) return
    
    const fetchService = async () => {
      try {
        const response = await servicesController.getServiceById(serviceId)
        if (response.success && response.data?.service) {
          setService(response.data.service)
        }
      } catch (error) {
        console.error('Error fetching service:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [serviceId])

  const handleCreatePricingMethod = async (payload) => {
    const errors = []
    if (!payload.name || payload.name.trim().length < 2) {
      errors.push('Please enter a valid name (at least 2 characters)')
    }
    if (!payload.serviceId) {
      errors.push('Service ID is required')
    }
    if (!payload.basePrice || payload.basePrice <= 0) {
      errors.push('Base price must be greater than 0')
    }
    
    if (errors.length) {
      notify(errors[0])
      return
    }

    try {
      setSubmitting(true)
      const response = await pricingController.createPricingMethod(payload)
      
      if (response && response.success) {
        toast.success('Pricing method created successfully!')
        router.push(`/pricing/services/${serviceId}/methods`)
      } else {
        // Display backend validation errors
        const error = response?.error
        if (error?.validationErrors && error.validationErrors.length > 0) {
          // Show all validation errors
          error.validationErrors.forEach(err => {
            notify(`${err.field}: ${err.message}`, 'error')
          })
        } else {
          notify(error?.message || 'Failed to create pricing method')
        }
      }
    } catch (error) {
      console.error('Error creating pricing method:', error)
      notify('Failed to create pricing method')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className={styles.pricingMethodForm}>
      <PageHead current="Pricing">
        <Head 
          title={`Create new Pricing Method${service ? ` for ${service.name}` : ''}`}
          back={`/pricing/services/${serviceId}/methods`}
        />
      </PageHead>
      <Container>
        {service && (
          <Card style={{ marginBottom: '1rem', padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {service.emoji && <span style={{ fontSize: '1.5rem' }}>{service.emoji}</span>}
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                  {service.name}
                </h3>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#666' }}>
                  Creating a new pricing method for this service
                </p>
              </div>
            </div>
          </Card>
        )}
        <Card>
          <PricingMethodForm
            title="Create Pricing Method"
            serviceId={serviceId}
            service={service}
            onCancel={() => router.push(`/pricing/services/${serviceId}/methods`)}
            onSubmit={handleCreatePricingMethod}
            submitting={submitting}
          />
        </Card>
      </Container>
    </div>
  )
}

export default NewPricingMethod

