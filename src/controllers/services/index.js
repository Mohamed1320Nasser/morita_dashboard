import { getData, postData, putData, deleteData } from '../../constant/axiosClon'

export default {
    getAllServices: async (query) => {
        try {
            const response = await getData(`/services${query ? `?${query}` : ''}`);
            // Backend returns { list, total, page, limit, totalPages }
            const data = response?.data || response
            const list = data?.list || data?.List || (Array.isArray(data) ? data : [])
            if (Array.isArray(list)) {
                return { 
                    success: true, 
                    data: { 
                        services: list,
                        items: list, 
                        total: data?.total || list.length, 
                        filterCount: data?.total || list.length,
                        page: data?.page || 1, 
                        limit: data?.limit || 10,
                        totalPages: data?.totalPages || Math.ceil((data?.total || list.length) / (data?.limit || 10))
                    } 
                }
            }
            return { success: false, error: { message: 'Unexpected services response' } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    getServiceById: async (id) => {
        try {
            const response = await getData(`/services/${id}`);
            console.log('[getServiceById] response', response);
            // Backend wraps as { msg, status, data, error } and sometimes nests service at data.data
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { service: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    createService: async (data) => {
        try {
            const response = await postData('/services', data);
            console.log('[services.createService] response:', JSON.stringify(response));
            return response;
        } catch (err) {
            console.log('[services.createService] Error:', err)
            return { success: false, error: err }
        }
    },
    updateService: async (id, data) => {
        try {
            const response = await putData(`/services/${id}`, data);
            return { success: true, data: { service: response } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    deleteService: async (id) => {
        try {
            const response = await deleteData(`/services/${id}`);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    getServicesByCategory: async (categoryId) => {
        try {
            const response = await getData(`/services/by-category/${categoryId}`);
            console.log('[getServicesByCategory] Raw response:', JSON.stringify(response));
            // Backend returns { success: true, data: { list: [...], total, page, limit, totalPages } }
            const payload = response?.data || response
            const data = payload?.data || payload
            const services = data?.list || data?.List || (Array.isArray(data) ? data : [])
            console.log('[getServicesByCategory] Extracted services:', services);
            return {
                success: true,
                data: services
            }
        } catch (err) {
            console.error('[getServicesByCategory] Error:', err)
            return { success: false, data: [], error: err }
        }
    },
}
