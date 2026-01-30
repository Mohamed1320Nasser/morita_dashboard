import { getData, postData, patchData, deleteData } from '../../constant/axiosClon'

export default {
    getAllTickets: async (filters = {}) => {
        try {
            const queryParams = new URLSearchParams()

            if (filters.status) queryParams.append('status', filters.status)
            if (filters.ticketType) queryParams.append('ticketType', filters.ticketType)
            if (filters.page) queryParams.append('page', filters.page)
            if (filters.limit) queryParams.append('limit', filters.limit)
            if (filters.search) queryParams.append('search', filters.search)

            const queryString = queryParams.toString()
            const url = `/tickets${queryString ? '?' + queryString : ''}`

            const response = await getData(url)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to fetch tickets' } }
        } catch (err) {
            console.log('[tickets] getAllTickets error:', err)
            return { success: false, error: err }
        }
    },

    getTicketById: async (ticketId) => {
        try {
            const response = await getData(`/tickets/${ticketId}`)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to fetch ticket' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    updateTicketStatus: async (ticketId, status) => {
        try {
            const response = await patchData(`/tickets/${ticketId}/status`, { status })
            if (response && !response.error) {
                return { success: true, data: response.data || response }
            }
            return { success: false, error: response?.error || { message: 'Failed to update status' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    assignTicket: async (ticketId, supportId) => {
        try {
            const response = await patchData(`/tickets/${ticketId}/assign`, { supportId })
            if (response && !response.error) {
                return { success: true, data: response.data || response }
            }
            return { success: false, error: response?.error || { message: 'Failed to assign ticket' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    closeTicket: async (ticketId) => {
        try {
            const response = await patchData(`/tickets/${ticketId}/close`, {})
            if (response && !response.error) {
                return { success: true, data: response.data || response }
            }
            return { success: false, error: response?.error || { message: 'Failed to close ticket' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    getTicketStats: async () => {
        try {
            const response = await getData('/tickets/stats')
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to fetch stats' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    getTicketsByType: async (ticketType) => {
        try {
            const response = await getData(`/tickets?ticketType=${ticketType}`)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to fetch tickets' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    getTicketMetadata: async (ticketId) => {
        try {
            const response = await getData(`/tickets/${ticketId}/metadata`)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: true, data: null } // No metadata is ok
        } catch (err) {
            return { success: false, error: err }
        }
    },
}
