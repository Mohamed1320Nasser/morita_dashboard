import { getData, deleteData, patchData } from '../../constant/axiosClon'
import axios from 'axios'
import { API } from '@/const'
import { getToken } from '@/utils/storage'

export default {
    getAllAccounts: async (query) => {
        try {
            const response = await getData(`/accounts${query ? `?${query}` : ''}`)
            const data = response?.data || response
            const list = data?.list || data?.List || (Array.isArray(data) ? data : [])
            if (Array.isArray(list)) {
                return {
                    success: true,
                    data: {
                        accounts: list,
                        items: list,
                        total: data?.total || list.length,
                        filterCount: data?.filterCount || data?.total || list.length,
                        page: data?.page || 1,
                        limit: data?.limit || 20,
                        totalPages: data?.totalPages || Math.ceil((data?.total || list.length) / (data?.limit || 20))
                    }
                }
            }
            return { success: false, error: { message: 'Unexpected accounts response' } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getAccountById: async (id) => {
        try {
            const response = await getData(`/accounts/${id}`)
            const payload = (response && response.data && response.data.data)
                ? response.data.data
                : (response?.data ?? response)
            return { success: true, data: { account: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getAccountStats: async () => {
        try {
            const response = await getData('/accounts/stats')
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    createAccount: async (formData) => {
        try {
            const response = await axios.post(`${API}/accounts`, formData, {
                headers: {
                    Authorization: `${getToken()}`,
                    'Content-Type': 'multipart/form-data',
                },
            })
            if (response && response.status === 200) {
                return { success: true, data: response.data?.data || response.data }
            }
            return { success: false, error: { message: 'Failed to create account' } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    updateAccount: async (id, formData) => {
        try {
            const response = await axios.patch(`${API}/accounts/${id}`, formData, {
                headers: {
                    Authorization: `${getToken()}`,
                    'Content-Type': 'multipart/form-data',
                },
            })
            if (response && response.status === 200) {
                return { success: true, data: response.data?.data || response.data }
            }
            return { success: false, error: { message: 'Failed to update account' } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    deleteAccount: async (id) => {
        try {
            const response = await deleteData(`/accounts/${id}`)
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
