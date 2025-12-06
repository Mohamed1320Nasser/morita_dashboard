import { getData, postData, putData } from '../../constant/axiosClon'

export default {
    // Dashboard Statistics
    getDashboardStats: async () => {
        try {
            const response = await getData('/api/admin/system/dashboard/stats');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getRecentActivity: async () => {
        try {
            const response = await getData('/api/admin/system/dashboard/activity');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getSystemHealth: async () => {
        try {
            const response = await getData('/api/admin/system/health');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // Order Management
    getAllOrders: async (query) => {
        try {
            const response = await getData(`/api/admin/orders${query ? `?${query}` : ''}`);
            // Triple-nested unwrapping for admin endpoints
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            const list = payload?.list || payload?.orders || (Array.isArray(payload) ? payload : [])

            console.log('[getAllOrders] Response:', { response, payload, list });

            return {
                success: true,
                data: {
                    orders: list,
                    items: list,
                    total: payload?.total || list.length,
                    filterCount: payload?.total || list.length,
                    page: payload?.page || 1,
                    limit: payload?.limit || 10,
                    totalPages: payload?.totalPages || Math.ceil((payload?.total || list.length) / (payload?.limit || 10))
                }
            }
        } catch (err) {
            console.log('[getAllOrders] Error:', err)
            return { success: false, error: err }
        }
    },

    getOrderStats: async () => {
        try {
            const response = await getData('/api/admin/orders/stats');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getOrderVolumeStats: async (params = {}) => {
        try {
            // Support both old (days) and new (startDate, endDate) parameters
            let queryString = '';
            if (params.startDate && params.endDate) {
                queryString = `?startDate=${params.startDate}&endDate=${params.endDate}`;
            } else {
                const days = params.days || params || 30;
                queryString = `?days=${days}`;
            }

            const response = await getData(`/api/admin/orders/stats/volume${queryString}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getOrderById: async (orderId) => {
        try {
            const response = await getData(`/api/admin/orders/${orderId}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { order: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateOrderStatus: async (orderId, data) => {
        try {
            const response = await putData(`/api/admin/orders/${orderId}/status`, data);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    cancelOrder: async (orderId, data) => {
        try {
            const response = await putData(`/api/admin/orders/${orderId}/cancel`, data);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    reassignWorker: async (orderId, data) => {
        try {
            const response = await putData(`/api/admin/orders/${orderId}/reassign`, data);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // Transaction Management
    getAllTransactions: async (query) => {
        try {
            const response = await getData(`/api/admin/transactions${query ? `?${query}` : ''}`);
            // Triple-nested unwrapping for admin endpoints
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            const list = payload?.list || payload?.transactions || (Array.isArray(payload) ? payload : [])

            console.log('[getAllTransactions] Response:', { response, payload, list });

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
        } catch (err) {
            console.log('[getAllTransactions] Error:', err)
            return { success: false, error: err }
        }
    },

    getTransactionStats: async () => {
        try {
            const response = await getData('/api/admin/transactions/stats');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // User Management
    getAllUsers: async (query) => {
        try {
            const response = await getData(`/api/admin/users${query ? `?${query}` : ''}`);
            console.log('[getAllUsers] Raw response:', response);

            // Handle double-nested response: response.data.data
            const payload = response?.data?.data || response?.data || response
            console.log('[getAllUsers] Payload:', payload);

            const list = payload?.list || payload?.users || (Array.isArray(payload) ? payload : [])
            console.log('[getAllUsers] List:', list);

            if (Array.isArray(list)) {
                return {
                    success: true,
                    data: {
                        users: list,
                        items: list,
                        total: payload?.total || list.length,
                        filterCount: payload?.total || list.length,
                        page: payload?.page || 1,
                        limit: payload?.limit || 10,
                        totalPages: payload?.totalPages || Math.ceil((payload?.total || list.length) / (payload?.limit || 10))
                    }
                }
            }
            console.error('[getAllUsers] List is not an array:', list);
            return { success: false, error: { message: 'Unexpected users response' } }
        } catch (err) {
            console.error('[getAllUsers] Error:', err)
            return { success: false, error: err }
        }
    },

    getUserStats: async () => {
        try {
            const response = await getData('/api/admin/users/stats');
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getUserById: async (userId) => {
        try {
            const response = await getData(`/api/admin/users/${userId}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { user: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateUserRole: async (userId, role) => {
        try {
            const response = await putData(`/api/admin/users/${userId}/role`, { role });
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // Service Analytics
    getServiceOverview: async (params = {}) => {
        try {
            let queryString = '';
            if (params.startDate && params.endDate) {
                queryString = `?startDate=${params.startDate}&endDate=${params.endDate}`;
            }
            const response = await getData(`/api/admin/services/stats/overview${queryString}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getTopServices: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.period) queryParams.append('period', params.period);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.sortBy) queryParams.append('sortBy', params.sortBy);

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const response = await getData(`/api/admin/services/stats/top-services${queryString}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getServiceDetails: async (serviceId, params = {}) => {
        try {
            let queryString = '';
            if (params.startDate && params.endDate) {
                queryString = `?startDate=${params.startDate}&endDate=${params.endDate}`;
            }
            const response = await getData(`/api/admin/services/stats/service/${serviceId}${queryString}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getServiceRevenueTrend: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.days) queryParams.append('days', params.days);
            if (params.startDate) queryParams.append('startDate', params.startDate);
            if (params.endDate) queryParams.append('endDate', params.endDate);
            if (params.serviceIds) queryParams.append('serviceIds', params.serviceIds);

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const response = await getData(`/api/admin/services/stats/revenue-trend${queryString}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getCategoryStats: async (params = {}) => {
        try {
            let queryString = '';
            if (params.startDate && params.endDate) {
                queryString = `?startDate=${params.startDate}&endDate=${params.endDate}`;
            }
            const response = await getData(`/api/admin/services/stats/categories${queryString}`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // Service Modifiers
    getServiceModifiers: async (serviceId) => {
        try {
            const response = await getData(`/api/admin/services/${serviceId}/modifiers`);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    createServiceModifier: async (serviceId, data) => {
        try {
            const response = await postData(`/api/admin/services/${serviceId}/modifiers`, data);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateServiceModifier: async (serviceId, modifierId, data) => {
        try {
            const response = await putData(`/api/admin/services/${serviceId}/modifiers/${modifierId}`, data);
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    deleteServiceModifier: async (serviceId, modifierId) => {
        try {
            const response = await deleteData(`/api/admin/services/${serviceId}/modifiers/${modifierId}`);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    toggleServiceModifier: async (serviceId, modifierId) => {
        try {
            const response = await putData(`/api/admin/services/${serviceId}/modifiers/${modifierId}/toggle`, {});
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: payload }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
