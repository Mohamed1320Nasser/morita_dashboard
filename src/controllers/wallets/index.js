import { getData, postData, putData, patchData } from '../../constant/axiosClon'

const REQUEST_FAILED = 'Could not reach the server. Please try again.'

// getData resolves to `false` on failure and postData/putData resolve to the
// axios error itself on an HTTP error, instead of throwing. Without this the
// page said "Balance adjusted successfully" when the backend refused it.
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

export default {
    getAllWallets: async (query) => {
        try {
            const response = await getData(`/admin/wallets${query ? `?${query}` : ''}`);

            // getData resolves to false on failure; without this the Array.isArray
            // guard below still passes, showing an empty list instead of an error.
            if (response === false) {
                return { success: false, error: { message: 'Could not reach the server. Please try again.' } }
            }

            // Handle double-nested response: response.data.data
            const payload = response?.data?.data || response?.data || response

            const list = payload?.list || payload?.wallets || (Array.isArray(payload) ? payload : [])

            if (Array.isArray(list)) {
                return {
                    success: true,
                    data: {
                        wallets: list,
                        items: list,
                        total: payload?.total || list.length,
                        filterCount: payload?.total || list.length,
                        page: payload?.page || 1,
                        limit: payload?.limit || 10,
                        totalPages: payload?.totalPages || Math.ceil((payload?.total || list.length) / (payload?.limit || 10))
                    }
                }
            }
            console.error('[getAllWallets] List is not an array:', list);
            return { success: false, error: { message: 'Unexpected wallets response' } }
        } catch (err) {
            console.error('[getAllWallets] Error:', err)
            return { success: false, error: err }
        }
    },

    getWalletById: async (id) => {
        try {
            const response = await getData(`/admin/wallets/${id}`);
            const failed = failure(response)
            if (failed) return failed
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { wallet: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getWalletTransactions: async (walletId, query) => {
        try {
            console.log('[getWalletTransactions] Fetching for wallet:', walletId, 'query:', query);
            const response = await getData(`/admin/wallets/${walletId}/transactions${query ? `?${query}` : ''}`);
            console.log('[getWalletTransactions] Raw response:', response);

            // Handle triple-nested response
            const payload = response?.data?.data || response?.data || response;
            console.log('[getWalletTransactions] Payload:', payload);

            const list = payload?.list || payload?.transactions || (Array.isArray(payload) ? payload : []);
            console.log('[getWalletTransactions] List:', list, 'Length:', list?.length);

            if (Array.isArray(list)) {
                return {
                    success: true,
                    data: {
                        transactions: list,
                        items: list,
                        total: payload?.total || list.length,
                        filterCount: payload?.total || list.length,
                        page: payload?.page || 1,
                        limit: payload?.limit || 10,
                        totalPages: payload?.totalPages || Math.ceil((payload?.total || list.length) / (payload?.limit || 10))
                    }
                }
            }
            console.error('[getWalletTransactions] List is not an array:', list);
            return { success: false, error: { message: 'Unexpected transactions response' } }
        } catch (err) {
            console.error('[getWalletTransactions] Error:', err)
            return { success: false, error: err }
        }
    },

    addBalance: async (walletId, data) => {
        try {
            const response = await postData(`/admin/wallets/${walletId}/add-balance`, data);
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    adjustBalance: async (walletId, data) => {
        try {
            const response = await postData(`/admin/wallets/${walletId}/adjust`, data);
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    toggleWalletStatus: async (walletId, isActive) => {
        try {
            const response = await putData(`/admin/wallets/${walletId}/status`, { isActive });
            const failed = failure(response)
            if (failed) return failed
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getSystemWallet: async () => {
        try {
            const response = await getData('/admin/wallets/system');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { systemWallet: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getWalletStats: async () => {
        try {
            const response = await getData('/admin/wallets/stats');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { stats: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
