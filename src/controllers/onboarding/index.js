import { getData, postData, putData, deleteData } from '../../constant/axiosClon'

export default {
    // ============================================
    // TERMS OF SERVICE
    // ============================================

    getActiveTos: async () => {
        try {
            const response = await getData('/onboarding/tos/active')
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getAllTos: async () => {
        try {
            const response = await getData('/onboarding/tos')
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getTosById: async (id) => {
        try {
            const response = await getData(`/onboarding/tos/${id}`)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    createTos: async (data) => {
        try {
            const response = await postData('/onboarding/tos', data)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateTos: async (id, data) => {
        try {
            const response = await putData(`/onboarding/tos/${id}`, data)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getTosStats: async (id) => {
        try {
            const response = await getData(`/onboarding/tos/${id}/stats`)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    publishToDiscord: async (id) => {
        try {
            const response = await postData(`/onboarding/tos/${id}/publish`, {})
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // ============================================
    // QUESTIONS
    // ============================================

    getActiveQuestions: async () => {
        try {
            const response = await getData('/onboarding/questions/active')
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getAllQuestions: async () => {
        try {
            const response = await getData('/onboarding/questions')
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getQuestionById: async (id) => {
        try {
            const response = await getData(`/onboarding/questions/${id}`)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    createQuestion: async (data) => {
        try {
            const response = await postData('/onboarding/questions', data)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    updateQuestion: async (id, data) => {
        try {
            const response = await putData(`/onboarding/questions/${id}`, data)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    deleteQuestion: async (id) => {
        try {
            const response = await deleteData(`/onboarding/questions/${id}`)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    reorderQuestions: async (questionIds) => {
        try {
            const response = await postData('/onboarding/questions/reorder', { questionIds })
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getAnswerStats: async () => {
        try {
            const response = await getData('/onboarding/questions/stats/answers')
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    // ============================================
    // ANSWERS
    // ============================================

    submitAnswers: async (data) => {
        try {
            const response = await postData('/onboarding/answers', data)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getUserAnswers: async (discordId) => {
        try {
            const response = await getData(`/onboarding/answers/user/${discordId}`)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    getAllAnswers: async (page = 1, limit = 50) => {
        try {
            const response = await getData(`/onboarding/answers?page=${page}&limit=${limit}`)
            return { success: true, data: response?.data || response }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    },

    exportAnswers: async () => {
        try {
            // For file downloads, we need to use a different approach
            const token = sessionStorage.getItem('token')
            const API = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'

            const response = await fetch(`${API}/onboarding/answers/export`, {
                method: 'GET',
                headers: {
                    'Authorization': token
                }
            })

            if (!response.ok) {
                throw new Error('Export failed')
            }

            const blob = await response.blob()
            return { success: true, data: blob }
        } catch (err) {
            console.log(err)
            return { success: false, error: err }
        }
    }
}
