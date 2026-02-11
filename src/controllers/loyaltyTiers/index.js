import { getData, postData, putData, deleteData } from '../../constant/axiosClon'

export default {
  getAllTiers: async () => {
    try {
      const response = await getData('/loyalty-tiers')
      const data = response?.data || response
      const list = Array.isArray(data) ? data : []
      return {
        success: true,
        data: {
          tiers: list,
          items: list,
          total: list.length,
        },
      }
    } catch (err) {
      console.log(err)
      return { success: false, error: err }
    }
  },

  getTierById: async (id) => {
    try {
      const response = await getData(`/loyalty-tiers/${id}`)
      const payload = response?.data || response
      return { success: true, data: { tier: payload } }
    } catch (err) {
      console.log(err)
      return { success: false, error: err }
    }
  },

  createTier: async (data) => {
    try {
      const response = await postData('/loyalty-tiers', data)
      return { success: true, data: response }
    } catch (err) {
      console.log(err)
      return { success: false, error: err }
    }
  },

  updateTier: async (id, data) => {
    try {
      const response = await putData(`/loyalty-tiers/${id}`, data)
      return { success: true, data: response }
    } catch (err) {
      console.log(err)
      return { success: false, error: err }
    }
  },

  deleteTier: async (id) => {
    try {
      const response = await deleteData(`/loyalty-tiers/${id}`)
      return { success: true, data: response }
    } catch (err) {
      console.log(err)
      return { success: false, error: err }
    }
  },

  recalculateAllTiers: async () => {
    try {
      const response = await postData('/loyalty-tiers/recalculate-all')
      return { success: true, data: response }
    } catch (err) {
      console.log(err)
      return { success: false, error: err }
    }
  },
}
