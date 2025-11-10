import React, { useState, useEffect } from 'react'
import styles from '../pricingMethodForm.module.scss'
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

const EditPricingMethod = () => {
  const router = useRouter()
  const { serviceId, methodId } = router.query
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [initialData, setInitialData] = useState({})
  const [service, setService] = useState(null)

  useEffect(() => {
    if (!serviceId || !methodId) return
    
    const fetchData = async () => {
      try {
        // Fetch service
        const serviceRes = await servicesController.getServiceById(serviceId)
        if (serviceRes.success && serviceRes.data?.service) {
          setService(serviceRes.data.service)
        }

        const methodRes = await pricingController.getPricingMethodById(methodId)
        console.log('[EditPricingMethod] methodRes:', methodRes)
        
        if (methodRes.success && methodRes.data?.pricingMethod) {
          const methodData = methodRes.data.pricingMethod
          console.log('[EditPricingMethod] Setting initialData:', methodData)
          
          // Map backend response to form initial data
          // Ensure basePrice is properly converted (may be Decimal type from Prisma)
          const basePriceValue = methodData.basePrice !== undefined && methodData.basePrice !== null
            ? (typeof methodData.basePrice === 'string' ? parseFloat(methodData.basePrice) : Number(methodData.basePrice))
            : ''
          
          setInitialData({
            id: methodData.id,
            name: methodData.name || '',
            description: methodData.description || '',
            basePrice: basePriceValue,
            pricingUnit: methodData.pricingUnit || methodData.unit || 'FIXED',
            displayOrder: methodData.displayOrder || 0,
            active: methodData.active ?? true,
            serviceId: methodData.serviceId || serviceId,
          })
          
          console.log('[EditPricingMethod] Initial data set:', {
            ...methodData,
            basePrice: basePriceValue
          })
        } else {
          notify(methodRes.error?.message || 'Failed to fetch pricing method')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        notify('Failed to fetch pricing method')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [serviceId, methodId])

  const handleUpdatePricingMethod = async (payload) => {
    const errors = []
    if (!payload.name || payload.name.trim().length < 2) {
      errors.push('Please enter a valid name (at least 2 characters)')
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
      const response = await pricingController.updatePricingMethod(methodId, payload)
      
      if (response && response.success) {
        toast.success('Pricing method updated successfully!')
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
          notify(error?.message || 'Failed to update pricing method')
        }
      }
    } catch (error) {
      console.error('Error updating pricing method:', error)
      notify('Failed to update pricing method')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className={styles.pricingMethodForm}>
      <PageHead current="Pricing">
        <Head 
          title={`Edit Pricing Method${service ? ` - ${service.name}` : ''}`}
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
                  Editing pricing method: {initialData.name || 'Untitled'}
                </p>
              </div>
            </div>
          </Card>
        )}
        <Card>
          <PricingMethodForm
            title="Edit Pricing Method"
            initial={initialData}
            serviceId={serviceId}
            service={service}
            onCancel={() => router.push(`/pricing/services/${serviceId}/methods`)}
            onSubmit={handleUpdatePricingMethod}
            submitting={submitting}
          />
        </Card>
      </Container>
    </div>
  )
}

export default EditPricingMethod

