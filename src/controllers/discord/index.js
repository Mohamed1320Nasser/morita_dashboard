import { getData, postData } from '../../constant/axiosClon'

export default {
    // ============================================
    // DISCORD CHANNELS STATUS & PUBLISHING
    // Routes through main API which proxies to bot API
    // ============================================

    /**
     * Get status of all Discord channels
     * Returns bot connection status, channel states, and last publish info
     */
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

    /**
     * Publish all channels to Discord
     */
    publishAllChannels: async () => {
        try {
            const response = await postData('/discord/channels/publish/all', {})
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    /**
     * Publish pricing/services channel to Discord
     */
    publishPricingChannel: async () => {
        try {
            const response = await postData('/discord/channels/publish/pricing', {})
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    /**
     * Publish TOS channel to Discord
     */
    publishTosChannel: async () => {
        try {
            const response = await postData('/discord/channels/publish/tos', {})
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    /**
     * Publish ticket channels to Discord
     */
    publishTicketChannels: async () => {
        try {
            const response = await postData('/discord/channels/publish/tickets', {})
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
