import { getData, postData, patchData, deleteData } from '../../constant/axiosClon'

export default {
    getAllSettings: async () => {
        try {
            const response = await getData('/ticket-type-settings/all-with-defaults')
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to fetch settings' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    getSettingsByType: async (ticketType) => {
        try {
            const response = await getData(`/ticket-type-settings/${ticketType}`)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to fetch settings' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    getSettingsByGroup: async (groupKey) => {
        try {
            const response = await getData(`/ticket-type-settings/group/${groupKey}`)
            if (response && response.data) {
                return { success: true, data: response.data }
            }
            return { success: false, error: { message: 'Failed to fetch group settings' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    upsertSettings: async (ticketType, data) => {
        try {
            const payload = { ticketType, ...data }
            const response = await postData('/ticket-type-settings', payload)
            if (response && !response.error) {
                return { success: true, data: response.data || response }
            }
            return { success: false, error: response?.error || { message: 'Failed to save settings' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    updateSettings: async (ticketType, data) => {
        try {
            const response = await patchData(`/ticket-type-settings/${ticketType}`, data)
            if (response && !response.error) {
                return { success: true, data: response.data || response }
            }
            return { success: false, error: response?.error || { message: 'Failed to update settings' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    deleteSettings: async (ticketType) => {
        try {
            const response = await deleteData(`/ticket-type-settings/${ticketType}`)
            if (response && !response.error) {
                return { success: true, data: response }
            }
            return { success: false, error: response?.error || { message: 'Failed to delete settings' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    initializeDefaults: async () => {
        try {
            const response = await postData('/ticket-type-settings/initialize-defaults', {})
            if (response && !response.error) {
                return { success: true, data: response.data || response }
            }
            return { success: false, error: response?.error || { message: 'Failed to initialize defaults' } }
        } catch (err) {
            return { success: false, error: err }
        }
    },

    getCustomFields: async (ticketType) => {
        try {
            const response = await getData(`/ticket-type-settings/${ticketType}`)
            if (response && response.data && response.data.customFields) {
                return { success: true, data: response.data.customFields }
            }
            return { success: true, data: { fields: [] } }
        } catch (err) {
            return { success: false, error: err }
        }
    },
}
