/**
 * CSV Export Utility
 * Provides functions to export data to CSV format and download
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers [{key, label}]
 * @returns {string} CSV formatted string
 */
export const arrayToCSV = (data, headers = null) => {
  if (!data || data.length === 0) {
    return ''
  }

  // Extract headers from first object if not provided
  const keys = headers
    ? headers.map((h) => h.key)
    : Object.keys(data[0])

  const headerLabels = headers
    ? headers.map((h) => h.label)
    : keys

  // Create header row
  const headerRow = headerLabels.map((h) => escapeCSVValue(h)).join(',')

  // Create data rows
  const dataRows = data.map((row) => {
    return keys
      .map((key) => {
        let value = row[key]

        // Handle nested objects (e.g., user.username)
        if (key.includes('.')) {
          const parts = key.split('.')
          value = parts.reduce((obj, part) => obj?.[part], row)
        }

        // Handle special types
        if (value instanceof Date) {
          value = value.toISOString()
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value)
        } else if (value === null || value === undefined) {
          value = ''
        }

        return escapeCSVValue(String(value))
      })
      .join(',')
  })

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Escape CSV value (handle quotes and commas)
 * @param {string} value - Value to escape
 * @returns {string} Escaped value
 */
const escapeCSVValue = (value) => {
  if (typeof value !== 'string') {
    value = String(value)
  }

  // If value contains comma, newline, or quote, wrap in quotes
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    // Escape existing quotes by doubling them
    value = value.replace(/"/g, '""')
    return `"${value}"`
  }

  return value
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV formatted string
 * @param {string} filename - Filename for download (without .csv extension)
 */
export const downloadCSV = (csvContent, filename = 'export') => {
  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up
  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV and download
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Filename for download
 * @param {Array} headers - Optional custom headers
 */
export const exportToCSV = (data, filename = 'export', headers = null) => {
  if (!data || data.length === 0) {
    console.warn('No data to export')
    return
  }

  const csvContent = arrayToCSV(data, headers)
  downloadCSV(csvContent, filename)
}

/**
 * Get formatted timestamp for filename
 * @returns {string} Formatted timestamp (YYYYMMDD_HHMMSS)
 */
export const getTimestampFilename = (prefix = 'export') => {
  const now = new Date()
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace('T', '_')
    .split('.')[0]
  return `${prefix}_${timestamp}`
}

/**
 * Common export configurations for different data types
 */
export const ExportConfigs = {
  orders: {
    headers: [
      { key: 'orderNumber', label: 'Order #' },
      { key: 'customer.username', label: 'Customer' },
      { key: 'worker.username', label: 'Worker' },
      { key: 'orderValue', label: 'Value' },
      { key: 'depositAmount', label: 'Deposit' },
      { key: 'currency', label: 'Currency' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created' },
      { key: 'completedAt', label: 'Completed' },
    ],
  },
  transactions: {
    headers: [
      { key: 'id', label: 'Transaction ID' },
      { key: 'type', label: 'Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'currency', label: 'Currency' },
      { key: 'status', label: 'Status' },
      { key: 'wallet.user.username', label: 'User' },
      { key: 'wallet.walletType', label: 'Wallet Type' },
      { key: 'order.orderNumber', label: 'Order #' },
      { key: 'reference', label: 'Reference' },
      { key: 'notes', label: 'Notes' },
      { key: 'createdAt', label: 'Date' },
    ],
  },
  users: {
    headers: [
      { key: 'id', label: 'User ID' },
      { key: 'username', label: 'Username' },
      { key: 'email', label: 'Email' },
      { key: 'fullname', label: 'Full Name' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'discordId', label: 'Discord ID' },
      { key: 'wallet.walletType', label: 'Wallet Type' },
      { key: 'wallet.balance', label: 'Balance' },
      { key: 'createdAt', label: 'Joined' },
    ],
  },
  wallets: {
    headers: [
      { key: 'id', label: 'Wallet ID' },
      { key: 'user.username', label: 'Username' },
      { key: 'user.email', label: 'Email' },
      { key: 'user.discordId', label: 'Discord ID' },
      { key: 'walletType', label: 'Type' },
      { key: 'balance', label: 'Balance' },
      { key: 'pendingBalance', label: 'Pending' },
      { key: 'currency', label: 'Currency' },
      { key: 'isActive', label: 'Status' },
      { key: 'createdAt', label: 'Created' },
    ],
  },
}

export default {
  arrayToCSV,
  downloadCSV,
  exportToCSV,
  getTimestampFilename,
  ExportConfigs,
}
