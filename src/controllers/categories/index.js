import { getData, postData, putData, deleteData } from '../../constant/axiosClon'

export default {
    getAllCategories: async (query) => {
        try {
            const response = await getData(`/categories${query ? `?${query}` : ''}`);
            // Backend returns { list, total, page, limit, totalPages }
            const data = response?.data || response
            const list = data?.list || data?.List || (Array.isArray(data) ? data : [])
            if (Array.isArray(list)) {
                return { 
                    success: true, 
                    data: { 
                        categories: list, 
                        items: list,
                        total: data?.total || list.length, 
                        filterCount: data?.total || list.length,
                        page: data?.page || 1, 
                        limit: data?.limit || 10,
                        totalPages: data?.totalPages || Math.ceil((data?.total || list.length) / (data?.limit || 10))
                    } 
                }
            }
            return { success: false, error: { message: 'Unexpected categories response' } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    getCategoryById: async (id) => {
        try {
            const response = await getData(`/categories/${id}`);
            console.log('[getCategoryById] response', response);
            // Backend wraps as { msg, status, data, error } and sometimes nests category at data.data
            const payload = (response && response.data && response.data.data) ? response.data.data : (response?.data ?? response)
            return { success: true, data: { category: payload } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    createCategory: async (data) => {
        try {
            const response = await postData('/categories', data);
            return { success: true, data: { category: response } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    updateCategory: async (id, data) => {
        try {
            const response = await putData(`/categories/${id}`, data);
            return { success: true, data: { category: response } }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
    deleteCategory: async (id) => {
        try {
            const response = await deleteData(`/categories/${id}`);
            return { success: true, data: response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },
}
