import React, { useEffect, useState } from 'react'
import styles from './settings.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Modal from '@/components/atoms/modal'
import { notify } from '@/config/error'
import { IoWallet, IoWarning, IoImage } from 'react-icons/io5'
import { FaDiscord } from 'react-icons/fa'
import discordController from '@/controllers/discord'
import payoutConfigController from '@/controllers/payoutConfig'
import PayoutForm from './components/PayoutConfiguration/PayoutForm'
import PayoutDistributionChart from './components/PayoutConfiguration/PayoutDistributionChart'
import SystemInfoCard from './components/SystemInfo/SystemInfoCard'
import DiscordStatus from './components/DiscordManagement/DiscordStatus'
import ChannelCard from './components/DiscordManagement/ChannelCard'
import BrandingCard from './components/Branding/BrandingCard'

const SettingsPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [payoutConfig, setPayoutConfig] = useState({
    workerPercentage: 80,
    supportPercentage: 5,
    systemPercentage: 15,
  })

  const [discordStatus, setDiscordStatus] = useState(null)
  const [discordChannels, setDiscordChannels] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [publishingChannel, setPublishingChannel] = useState(null)
  const [publishingAll, setPublishingAll] = useState(false)

  const [showPublishModal, setShowPublishModal] = useState(false)
  const [pendingPublish, setPendingPublish] = useState(null)

  useEffect(() => {
    const fetchPayoutConfig = async () => {
      try {
        const result = await payoutConfigController.getActiveConfig()
        if (result.success && result.data) {
          setPayoutConfig({
            workerPercentage: parseFloat(result.data.workerPercentage),
            supportPercentage: parseFloat(result.data.supportPercentage),
            systemPercentage: parseFloat(result.data.systemPercentage),
          })
        }
      } catch (e) {
        console.log('Error loading payout config', e)
      }
    }

    fetchPayoutConfig().finally(() => {
      setPageLoading(false)
    })

    fetchDiscordChannelsStatus()
  }, [])

  const handlePayoutChange = (field, value) => {
    const newConfig = { ...payoutConfig, [field]: value }
    const total = newConfig.workerPercentage + newConfig.supportPercentage + newConfig.systemPercentage

    if (total > 100) {
      notify({ message: 'Total percentage cannot exceed 100%', type: 'error' })
      return
    }

    setPayoutConfig(newConfig)
  }

  const handleSavePayoutConfig = async () => {
    const total = payoutConfig.workerPercentage + payoutConfig.supportPercentage + payoutConfig.systemPercentage

    if (total !== 100) {
      notify({ message: `Total percentage must be 100% (currently ${total}%)`, type: 'error' })
      return
    }

    setSaving(true)
    try {
      const result = await payoutConfigController.upsertConfig(payoutConfig)
      if (result.success) {
        notify({ message: 'Payout configuration saved successfully', type: 'success' })
      } else {
        notify({ message: result.error?.message || 'Failed to save payout configuration', type: 'error' })
      }
    } catch (e) {
      notify({ message: 'Failed to save payout configuration', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const getTotalPercentage = () => {
    return payoutConfig.workerPercentage + payoutConfig.supportPercentage + payoutConfig.systemPercentage
  }

  const fetchDiscordChannelsStatus = async () => {
    setRefreshing(true)
    try {
      const result = await discordController.getChannelsStatus()
      const data = result.data?.data || result.data

      if (result.success && data) {
        setDiscordStatus({
          botConnected: data.botConnected,
          botUsername: data.botUsername,
        })
        setDiscordChannels(data.channels || [])
      } else {
        notify({ message: 'Failed to fetch Discord channels status', type: 'error' })
      }
    } catch (error) {
      console.error('Error fetching Discord channels status:', error)
      notify({ message: 'Failed to fetch Discord channels status', type: 'error' })
    } finally {
      setRefreshing(false)
    }
  }

  const handlePublishChannel = (channelType) => {
    setPendingPublish({ type: channelType, clearAll: false })
    setShowPublishModal(true)
  }

  const executePublish = async () => {
    if (!pendingPublish) return

    const { type, clearAll } = pendingPublish
    setShowPublishModal(false)

    if (type === 'all') {
      setPublishingAll(true)
      try {
        const result = await discordController.publishAllChannels(clearAll)

        if (result.success) {
          notify({ message: 'All channels published successfully!', type: 'success' })
          await fetchDiscordChannelsStatus()
        } else {
          const failedChannels = result.data?.results?.filter(r => !r.success) || []
          if (failedChannels.length > 0) {
            notify({ message: `Some channels failed to publish: ${failedChannels.map(r => r.channel).join(', ')}`, type: 'warning' })
          }
          await fetchDiscordChannelsStatus()
        }
      } catch (error) {
        console.error('Error publishing all channels:', error)
        notify({ message: 'Failed to publish all channels', type: 'error' })
      } finally {
        setPublishingAll(false)
        setPendingPublish(null)
      }
    } else {
      setPublishingChannel(type)
      try {
        let result
        switch (type) {
          case 'PRICING':
            result = await discordController.publishPricingChannel(clearAll)
            break
          case 'TOS':
            result = await discordController.publishTosChannel(clearAll)
            break
          case 'TICKETS':
            result = await discordController.publishTicketChannels(clearAll)
            break
          case 'ACCOUNTS':
            result = await discordController.publishAccountsChannel(clearAll)
            break
          case 'PAYMENTS':
            result = await discordController.publishPaymentsChannel(clearAll)
            break
          default:
            throw new Error('Unknown channel type')
        }

        if (result.success) {
          notify({ message: `Channel published successfully!`, type: 'success' })
          await fetchDiscordChannelsStatus()
        } else {
          notify({ message: result.error?.message || `Failed to publish channel`, type: 'error' })
        }
      } catch (error) {
        console.error(`Error publishing ${type}:`, error)
        notify({ message: `Failed to publish channel`, type: 'error' })
      } finally {
        setPublishingChannel(null)
        setPendingPublish(null)
      }
    }
  }

  const handlePublishAllChannels = () => {
    setPendingPublish({ type: 'all', clearAll: false })
    setShowPublishModal(true)
  }

  const toggleClearAll = () => {
    if (pendingPublish) {
      setPendingPublish({ ...pendingPublish, clearAll: !pendingPublish.clearAll })
    }
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.settings}>
      <PageHead current="System Settings">
        <Head title="System Settings" noButton>
          Configure system behavior and integrations
        </Head>
      </PageHead>

      <Container>
        <div className={styles.settingsGrid}>
          <div className={styles.mainColumn}>
            <Card>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <IoWallet />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Payout Configuration</h3>
                  <p className={styles.sectionDescription}>
                    Configure how order revenue is distributed between worker, support, and system
                  </p>
                </div>
              </div>

              <div className={styles.payoutContainer}>
                <div className={styles.payoutFormSection}>
                  <PayoutForm
                    config={payoutConfig}
                    onChange={handlePayoutChange}
                    onSave={handleSavePayoutConfig}
                    saving={saving}
                    getTotalPercentage={getTotalPercentage}
                  />
                </div>

                <div className={styles.payoutChartSection}>
                  <PayoutDistributionChart config={payoutConfig} />
                </div>
              </div>
            </Card>

            <Card>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <IoImage />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Branding</h3>
                  <p className={styles.sectionDescription}>
                    Banner and thumbnail images used across Discord bot messages
                  </p>
                </div>
              </div>

              <BrandingCard />
            </Card>

            <Card>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <FaDiscord />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>Discord Integration</h3>
                  <p className={styles.sectionDescription}>
                    Manage Discord bot connection and publish content to channels
                  </p>
                </div>
              </div>

              <DiscordStatus
                status={discordStatus}
                onRefresh={fetchDiscordChannelsStatus}
                onPublishAll={handlePublishAllChannels}
                refreshing={refreshing}
                publishing={publishingAll}
              />

              <div className={styles.channelsList}>
                {discordChannels.length > 0 ? (
                  discordChannels.map((channel) => (
                    <ChannelCard
                      key={channel.channelType}
                      channel={channel}
                      onPublish={handlePublishChannel}
                      publishing={publishingChannel === channel.channelType}
                      disabled={publishingAll || !discordStatus?.botConnected}
                    />
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    {refreshing ? 'Loading channels...' : 'No channels configured'}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className={styles.sideColumn}>
            <Card>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIcon}>
                  <IoWallet />
                </div>
                <div>
                  <h3 className={styles.sectionTitle}>System Information</h3>
                  <p className={styles.sectionDescription}>
                    System metadata and quick access links
                  </p>
                </div>
              </div>

              <SystemInfoCard />
            </Card>
          </div>
        </div>
      </Container>

      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Confirm Publish"
        size="medium"
        footer={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setShowPublishModal(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={executePublish}
            >
              Publish
            </button>
          </>
        }
      >
        <div>
          <p style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>
            {pendingPublish?.type === 'all'
              ? 'You are about to publish all Discord channels.'
              : `You are about to publish this channel.`
            }
          </p>

          <div
            style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={pendingPublish?.clearAll || false}
                onChange={toggleClearAll}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <IoWarning style={{ color: '#dc3545' }} />
                Clear ALL messages before publishing
              </div>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SettingsPage
