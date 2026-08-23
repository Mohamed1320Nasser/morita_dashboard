import { getData, postData, deleteData } from '../constant/axiosClon'

export default {
    list: async (params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString()
            const response = await getData(
                `/worker-feedback${queryString ? `?${queryString}` : ''}`
            )
            // The controller wraps its own { success, data } inside the API
            // envelope, so the payload sits one level deeper than usual.
            const payload = response?.data?.data || response?.data
            if (payload) {
                return { success: true, data: payload }
            }
            return { success: false, error: { message: 'Failed to load worker feedback' } }
        } catch (error) {
            console.error('Error fetching worker feedback:', error)
            return { success: false, error }
        }
    },

    create: async (body) => {
        try {
            const response = await postData('/worker-feedback', body)
            if (response && !response.error) {
                return { success: true, data: response.data?.data || response.data }
            }
            return { success: false, error: response?.error || { message: 'Failed to save' } }
        } catch (error) {
            return { success: false, error }
        }
    },

    remove: async (id) => {
        try {
            const response = await deleteData(`/worker-feedback/${id}`)
            if (response && !response.error) {
                return { success: true }
            }
            return { success: false, error: response?.error || { message: 'Failed to delete' } }
        } catch (error) {
            return { success: false, error }
        }
    },
}
