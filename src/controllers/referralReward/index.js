import { getData, putData } from '../../constant/axiosClon'

export default {
    getConfig: async () => {
        try {
            const response = await getData('/referral-reward/admin/config')
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateConfig: async (data) => {
        try {
            const response = await putData('/referral-reward/admin/config', data)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    getAllRewards: async (query) => {
        try {
            const response = await getData(`/referral-reward/admin/rewards${query ? `?${query}` : ''}`)
            const data = response?.data || response
            return {
                success: true,
                data: {
                    list: data?.list || [],
                    total: data?.total || 0,
                    page: data?.page || 1,
                    limit: data?.limit || 10,
                    totalPages: data?.totalPages || 1,
                }
            }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getStats: async () => {
        try {
            const response = await getData('/referral-reward/admin/stats')
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getLeaderboard: async (limit = 10) => {
        try {
            const response = await getData(`/referral-reward/leaderboard?limit=${limit}`)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
