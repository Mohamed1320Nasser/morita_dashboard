import React, { useEffect, useState } from 'react'
import styles from './userView.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import TabNavigation from '@/components/userProfile/TabNavigation'
import OverviewTab from '@/components/userProfile/tabs/OverviewTab'
import OrdersTab from '@/components/userProfile/tabs/OrdersTab'
import WalletTab from '@/components/userProfile/tabs/WalletTab'
import ReferralLinkCard from '@/components/userProfile/ReferralLinkCard'
import adminController from '@/controllers/admin'
import { notify } from '@/config/error'
import { useRouter } from 'next/router'
import moment from 'moment'

const UserDetailPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [pageLoading, setPageLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!id) return

    const fetchUserProfile = async () => {
      try {
        const res = await adminController.getUserProfile(id)
        if (res && res.success && res.data) {
          setProfileData(res.data)
        } else {
          notify(res?.error?.message || 'Failed to load user profile')
        }
      } catch (e) {
        notify('Error loading user profile')
      } finally {
        setPageLoading(false)
      }
    }

    fetchUserProfile()
  }, [id])

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  const getRoleBadge = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Badge type="danger">Admin</Badge>
      case 'support':
        return <Badge type="warning">Support</Badge>
      case 'worker':
        return <Badge type="info">Worker</Badge>
      case 'customer':
        return <Badge type="success">Customer</Badge>
      default:
        return <Badge>{role || '-'}</Badge>
    }
  }

  if (pageLoading) return <Loading />
  if (!profileData || !profileData.user) return null

  const { user, financial, orders } = profileData
  const displayName = user.discordDisplayName || user.fullname || user.username || 'Unknown User'

  // Calculate total orders
  const totalOrders = (orders.asCustomer?.total || 0) + (orders.asWorker?.total || 0)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'orders', label: 'Orders', icon: '📦', count: totalOrders },
    { id: 'wallet', label: 'Wallet', icon: '💰' },
  ]

  return (
    <div className={styles.viewPage}>
      <PageHead current="Users">
        <Head title={displayName} back="/users" />
      </PageHead>

      <Container>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.userName}>{displayName}</div>
            <div className={styles.headerMeta}>
              {getRoleBadge(user.role || user.discordRole)}
              <span className={styles.date}>Joined {moment(user.createdAt).format('DD/MM/YYYY')}</span>
            </div>
          </div>
          {financial.wallet ? (
            <div className={styles.valueCard}>
              <div className={styles.valueLabel}>Wallet Balance</div>
              <div className={styles.valueAmount}>{formatCurrency(financial.wallet.balance)}</div>
            </div>
          ) : (
            <div className={styles.valueCardEmpty}>
              <div className={styles.valueLabel}>No Wallet</div>
            </div>
          )}
        </div>

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />

        {activeTab === 'overview' && (
          <>
            <ReferralLinkCard userId={user.id} />
            <OverviewTab profileData={profileData} />
          </>
        )}
        {activeTab === 'orders' && <OrdersTab profileData={profileData} />}
        {activeTab === 'wallet' && <WalletTab profileData={profileData} />}
      </Container>
    </div>
  )
}

export default UserDetailPage
