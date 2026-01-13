// Discord Bot API runs on a separate port (3002)
const BOT_API_URL = process.env.NEXT_PUBLIC_BOT_API_URL || 'http://localhost:3002'

export default {
    // ============================================
    // DISCORD CHANNELS STATUS & PUBLISHING
    // ============================================

    /**
     * Get status of all Discord channels
     * Returns bot connection status, channel states, and last publish info
     */
    getChannelsStatus: async () => {
        try {
            const response = await fetch(`${BOT_API_URL}/discord/channels/status`)
            const data = await response.json()
            return { success: true, data: data?.data || data }
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
            const response = await fetch(`${BOT_API_URL}/discord/channels/publish/all`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json()
            return { success: data.success, data: data?.data || data, error: data.error }
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
            const response = await fetch(`${BOT_API_URL}/discord/channels/publish/pricing`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json()
            return { success: data.success, data: data?.data || data, error: data.error }
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
            const response = await fetch(`${BOT_API_URL}/discord/channels/publish/tos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json()
            return { success: data.success, data: data?.data || data, error: data.error }
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
            const response = await fetch(`${BOT_API_URL}/discord/channels/publish/tickets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json()
            return { success: data.success, data: data?.data || data, error: data.error }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
