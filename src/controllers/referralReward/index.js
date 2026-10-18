import { getData, putData, postData } from '../../constant/axiosClon'

const REQUEST_FAILED = 'Could not reach the server. Please try again.'

// getData/putData resolve to `false` on transport failure, and putData resolves
// to the axios error itself on an HTTP error, instead of throwing. Both must be
// treated as failures, or the page shows defaults / "saved" for a failed call.
const failure = (response) => {
    if (response === false || response == null) {
        return { success: false, error: { message: REQUEST_FAILED } }
    }
    if (response instanceof Error || response?.isAxiosError) {
        const body = response.response?.data
        const validation = body?.errors?.[0]?.constraints
        const message =
            (validation && Object.values(validation)[0]) ||
            body?.msg ||
            body?.message ||
            response.message ||
            REQUEST_FAILED
        return { success: false, error: { message } }
    }
    return null
}

const unwrap = (response) => response?.data ?? response

export default {
    getConfig: async () => {
        try {
            const response = await getData('/referral-reward/admin/config')
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: unwrap(response) }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateConfig: async (data) => {
        try {
            const response = await putData('/referral-reward/admin/config', data)
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: unwrap(response) }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    getAllRewards: async (query) => {
        try {
            const response = await getData(`/referral-reward/admin/rewards${query ? `?${query}` : ''}`)
            const failed = failure(response)
            if (failed) return failed
            const data = unwrap(response)
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
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: unwrap(response) }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getOrderRewards: async (query) => {
        try {
            const response = await getData(`/referral-reward/admin/order-rewards${query ? `?${query}` : ''}`)
            const failed = failure(response)
            if (failed) return failed
            const data = unwrap(response)
            return {
                success: true,
                data: {
                    list: data?.list || [],
                    total: data?.total || 0,
                    totals: data?.totals || {},
                }
            }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    cancelOrderReward: async (id, reason) => {
        try {
            const response = await postData(`/referral-reward/admin/order-rewards/${id}/cancel`, { reason })
            const failed = failure(response)
            if (failed) return failed
            if (response?.error === true) {
                return { success: false, error: { message: response?.msg || 'Failed to cancel reward' } }
            }
            return { success: true, data: unwrap(response) }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // A user's personal referral link as stored (does not create one)
    getUserInvite: async (userId) => {
        try {
            const response = await getData(`/referral/admin/invite/${userId}`)
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: unwrap(response) }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // Gets the link through the Discord bot, creating it if the user has none
    createUserInvite: async (userId) => {
        try {
            const response = await postData(`/referral/admin/invite/${userId}`, {})
            const failed = failure(response)
            if (failed) return failed
            if (response?.error === true) {
                return { success: false, error: { message: response?.msg || 'Could not get the referral link' } }
            }
            return { success: true, data: unwrap(response) }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getLeaderboard: async (limit = 10) => {
        try {
            const response = await getData(`/referral-reward/leaderboard?limit=${limit}`)
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: unwrap(response) }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
