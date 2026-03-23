import React from 'react'
import { IoSettings, IoServer, IoWallet, IoPeople, IoGlobe, IoTime, IoArrowForward } from 'react-icons/io5'
import Badge from '@/components/atoms/badge'
import { useRouter } from 'next/router'
import styles from './SystemInfo.module.scss'

const SystemInfoCard = () => {
  const router = useRouter()

  const quickLinks = [
    {
      icon: <IoServer />,
      label: 'Services Management',
      description: 'Manage services and pricing',
      path: '/services',
      color: '#3b82f6'
    },
    {
      icon: <IoWallet />,
      label: 'Payment Methods',
      description: 'Configure payment options',
      path: '/payments/methods',
      color: '#10b981'
    },
    {
      icon: <IoPeople />,
      label: 'User Management',
      description: 'Manage users and roles',
      path: '/users',
      color: '#8b5cf6'
    }
  ]

  const systemInfo = [
    {
      label: 'Environment',
      value: <Badge type="info">Development</Badge>,
      icon: <IoGlobe />
    },
    {
      label: 'Default Currency',
      value: 'USD',
      icon: <IoWallet />
    },
    {
      label: 'Timezone',
      value: 'UTC',
      icon: <IoTime />
    }
  ]

  return (
    <div className={styles.systemInfoContainer}>
      <div className={styles.infoGrid}>
        {systemInfo.map((info, index) => (
          <div key={index} className={styles.infoCard}>
            <div className={styles.infoIcon}>{info.icon}</div>
            <div className={styles.infoContent}>
              <div className={styles.infoLabel}>{info.label}</div>
              <div className={styles.infoValue}>{info.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.quickLinksSection}>
        <h4 className={styles.quickLinksTitle}>Quick Links</h4>
        <div className={styles.quickLinksGrid}>
          {quickLinks.map((link, index) => (
            <button
              key={index}
              className={styles.quickLinkCard}
              onClick={() => router.push(link.path)}
              style={{ '--link-color': link.color }}
            >
              <div className={styles.linkIcon} style={{ color: link.color }}>
                {link.icon}
              </div>
              <div className={styles.linkContent}>
                <div className={styles.linkLabel}>{link.label}</div>
                <div className={styles.linkDescription}>{link.description}</div>
              </div>
              <div className={styles.linkArrow}>
                <IoArrowForward />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SystemInfoCard
