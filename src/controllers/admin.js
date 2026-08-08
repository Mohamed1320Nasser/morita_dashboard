import { getData } from '../constant/axiosClon'

const adminController = {
  getDashboardStats: async () => {
    const response = await getData('/dashboard/stats')
    return response
  },

  getRecentActivity: async () => {
    const response = await getData('/dashboard/activity')
    return response
  },

  getSystemHealth: async () => {
    const response = await getData('/dashboard/health')
    return response
  }
}

export default adminController
