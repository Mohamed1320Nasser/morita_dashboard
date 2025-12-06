import React from 'react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import styles from './charts.module.scss'

/**
 * Professional Line Chart Component using Recharts
 * @param {Array} data - Array of data points [{label, value}]
 * @param {String} color - Line color (default: #3b82f6)
 * @param {String} height - Chart height (default: 300)
 * @param {Boolean} showArea - Show area fill (default: true)
 * @param {Boolean} showGrid - Show grid lines (default: true)
 * @param {String} dataKey - Key for value in data (default: 'value')
 * @param {String} nameKey - Key for label in data (default: 'label')
 */
const LineChart = ({
  data = [],
  color = '#3b82f6',
  height = 300,
  showArea = true,
  showGrid = true,
  dataKey = 'value',
  nameKey = 'label',
  formatValue = null,
  formatLabel = null
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyChart} style={{ height }}>
        <p>No data available</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipLabel}>{formatLabel ? formatLabel(label) : label}</p>
          <p className={styles.tooltipValue} style={{ color }}>
            {formatValue ? formatValue(payload[0].value) : payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={styles.lineChart} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {showArea ? (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e8" />
            )}
            <XAxis
              dataKey={nameKey}
              tick={{ fill: '#7a7e85', fontSize: 12 }}
              stroke="#e0e4e8"
            />
            <YAxis
              tick={{ fill: '#7a7e85', fontSize: 12 }}
              stroke="#e0e4e8"
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              fill={`url(#gradient-${color})`}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        ) : (
          <RechartsLineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e4e8" />
            )}
            <XAxis
              dataKey={nameKey}
              tick={{ fill: '#7a7e85', fontSize: 12 }}
              stroke="#e0e4e8"
            />
            <YAxis
              tick={{ fill: '#7a7e85', fontSize: 12 }}
              stroke="#e0e4e8"
              tickFormatter={formatValue}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </RechartsLineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart
