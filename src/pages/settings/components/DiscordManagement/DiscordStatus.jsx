import React from 'react'
import { IoCheckmarkCircle, IoCloseCircle, IoRefresh, IoCloudUpload } from 'react-icons/io5'
import { FaDiscord } from 'react-icons/fa'
import Badge from '@/components/atoms/badge'
import styles from './DiscordManagement.module.scss'

const DiscordStatus = ({
  status,
  onRefresh,
  onPublishAll,
  refreshing,
  publishing
}) => {
  return (
    <div className={styles.statusContainer}>
      <div className={styles.statusGrid}>
        <div className={styles.statusItem}>
          <div className={styles.statusIcon}>
            <FaDiscord />
          </div>
          <div className={styles.statusContent}>
            <div className={styles.statusLabel}>Bot Status</div>
            <div className={styles.statusValue}>
              {status?.botConnected ? (
                <Badge type="success">
                  <IoCheckmarkCircle /> Connected
                </Badge>
              ) : (
                <Badge type="danger">
                  <IoCloseCircle /> Disconnected
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className={styles.statusItem}>
          <div className={styles.statusContent}>
            <div className={styles.statusLabel}>Bot Username</div>
            <div className={styles.statusValue}>
              {status?.botUsername || 'N/A'}
            </div>
          </div>
        </div>

        <div className={styles.statusActions}>
          <button
            className={`btn btn-secondary ${styles.refreshBtn}`}
            onClick={onRefresh}
            disabled={refreshing}
          >
            <IoRefresh className={refreshing ? styles.spinning : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            className={`btn btn-primary ${styles.publishBtn}`}
            onClick={onPublishAll}
            disabled={publishing || !status?.botConnected}
          >
            <IoCloudUpload />
            {publishing ? 'Publishing...' : 'Publish All'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiscordStatus
