import React from 'react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import styles from './charts.module.scss'

/**
 * Professional Bar Chart Component using Recharts
 * @param {Array} data - Array of data points [{label, value}]
 * @param {String} color - Bar color (default: #3b82f6)
 * @param {String} height - Chart height (default: 300)
 * @param {Boolean} showGrid - Show grid lines (default: true)
 * @param {Boolean} showValues - Show values on bars (default: false)
 * @param {String} dataKey - Key for value in data (default: 'value')
 * @param {String} nameKey - Key for label in data (default: 'label')
 * @param {Array} colors - Array of colors for bars (optional, uses single color if not provided)
 */
const BarChart = ({
  data = [],
  color = '#3b82f6',
  height = 300,
  showGrid = true,
  showValues = false,
  dataKey = 'value',
  nameKey = 'label',
  colors = null,
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
          <p className={styles.tooltipValue} style={{ color: payload[0].fill }}>
            {formatValue ? formatValue(payload[0].value) : payload[0].value}
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = (props) => {
    const { x, y, width, value } = props
    if (!showValues) return null

    return (
      <text
        x={x + width / 2}
        y={y - 5}
        fill="#7a7e85"
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
      >
        {formatValue ? formatValue(value) : value}
      </text>
    )
  }

  return (
    <div className={styles.barChart} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
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
          <Bar
            dataKey={dataKey}
            radius={[8, 8, 0, 0]}
            label={<CustomLabel />}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors ? colors[index % colors.length] : color}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default BarChart
