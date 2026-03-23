import React, { useState } from 'react'
import styles from './PayoutConfiguration.module.scss'

const PayoutDistributionChart = ({ config }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null)
  const total = config.workerPercentage + config.supportPercentage + config.systemPercentage

  const getPercentageDisplay = (value) => {
    if (total === 0) return 0
    return ((value / total) * 100).toFixed(1)
  }

  const segments = [
    {
      name: 'Worker',
      value: config.workerPercentage,
      color: '#3b82f6',
      className: 'worker'
    },
    {
      name: 'Support',
      value: config.supportPercentage,
      color: '#8b5cf6',
      className: 'support'
    },
    {
      name: 'System',
      value: config.systemPercentage,
      color: '#10b981',
      className: 'system'
    }
  ]

  const createPieSegments = () => {
    let cumulativePercent = 0

    return segments.map((segment, index) => {
      const segmentPercent = (segment.value / total) * 100
      const startAngle = (cumulativePercent / 100) * 360
      const endAngle = ((cumulativePercent + segmentPercent) / 100) * 360

      cumulativePercent += segmentPercent

      const startRad = (startAngle - 90) * Math.PI / 180
      const endRad = (endAngle - 90) * Math.PI / 180

      const x1 = 50 + 50 * Math.cos(startRad)
      const y1 = 50 + 50 * Math.sin(startRad)
      const x2 = 50 + 50 * Math.cos(endRad)
      const y2 = 50 + 50 * Math.sin(endRad)

      const largeArc = segmentPercent > 50 ? 1 : 0

      const pathData = `
        M 50 50
        L ${x1} ${y1}
        A 50 50 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `

      return (
        <g key={index}>
          <path
            d={pathData}
            fill={segment.color}
            stroke="#ffffff"
            strokeWidth="2"
            style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              opacity: hoveredSegment === null || hoveredSegment === index ? 1 : 0.4,
              transform: hoveredSegment === index ? 'scale(1.05)' : 'scale(1)',
              transformOrigin: '50% 50%'
            }}
            onMouseEnter={() => setHoveredSegment(index)}
            onMouseLeave={() => setHoveredSegment(null)}
          />
        </g>
      )
    })
  }

  if (total === 0) {
    return (
      <div className={styles.chartContainer}>
        <div className={styles.chartWrapper}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle
              cx="50"
              cy="50"
              r="50"
              fill="#f3f4f6"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="#9ca3af"
              fontWeight="600"
            >
              No Data
            </text>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartWrapper}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {createPieSegments()}
          <circle
            cx="50"
            cy="50"
            r="20"
            fill="#ffffff"
          />
          {hoveredSegment !== null ? (
            <>
              <text
                x="50"
                y="46"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="6"
                fill="#6b7280"
                fontWeight="600"
              >
                {segments[hoveredSegment].name}
              </text>
              <text
                x="50"
                y="54"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill={segments[hoveredSegment].color}
                fontWeight="700"
              >
                {segments[hoveredSegment].value}%
              </text>
            </>
          ) : (
            <>
              <text
                x="50"
                y="48"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="10"
                fill="#1f2937"
                fontWeight="700"
              >
                {total.toFixed(0)}%
              </text>
              <text
                x="50"
                y="56"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="4"
                fill="#6b7280"
                fontWeight="500"
              >
                Total
              </text>
            </>
          )}
        </svg>
      </div>

      <div className={styles.legend}>
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`${styles.legendItem} ${hoveredSegment === index ? styles.active : ''}`}
            onMouseEnter={() => setHoveredSegment(index)}
            onMouseLeave={() => setHoveredSegment(null)}
            style={{
              opacity: hoveredSegment === null || hoveredSegment === index ? 1 : 0.5,
              transition: 'all 0.2s ease'
            }}
          >
            <div className={styles.legendLabel}>
              <div className={`${styles.colorDot} ${styles[segment.className]}`} />
              <span>{segment.name}</span>
            </div>
            <div className={styles.legendValue}>
              {segment.value}% ({getPercentageDisplay(segment.value)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PayoutDistributionChart
