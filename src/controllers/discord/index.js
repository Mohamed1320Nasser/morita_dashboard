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
     * @param {boolean} clearAllMessages - If true, clears ALL messages (not just bot messages) before publishing
     */
    publishAllChannels: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/all', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    /**
     * Publish pricing/services channel to Discord
     * @param {boolean} clearAllMessages - If true, clears ALL messages (not just bot messages) before publishing
     */
    publishPricingChannel: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/pricing', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    /**
     * Publish TOS channel to Discord
     * @param {boolean} clearAllMessages - If true, clears ALL messages (not just bot messages) before publishing
     */
    publishTosChannel: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/tos', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    /**
     * Publish ticket channels to Discord
     * @param {boolean} clearAllMessages - If true, clears ALL messages (not just bot messages) before publishing
     */
    publishTicketChannels: async (clearAllMessages = false) => {
        try {
            const response = await postData('/discord/channels/publish/tickets', { clearAllMessages })
            return { success: response?.success !== false, data: response?.data || response, error: response?.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
