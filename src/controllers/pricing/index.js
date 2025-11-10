import { getData, postData, patchData, deleteData } from '../../constant/axiosClon'

export default {
    getAllPricingMethods: async (query) => {
        try {
            // query might be a string (from URLSearchParams.toString()) or object
            const queryString = typeof query === 'string' ? query : new URLSearchParams(query).toString()
            // Backend route changed: /pricing/methods (not /api/admin/pricing/methods)
            const url = `/pricing/methods${queryString ? `?${queryString}` : ''}`
            
            console.log('[pricingController] Fetching:', url)
            const response = await getData(url)
            console.log('[pricingController] Raw response:', response)
            
            // Handle different response structures
            let data = response
            if (response?.data) {
                data = response.data
            }
            
            // Backend returns: { list, total, filterCount } (no items, page, limit, totalPages)
            const list = data?.list || (Array.isArray(data) ? data : [])
            
            console.log('[pricingController] Parsed list length:', list.length)
            
            if (Array.isArray(list)) {
                // Parse pagination from query string if available
                const queryParams = typeof query === 'string' ? new URLSearchParams(query) : new URLSearchParams(query || {})
                const page = parseInt(queryParams.get('page')) || 1
                const limit = parseInt(queryParams.get('limit')) || 10
                
                return { 
                    success: true, 
                    data: { 
                        pricingMethods: list,
                        items: list, 
                        total: data?.total || list.length, 
                        filterCount: data?.filterCount || data?.total || list.length,
                        page: page,
                        limit: limit,
                        totalPages: Math.ceil((data?.total || list.length) / limit)
                    } 
                }
            }
            
            console.error('[pricingController] Unexpected response format:', data)
            return { success: false, error: { message: 'Unexpected pricing methods response format' } }
        } catch (err) {
            console.error('[pricingController] Error:', err)
            return { success: false, error: err }
        }
    },
    getPricingMethodById: async (id) => {
        try {
            // Backend route changed: /pricing/methods/:id
            const response = await getData(`/pricing/methods/${id}`)
            console.log('[pricingController] getPricingMethodById response:', response)
            
            // Backend returns method directly via convertResponse, might be wrapped
            let payload = response
            if (response?.data) {
                payload = response.data
            }
            // If nested in data.data, extract it
            if (payload?.data) {
                payload = payload.data
            }
            
            console.log('[pricingController] Parsed pricingMethod:', payload)
            return { success: true, data: { pricingMethod: payload } }
        } catch (err) {
            console.error('[pricingController] getPricingMethodById error:', err)
            return { success: false, error: err }
        }
    },
    createPricingMethod: async (data) => {
        try {
            // Backend route changed: /pricing/methods
            const response = await postData('/pricing/methods', data)
            console.log('[pricingController] createPricingMethod response:', response)
            return { success: true, data: { pricingMethod: response } }
        } catch (err) {
            console.error('[pricingController] createPricingMethod error:', err)
            
            // Parse error response for validation errors
            let errorMessage = 'Failed to create pricing method'
            let validationErrors = []
            
            if (err?.response?.data) {
                const errorData = err.response.data
                
                // Handle routing-controllers validation errors
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    validationErrors = errorData.errors.map(error => {
                        const constraints = error.constraints || {}
                        const field = error.property || 'unknown'
                        const messages = Object.values(constraints)
                        return { field, message: messages[0] || 'Validation error' }
                    })
                    errorMessage = validationErrors.length > 0 
                        ? validationErrors[0].message 
                        : errorData.msg || errorMessage
                } else if (errorData.msg) {
                    errorMessage = errorData.msg
                } else if (errorData.message) {
                    errorMessage = errorData.message
                }
            } else if (err?.message) {
                errorMessage = err.message
            }
            
            return { 
                success: false, 
                error: { 
                    message: errorMessage,
                    validationErrors 
                } 
            }
        }
    },
    updatePricingMethod: async (id, data) => {
        try {
            // Backend route changed: /pricing/methods/:id
            const response = await patchData(`/pricing/methods/${id}`, data)
            console.log('[pricingController] updatePricingMethod response:', response)
            return { success: true, data: { pricingMethod: response } }
        } catch (err) {
            console.error('[pricingController] updatePricingMethod error:', err)
            
            // Parse error response for validation errors
            let errorMessage = 'Failed to update pricing method'
            let validationErrors = []
            
            if (err?.response?.data) {
                const errorData = err.response.data
                
                // Handle routing-controllers validation errors
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    validationErrors = errorData.errors.map(error => {
                        const constraints = error.constraints || {}
                        const field = error.property || 'unknown'
                        const messages = Object.values(constraints)
                        return { field, message: messages[0] || 'Validation error' }
                    })
                    errorMessage = validationErrors.length > 0 
                        ? validationErrors[0].message 
                        : errorData.msg || errorMessage
                } else if (errorData.msg) {
                    errorMessage = errorData.msg
                } else if (errorData.message) {
                    errorMessage = errorData.message
                }
            } else if (err?.message) {
                errorMessage = err.message
            }
            
            return { 
                success: false, 
                error: { 
                    message: errorMessage,
                    validationErrors 
                } 
            }
        }
    },
    deletePricingMethod: async (id) => {
        try {
            // Backend route changed: /pricing/methods/:id
            const response = await deleteData(`/pricing/methods/${id}`)
            return { success: true, data: response }
        } catch (err) {
            console.error('[pricingController] deletePricingMethod error:', err)
            
            let errorMessage = 'Failed to delete pricing method'
            if (err?.response?.data) {
                errorMessage = err.response.data.msg || err.response.data.message || errorMessage
            } else if (err?.message) {
                errorMessage = err.message
            }
            
            return { success: false, error: { message: errorMessage } }
        }
    },
}

