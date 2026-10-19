import { getData, postData, deleteData } from '../constant/axiosClon'

const kpiController = {
  // Member Growth KPI
  getMemberGrowth: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/member-growth${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching member growth:', error)
      return { success: false, error: error.message }
    }
  },

  // Member Retention
  getMemberRetention: async (cohortDate) => {
    try {
      const response = await getData(`/kpi/member-retention?cohortDate=${cohortDate}`)
      return response
    } catch (error) {
      console.error('Error fetching member retention:', error)
      return { success: false, error: error.message }
    }
  },

  // Repeat Customer Rate
  getRepeatCustomers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/repeat-customers${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching repeat customers:', error)
      return { success: false, error: error.message }
    }
  },

  // Support Response Time
  getSupportResponseTime: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/support-response-time${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching support response time:', error)
      return { success: false, error: error.message }
    }
  },

  // Ticket-to-Order Conversion Time
  getTicketToOrderConversion: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/ticket-to-order-conversion${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching ticket-to-order conversion:', error)
      return { success: false, error: error.message }
    }
  },

  // Peak Ticket Times
  getPeakTicketTimes: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/peak-ticket-times${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching peak ticket times:', error)
      return { success: false, error: error.message }
    }
  },

  // Support Reply Speed
  getSupportReplySpeed: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/support-reply-speed${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching support reply speed:', error)
      return { success: false, error: error.message }
    }
  },

  // Order Issues
  getOrderIssues: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/order-issues${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching order issues:', error)
      return { success: false, error: error.message }
    }
  },

  // Order Completion Time
  getOrderCompletionTime: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/order-completion-time${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching order completion time:', error)
      return { success: false, error: error.message }
    }
  },

  // Service Request Measurement
  getServiceRequests: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/service-requests${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching service requests:', error)
      return { success: false, error: error.message }
    }
  },

  // Service Request Conversion Rate
  getServiceRequestConversion: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/service-request-conversion${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching service request conversion:', error)
      return { success: false, error: error.message }
    }
  },

  // Worker Performance Metrics
  getWorkerPerformance: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/worker-performance${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching worker performance:', error)
      return { success: false, error: error.message }
    }
  },

  // Worker Issue Tracking
  getWorkerIssues: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/worker-issues${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching worker issues:', error)
      return { success: false, error: error.message }
    }
  },

  // Order Completion Time
  getOrderCompletionTime: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/order-completion-time${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching order completion time:', error)
      return { success: false, error: error.message }
    }
  },

  // Order Lifecycle (time at each stage)
  getOrderLifecycle: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/order-lifecycle${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching order lifecycle:', error)
      return { success: false, error: error.message }
    }
  },

  // Financial Overview
  getFinancialOverview: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/financial-overview${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching financial overview:', error)
      return { success: false, error: error.message }
    }
  },

  // Create Expense
  createExpense: async (expenseData) => {
    try {
      const response = await postData('/expenses', expenseData)
      return response
    } catch (error) {
      console.error('Error creating expense:', error)
      return { success: false, error: error.message }
    }
  },

  // Get Expenses
  getExpenses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/expenses${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return { success: false, error: error.message }
    }
  },

  // Delete Expense
  deleteExpense: async (expenseId) => {
    try {
      const response = await deleteData(`/expenses/${expenseId}`)
      return response
    } catch (error) {
      console.error('Error deleting expense:', error)
      return { success: false, error: error.message }
    }
  },

  // Discord Engagement
  getDiscordEngagement: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/discord-engagement${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching Discord engagement:', error)
      return { success: false, error: error.message }
    }
  },

  // Top Engaged Users
  getTopEngagedUsers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await getData(`/kpi/top-engaged-users${queryString ? `?${queryString}` : ''}`)
      return response
    } catch (error) {
      console.error('Error fetching top engaged users:', error)
      return { success: false, error: error.message }
    }
  },

  // Award Engagement Rank
  awardEngagementRank: async (rankData) => {
    try {
      const response = await postData('/kpi/engagement-rank', rankData)
      return response
    } catch (error) {
      console.error('Error awarding engagement rank:', error)
      return { success: false, error: error.message }
    }
  }
}

export default kpiController
