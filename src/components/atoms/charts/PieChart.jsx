import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import styles from './charts.module.scss'

/**
 * Professional Pie Chart Component using Recharts
 * @param {Array} data - Array of data points [{label, value, color}]
 * @param {Number} height - Chart height (default: 300)
 * @param {Boolean} showLegend - Show legend (default: true)
 * @param {Boolean} showLabels - Show labels on pie slices (default: false)
 */
const PieChart = ({
  data = [],
  height = 300,
  showLegend = true,
  showLabels = false
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={styles.emptyChart} style={{ height }}>
        <p>No data available</p>
      </div>
    )
  }

  const COLORS = ['#94a3b8', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

  const renderCustomLabel = (entry) => {
    return entry.value > 0 ? `${entry.value}` : ''
  }

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabels ? renderCustomLabel : false}
            outerRadius={height / 3}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name, props) => [value, props.payload.label]}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e0e4e8',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => entry.payload.label}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PieChart
