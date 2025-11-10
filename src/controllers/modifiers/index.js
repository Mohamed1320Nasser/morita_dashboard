import { getData, postData, patchData, deleteData } from '../../constant/axiosClon'

export default {
    getAllModifiers: async (query) => {
        try {
            const queryString = typeof query === 'string' ? query : new URLSearchParams(query).toString()
            const url = `/api/admin/pricing/modifiers${queryString ? `?${queryString}` : ''}`

            console.log('[modifiersController] Fetching:', url)
            const response = await getData(url)
            console.log('[modifiersController] Raw response:', response)

            let data = response
            if (response?.data) {
                data = response.data
            }

            const list = data?.list || (Array.isArray(data) ? data : [])

            console.log('[modifiersController] Parsed list length:', list.length)

            if (Array.isArray(list)) {
                const queryParams = typeof query === 'string' ? new URLSearchParams(query) : new URLSearchParams(query || {})
                const page = parseInt(queryParams.get('page')) || 1
                const limit = parseInt(queryParams.get('limit')) || 10

                return {
                    success: true,
                    data: {
                        modifiers: list,
                        items: list,
                        total: data?.total || list.length,
                        filterCount: data?.filterCount || data?.total || list.length,
                        page: page,
                        limit: limit,
                        totalPages: Math.ceil((data?.total || list.length) / limit)
                    }
                }
            }

            console.error('[modifiersController] Unexpected response format:', data)
            return { success: false, error: { message: 'Unexpected modifiers response format' } }
        } catch (err) {
            console.error('[modifiersController] Error:', err)
            return { success: false, error: err }
        }
    },

    getModifierById: async (id) => {
        try {
            const response = await getData(`/api/admin/pricing/modifiers/${id}`)
            console.log('[modifiersController] getModifierById response:', response)

            let payload = response
            if (response?.data) {
                payload = response.data
            }
            if (payload?.data) {
                payload = payload.data
            }

            console.log('[modifiersController] Parsed modifier:', payload)
            return { success: true, data: { modifier: payload } }
        } catch (err) {
            console.error('[modifiersController] getModifierById error:', err)
            return { success: false, error: err }
        }
    },

    getModifiersByMethod: async (methodId) => {
        try {
            const queryParams = new URLSearchParams({ pricingMethodId: methodId })
            return await this.getAllModifiers(queryParams.toString())
        } catch (err) {
            console.error('[modifiersController] getModifiersByMethod error:', err)
            return { success: false, error: err }
        }
    },

    createModifier: async (data) => {
        try {
            const response = await postData('/api/admin/pricing/modifiers', data)
            console.log('[modifiersController] createModifier response:', response)
            return { success: true, data: { modifier: response } }
        } catch (err) {
            console.error('[modifiersController] createModifier error:', err)

            let errorMessage = 'Failed to create modifier'
            let validationErrors = []

            if (err?.response?.data) {
                const errorData = err.response.data

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

    updateModifier: async (id, data) => {
        try {
            const response = await patchData(`/api/admin/pricing/modifiers/${id}`, data)
            console.log('[modifiersController] updateModifier response:', response)
            return { success: true, data: { modifier: response } }
        } catch (err) {
            console.error('[modifiersController] updateModifier error:', err)

            let errorMessage = 'Failed to update modifier'
            let validationErrors = []

            if (err?.response?.data) {
                const errorData = err.response.data

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

    deleteModifier: async (id) => {
        try {
            const response = await deleteData(`/api/admin/pricing/modifiers/${id}`)
            return { success: true, data: response }
        } catch (err) {
            console.error('[modifiersController] deleteModifier error:', err)

            let errorMessage = 'Failed to delete modifier'
            if (err?.response?.data) {
                errorMessage = err.response.data.msg || err.response.data.message || errorMessage
            } else if (err?.message) {
                errorMessage = err.message
            }

            return { success: false, error: { message: errorMessage } }
        }
    },
}
