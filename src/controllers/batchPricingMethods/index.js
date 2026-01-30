import { postData } from '../../constant/axiosClon'

const batchPricingMethods = {
  batchCreatePricingMethods: async (payload) => {
    try {
      const response = await postData('/batch/pricing-methods', payload)
      return response
    } catch (error) {
      console.error('Batch create pricing methods error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Failed to create pricing methods'
        }
      }
    }
  },


  validateBatchPricingMethods: async (payload) => {
    try {
      const response = await postData('/batch/pricing-methods/validate', payload)
      return response
    } catch (error) {
      console.error('Batch validate pricing methods error:', error)
      return {
        success: false,
        error: {
          message: error?.message || 'Validation failed'
        }
      }
    }
  }
}

export default batchPricingMethods
