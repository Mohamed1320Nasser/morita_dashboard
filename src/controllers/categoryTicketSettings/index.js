import { getData, postData, putData, patchData } from '../../constant/axiosClon'

export default {
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

    upsertSettings: async (categoryId, data) => {
        try {
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
