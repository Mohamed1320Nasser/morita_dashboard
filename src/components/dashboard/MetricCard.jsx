import React from 'react'
import PropTypes from 'prop-types'
import styles from './MetricCard.module.scss'

/**
 * MetricCard - Reusable KPI metric display card
 *
 * @example
 * <MetricCard
 *   label="Total Revenue"
 *   value="$125,450"
 *   trend={{ value: "+8.2%", direction: "up", comparison: "vs last month" }}
 *   icon="💰"
 *   color="success"
 *   onClick={() => navigate('/financial')}
 * />
 */
const MetricCard = ({
  label,
  value,
  trend = null,
  icon = null,
  color = 'info',
  footer = null,
  loading = false,
  onClick = null,
  className = '',
  size = 'default'
}) => {
  const cardClasses = [
    styles.metricCard,
    styles[`metricCard--${color}`],
    styles[`metricCard--${size}`],
    onClick ? styles['metricCard--clickable'] : '',
    loading ? styles['metricCard--loading'] : '',
    className
  ].filter(Boolean).join(' ')

  const renderTrend = () => {
    if (!trend) return null

    const trendClasses = [
      styles.trend,
      styles[`trend--${trend.direction || 'neutral'}`]
    ].join(' ')

    return (
      <div className={trendClasses}>
        <span className={styles.trendValue}>{trend.value}</span>
        {trend.comparison && (
          <span className={styles.trendComparison}>{trend.comparison}</span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonLabel}></div>
          <div className={styles.skeletonValue}></div>
          <div className={styles.skeletonTrend}></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      {icon && <div className={styles.icon}>{icon}</div>}

      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.value}>{value}</div>
        {renderTrend()}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>

      {onClick && (
        <div className={styles.clickHint}>
          <span>→</span>
        </div>
      )}
    </div>
  )
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  trend: PropTypes.shape({
    value: PropTypes.string,
    direction: PropTypes.oneOf(['up', 'down', 'neutral']),
    comparison: PropTypes.string
  }),
  icon: PropTypes.node,
  color: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'community', 'support', 'operations', 'financial']),
  footer: PropTypes.node,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large'])
}

export default MetricCard
