import { getData, postData, putData } from '../constant/axiosClon'

const payoutConfigController = {
  getActiveConfig: async () => {
    const response = await getData('/payout-config')
    if (response && !response.error && response.data) {
      return { success: true, data: response.data }
    }
    return { success: false, error: { message: response?.msg || 'Failed to fetch config' } }
  },

  getHistory: async () => {
    const response = await getData('/payout-config/history')
    if (response && !response.error && response.data) {
      return { success: true, data: response.data }
    }
    return { success: false, error: { message: response?.msg || 'Failed to fetch history' } }
  },

  upsertConfig: async (data) => {
    const response = await postData('/payout-config', data)
    if (response && !response.error && response.data) {
      return { success: true, data: response.data }
    }
    return { success: false, error: { message: response?.msg || 'Failed to save config' } }
  },

  toggleActive: async (id) => {
    const response = await putData(`/payout-config/${id}/toggle-active`, {})
    if (response && !response.error && response.data) {
      return { success: true, data: response.data }
    }
    return { success: false, error: { message: response?.msg || 'Failed to toggle active' } }
  }
}

export default payoutConfigController
