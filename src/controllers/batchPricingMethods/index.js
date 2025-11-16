import { postData } from '../../constant/axiosClon'

const batchPricingMethods = {
  /**
   * Create multiple pricing methods in batch
   * @param {Object} payload - { serviceId, pricingMethods: [] }
   * @returns {Promise} API response
   */
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

  /**
   * Validate batch pricing methods without creating
   * @param {Object} payload - { serviceId, pricingMethods: [] }
   * @returns {Promise} Validation result
   */
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
