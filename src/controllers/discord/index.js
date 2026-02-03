import { getData, postData } from '../../constant/axiosClon'

export default {
    getChannelsStatus: async () => {
        try {
            const response = await getData('/discord/channels/status')
            // Response structure: { msg, status, data: { botConnected, botUsername, channels }, error }
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    publishAllChannels: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/all', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    publishPricingChannel: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/pricing', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    publishTosChannel: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/tos', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    publishTicketChannels: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/tickets', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    publishAccountsChannel: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/accounts', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    publishPaymentsChannel: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/payments', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
