import { getData, postData, putData, deleteData } from '../../constant/axiosClon'

export default {
    // Wallet Management
    getAllWallets: async () => {
        try {
            const response = await getData('/blockchain/wallets')
            const payload = response?.data || response
            return { success: true, data: Array.isArray(payload) ? payload : [] }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    createWallet: async (data) => {
        try {
            const response = await postData('/blockchain/wallets', data)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    updateWallet: async (id, data) => {
        try {
            const response = await putData(`/blockchain/wallets/${id}`, data)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    deleteWallet: async (id) => {
        try {
            const response = await deleteData(`/blockchain/wallets/${id}`)
            return { success: true }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    // Transaction Verification
    verifyTransaction: async (currency, txid) => {
        try {
            const response = await getData(`/blockchain/verify/${currency}/${txid}`)
            const payload = response?.data || response
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err?.response?.data || err }
        }
    },

    // Get supported currencies
    getSupportedCurrencies: async () => {
        try {
            const response = await getData('/blockchain/currencies')
            const payload = response?.data || response
            return { success: true, data: Array.isArray(payload) ? payload : [] }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
