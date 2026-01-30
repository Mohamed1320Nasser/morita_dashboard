import { postData } from '../../constant/axiosClon'

const batchServices = {
  batchCreateServices: async (payload) => {
    try {
      const response = await postData('/batch/services', payload)
      return response
    } catch (error) {
      console.error('Batch create services error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Failed to create services'
        }
      }
    }
  },

  validateBatchServices: async (payload) => {
    try {
      const response = await postData('/batch/services/validate', payload)
      return response
    } catch (error) {
      console.error('Batch validate error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Validation failed'
        }
      }
    }
  },

  batchCreateServicesWithPricing: async (payload) => {
    try {
      const response = await postData('/batch/services-with-pricing', payload)
      return response
    } catch (error) {
      console.error('Batch create services with pricing error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Failed to create services with pricing'
        }
      }
    }
  },

  validateBatchServicesWithPricing: async (payload) => {
    try {
      const response = await postData('/batch/services-with-pricing/validate', payload)
      return response
    } catch (error) {
      console.error('Batch validate services with pricing error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Validation failed'
        }
      }
    }
  }
}

export default batchServices
