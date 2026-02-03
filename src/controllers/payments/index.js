import { getData, postData, putData, deleteData } from '../../constant/axiosClon'

export default {
    // ==================== Payment Options ====================

    getAllPaymentOptions: async () => {
        try {
            const response = await getData('/payment-options')
            const payload = response?.data || response
            return { success: true, data: Array.isArray(payload) ? payload : [] }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getActivePaymentOptions: async () => {
        try {
            const response = await getData('/payment-options/active')
            const payload = response?.data || response
            return { success: true, data: Array.isArray(payload) ? payload : [] }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getPaymentTypes: async () => {
        try {
            const response = await getData('/payment-options/types')
            const payload = response?.data || response
            return { success: true, data: Array.isArray(payload) ? payload : [] }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getPaymentOptionById: async (id) => {
        try {
            const response = await getData(`/payment-options/${id}`)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    createPaymentOption: async (data) => {
        try {
            const response = await postData('/payment-options', data)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    updatePaymentOption: async (id, data) => {
        try {
            const response = await putData(`/payment-options/${id}`, data)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    deletePaymentOption: async (id) => {
        try {
            await deleteData(`/payment-options/${id}`)
            return { success: true }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    reorderPaymentOptions: async (orders) => {
        try {
            const response = await putData('/payment-options/reorder', { orders })
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    // ==================== Discord Config ====================

    getDiscordConfig: async () => {
        try {
            const response = await getData('/payment-options/discord-config')
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    updateDiscordConfig: async (data) => {
        try {
            const response = await putData('/payment-options/discord-config', data)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    publishToDiscord: async () => {
        try {
            const response = await postData('/payment-options/discord-config/publish')
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },
}
