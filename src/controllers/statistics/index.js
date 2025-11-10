import { getData } from '../../constant/axiosClon'

export default {
    // Backwards-compatible method expected by HomePage
    getStatisticsList: async () => {
        try {
            const response = await getData('/dashboard/stats');
            return response
        } catch (err) {
            console.log(err)
        }
    },
    getDashboardStats: async () => {
        try {
            const response = await getData('/dashboard/stats');
            return response
        } catch (err) {
            console.log(err)
        }
    },
    getRevenueChartData: async () => {
        try {
            const response = await getData('/api/admin/dashboard/revenue-chart');
            return response
        } catch (err) {
            console.log(err)
        }
    },
    getOrderStats: async () => {
        try {
            const response = await getData('/api/admin/dashboard/order-stats');
            return response
        } catch (err) {
            console.log(err)
        }
    },
    getTopServices: async () => {
        try {
            const response = await getData('/dashboard/top-services');
            return response
        } catch (err) {
            console.log(err)
        }
    },
}