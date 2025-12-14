import { getData, postData, putData, patchData } from '../../constant/axiosClon'

export default {
    /**
     * Get ticket settings for a category
     * @param {string} categoryId - The category ID
     * @returns {Promise<{success: boolean, data?: object, error?: object}>}
     */
    getSettings: async (categoryId) => {
        try {
            const response = await getData(`/category-ticket-settings/category/${categoryId}`)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            // Return default settings if not found
            return {
                success: true,
                data: {
                    categoryId,
                    welcomeTitle: 'Welcome to Your Ticket',
                    welcomeMessage: 'Hello {customer}!\n\nThank you for opening a ticket. Our support team ({support}) will assist you shortly.\n\n**Service:** {service}\n**Price:** ${price} {currency}\n**Ticket ID:** {ticket_id}\n\nPlease provide any additional details about your request.',
                    autoAssign: false,
                    notifyOnCreate: true,
                    notifyOnClose: true,
                    mentionSupport: true,
                    mentionCustomer: true,
                }
            }
        } catch (err) {
            // Return default settings if API fails
            return {
                success: true,
                data: {
                    categoryId,
                    welcomeTitle: 'Welcome to Your Ticket',
                    welcomeMessage: 'Hello {customer}!\n\nThank you for opening a ticket. Our support team ({support}) will assist you shortly.\n\n**Service:** {service}\n**Price:** ${price} {currency}\n**Ticket ID:** {ticket_id}\n\nPlease provide any additional details about your request.',
                    autoAssign: false,
                    notifyOnCreate: true,
                    notifyOnClose: true,
                    mentionSupport: true,
                    mentionCustomer: true,
                }
            }
        }
    },

    /**
     * Create or update ticket settings for a category (upsert)
     * @param {string} categoryId - The category ID
     * @param {object} data - The settings data
     * @returns {Promise<{success: boolean, data?: object, error?: object}>}
     */
    upsertSettings: async (categoryId, data) => {
        try {
            // Use POST for upsert (create or update)
            const payload = { categoryId, ...data }
            const response = await postData('/category-ticket-settings', payload)
            if (response && !response.error) {
                return { success: true, data: response.data || response }
            }
            return { success: false, error: response?.error || { message: 'Failed to save settings' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    /**
     * Render welcome message preview with variables
     * @param {string} categoryId - The category ID
     * @param {object} variables - The template variables
     * @returns {Promise<{success: boolean, data?: object, error?: object}>}
     */
    previewWelcomeMessage: async (categoryId, variables = {}) => {
        try {
            const response = await postData(`/category-ticket-settings/${categoryId}/preview`, variables)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to generate preview' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },
}
