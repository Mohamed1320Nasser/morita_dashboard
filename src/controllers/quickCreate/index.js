import axiosClon from '../../constant/axiosClon'

export const quickCreate = async (data) => {
  try {
    const response = await axiosClon.post('/quick-create', data)

    // Handle multiple response formats
    const payload = (response?.data?.data) ?? (response?.data) ?? response

    return {
      success: true,
      data: payload,
    }
  } catch (error) {
    console.error('Quick create error:', error)
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create service',
    }
  }
}

export default {
  quickCreate,
}
