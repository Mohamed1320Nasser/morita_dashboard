import { getData, deleteData } from '../constant/axiosClon'
import axios from 'axios'
import { API } from '@/const'
import { getToken } from '@/utils/storage'

const brandingController = {
  getBranding: async () => {
    try {
      const response = await getData('/branding')
      const data = response?.data || response
      if (response && !response.error) {
        return { success: true, data: data || {} }
      }
      return { success: false, error: { message: response?.msg || 'Failed to fetch branding' } }
    } catch (e) {
      return { success: false, error: { message: 'Failed to fetch branding' } }
    }
  },

  uploadBranding: async (key, file) => {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await axios.post(`${API}/branding/${key}`, formData, {
        headers: {
          Authorization: `${getToken()}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      const data = response?.data?.data || response?.data
      if (data) {
        return { success: true, data }
      }
      return { success: false, error: { message: 'Failed to upload image' } }
    } catch (e) {
      return {
        success: false,
        error: { message: e?.response?.data?.msg || e?.response?.data?.message || 'Failed to upload image' },
      }
    }
  },

  removeBranding: async (key) => {
    try {
      const response = await deleteData(`/branding/${key}`)
      if (response && !response.error) {
        return { success: true, data: response?.data || {} }
      }
      return { success: false, error: { message: response?.msg || 'Failed to remove image' } }
    } catch (e) {
      return { success: false, error: { message: 'Failed to remove image' } }
    }
  },
}

export default brandingController
