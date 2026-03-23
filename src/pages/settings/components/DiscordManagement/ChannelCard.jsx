import React, { useState } from 'react'
import { IoCloudUpload, IoCheckmarkCircle, IoCloseCircle, IoTime, IoAlert, IoChevronDown, IoChevronUp } from 'react-icons/io5'
import Badge from '@/components/atoms/badge'
import moment from 'moment'
import styles from './DiscordManagement.module.scss'

const ChannelCard = ({
  channel,
  onPublish,
  publishing,
  disabled
}) => {
  const [isExpanded, setIsExpanded] = useState(channel.status === 'needs_update' || channel.status === 'error')

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return <Badge type="success"><IoCheckmarkCircle /> Published</Badge>
      case 'needs_update':
        return <Badge type="warning"><IoAlert /> Needs Update</Badge>
      case 'error':
        return <Badge type="danger"><IoCloseCircle /> Error</Badge>
      case 'never_published':
      default:
        return <Badge type="secondary"><IoTime /> Never Published</Badge>
    }
  }

  const getChannelIcon = (type) => {
    const icons = {
      'PRICING': '💰',
      'TOS': '📜',
      'TICKETS': '🎫',
      'ACCOUNTS': '🛒',
      'PAYMENTS': '💳'
    }
    return icons[type] || '📢'
  }

  const getChannelName = (type) => {
    const names = {
      'PRICING': 'Pricing Channel',
      'TOS': 'Terms of Service',
      'TICKETS': 'Ticket Channels',
      'ACCOUNTS': 'Account Shop',
      'PAYMENTS': 'Payments Channel'
    }
    return names[type] || type
  }

  const getChannelDescription = (type) => {
    const descriptions = {
      'PRICING': 'Services and pricing information',
      'TOS': 'Terms of service with accept button',
      'TICKETS': '5 ticket creation channels',
      'ACCOUNTS': 'Account shop with category dropdowns',
      'PAYMENTS': 'Payment methods with crypto/payment buttons'
    }
    return descriptions[type] || ''
  }

  return (
    <div className={`${styles.channelCard} ${styles[channel.status]}`}>
      <div className={styles.cardHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerLeft}>
          <span className={styles.channelIcon}>{getChannelIcon(channel.channelType)}</span>
          <div className={styles.headerInfo}>
            <h4 className={styles.channelName}>{getChannelName(channel.channelType)}</h4>
            <p className={styles.channelDesc}>{getChannelDescription(channel.channelType)}</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {getStatusBadge(channel.status)}
          <button className={styles.expandButton}>
            {isExpanded ? <IoChevronUp /> : <IoChevronDown />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.cardContent}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Channel ID</span>
              <span className={styles.detailValue}>{channel.channelId || 'Not configured'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Channel Name</span>
              <span className={styles.detailValue}>{channel.channelName || 'N/A'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Messages</span>
              <span className={styles.detailValue}>{channel.messageCount || 0}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Last Published</span>
              <span className={styles.detailValue}>
                {channel.lastPublishedAt
                  ? moment(channel.lastPublishedAt).fromNow()
                  : 'Never'}
              </span>
            </div>
          </div>

          {channel.lastError && (
            <div className={styles.errorBanner}>
              <IoCloseCircle />
              <span>{channel.lastError}</span>
            </div>
          )}

          <div className={styles.cardActions}>
            <button
              className="btn btn-primary"
              onClick={() => onPublish(channel.channelType)}
              disabled={publishing || disabled}
            >
              <IoCloudUpload />
              {publishing ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChannelCard
