import { getData, postData, putData, patchData } from '../../constant/axiosClon'

export default {
    getAllWallets: async (query) => {
        try {
            const response = await getData(`/api/admin/wallets${query ? `?${query}` : ''}`);
            console.log('[getAllWallets] Raw response:', response);

            // Handle double-nested response: response.data.data
            const payload = response?.data?.data || response?.data || response
            console.log('[getAllWallets] Payload:', payload);

            const list = payload?.list || payload?.wallets || (Array.isArray(payload) ? payload : [])
            console.log('[getAllWallets] List:', list);

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
            const response = await getData(`/api/admin/wallets/${id}`);
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
            const response = await getData(`/api/admin/wallets/${walletId}/transactions${query ? `?${query}` : ''}`);
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
            const response = await postData(`/api/admin/wallets/${walletId}/add-balance`, data);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    adjustBalance: async (walletId, data) => {
        try {
            const response = await postData(`/api/admin/wallets/${walletId}/adjust`, data);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    toggleWalletStatus: async (walletId, isActive) => {
        try {
            const response = await putData(`/api/admin/wallets/${walletId}/status`, { isActive });
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getSystemWallet: async () => {
        try {
            const response = await getData('/api/admin/wallets/system');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { systemWallet: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getWalletStats: async () => {
        try {
            const response = await getData('/api/admin/wallets/stats');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { stats: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
