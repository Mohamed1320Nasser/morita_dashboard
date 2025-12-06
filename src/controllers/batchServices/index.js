import { postData } from '../../constant/axiosClon'

const batchServices = {
  /**
   * Create multiple services in batch
   * @param {Object} payload - { categoryId, services: [] }
   * @returns {Promise} API response
   */
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

  /**
   * Validate batch services without creating
   * @param {Object} payload - { categoryId, services: [] }
   * @returns {Promise} Validation result
   */
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

  /**
   * Create multiple services with pricing methods and modifiers in batch
   * @param {Object} payload - { categoryId, services: [{ name, emoji, description, pricingMethods: [{ name, pricingUnit, basePrice, modifiers: [] }] }] }
   * @returns {Promise} API response
   */
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

  /**
   * Validate batch services with pricing without creating
   * @param {Object} payload - { categoryId, services: [...] }
   * @returns {Promise} Validation result
   */
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
