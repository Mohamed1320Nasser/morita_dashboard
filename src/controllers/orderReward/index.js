import { getData, putData } from '../../constant/axiosClon'

export default {
    getConfig: async () => {
        try {
            const response = await getData('/order-reward/config')
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateConfig: async (data) => {
        try {
            const response = await putData('/order-reward/config', data)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    getAllClaims: async (query) => {
        try {
            const response = await getData(`/order-reward/claims${query ? `?${query}` : ''}`)
            const data = response?.data || response
            return {
                success: true,
                data: {
                    list: data?.list || [],
                    total: data?.total || 0,
                    page: data?.page || 1,
                    limit: data?.limit || 10,
                    totalPages: data?.totalPages || 1,
                }
            }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getStats: async () => {
        try {
            const response = await getData('/order-reward/stats')
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
