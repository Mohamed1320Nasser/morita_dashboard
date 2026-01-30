import React, { useEffect, useState } from 'react'
import styles from './settings.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import Modal from '@/components/atoms/modal'
import { notify } from '@/config/error'
import { IoSave, IoSettings, IoWallet, IoPeople, IoServer, IoRefresh, IoTrash, IoCheckmarkCircle, IoCloseCircle, IoCloudUpload, IoTime, IoAlert, IoWarning } from 'react-icons/io5'
import { FaDiscord } from 'react-icons/fa'
import { API } from '@/const'
import discordController from '@/controllers/discord'

const SettingsPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [systemConfig, setSystemConfig] = useState(null)
  const [payoutConfig, setPayoutConfig] = useState({
    workerPercentage: 80,
    supportPercentage: 5,
    systemPercentage: 15,
  })

  // Discord Channel Management State
  const [discordStatus, setDiscordStatus] = useState(null)
  const [discordChannels, setDiscordChannels] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [publishingChannel, setPublishingChannel] = useState(null) // Track which channel is being published
  const [publishingAll, setPublishingAll] = useState(false)

  // Modal state
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [pendingPublish, setPendingPublish] = useState(null) // { type: 'all' | 'PRICING' | 'TOS' | 'TICKETS', clearAll: boolean }

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/admin/system/config')
        const data = await response.json()

        if (data.success && data.data) {
          setSystemConfig(data.data)
          if (data.data.payoutConfig) {
            setPayoutConfig(data.data.payoutConfig)
          }
        }
      } catch (e) {
        console.log('Error loading config', e)
      } finally {
        setPageLoading(false)
      }
    }

    fetchConfig()
    fetchDiscordChannelsStatus() // Load Discord channels status on page load
  }, [])

  const handlePayoutChange = (field, value) => {
    const numValue = parseFloat(value) || 0
    const newConfig = { ...payoutConfig, [field]: numValue }

    // Auto-adjust other percentages to maintain 100% total
    const total = Object.values(newConfig).reduce((sum, v) => sum + v, 0)
    if (total > 100) {
      notify('Total percentage cannot exceed 100%')
      return
    }

    setPayoutConfig(newConfig)
  }

  const handleSavePayoutConfig = async () => {
    const total =
      payoutConfig.workerPercentage + payoutConfig.supportPercentage + payoutConfig.systemPercentage

    if (total !== 100) {
      notify(`Total percentage must be 100% (currently ${total}%)`)
      return
    }

    setSaving(true)
    try {
      // Mock save - in production this would call an API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000))
      notify('Payout configuration saved successfully', 'success')
    } catch (e) {
      notify('Failed to save payout configuration')
    } finally {
      setSaving(false)
    }
  }

  const getTotalPercentage = () => {
    return (
      payoutConfig.workerPercentage + payoutConfig.supportPercentage + payoutConfig.systemPercentage
    ).toFixed(1)
  }

  // Discord Channel Management Functions
  const fetchDiscordChannelsStatus = async () => {
    setLoadingStatus(true)
    try {
      const result = await discordController.getChannelsStatus()
      // API response: { msg, status, data: { botConnected, botUsername, channels }, error }
      // Controller returns: { success, data: <api response> }
      const data = result.data?.data || result.data

      if (result.success && data) {
        setDiscordStatus({
          botConnected: data.botConnected,
          botUsername: data.botUsername,
        })
        setDiscordChannels(data.channels || [])
      } else {
        notify('Failed to fetch Discord channels status')
      }
    } catch (error) {
      console.error('Error fetching Discord channels status:', error)
      notify('Failed to fetch Discord channels status')
    } finally {
      setLoadingStatus(false)
    }
  }

  // Show confirmation modal before publishing
  const handlePublishChannel = (channelType) => {
    setPendingPublish({ type: channelType, clearAll: false })
    setShowPublishModal(true)
  }

  // Execute publish after confirmation
  const executePublish = async () => {
    if (!pendingPublish) return

    const { type, clearAll } = pendingPublish
    setShowPublishModal(false)

    if (type === 'all') {
      setPublishingAll(true)
      try {
        const result = await discordController.publishAllChannels(clearAll)

        if (result.success) {
          notify('All channels published successfully!', 'success')
          await fetchDiscordChannelsStatus()
        } else {
          const failedChannels = result.data?.results?.filter(r => !r.success) || []
          if (failedChannels.length > 0) {
            notify(`Some channels failed to publish: ${failedChannels.map(r => r.channel).join(', ')}`, 'warning')
          }
          await fetchDiscordChannelsStatus()
        }
      } catch (error) {
        console.error('Error publishing all channels:', error)
        notify('Failed to publish all channels')
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
          default:
            throw new Error('Unknown channel type')
        }

        if (result.success) {
          notify(`${getChannelDisplayName(type)} published successfully!`, 'success')
          await fetchDiscordChannelsStatus()
        } else {
          notify(result.error?.message || `Failed to publish ${getChannelDisplayName(type)}`)
        }
      } catch (error) {
        console.error(`Error publishing ${type}:`, error)
        notify(`Failed to publish ${getChannelDisplayName(type)}`)
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

  const getChannelDisplayName = (channelType) => {
    switch (channelType) {
      case 'PRICING':
        return 'Pricing Channel'
      case 'TOS':
        return 'Terms of Service'
      case 'TICKETS':
        return 'Ticket Channels'
      default:
        return channelType
    }
  }

  const getChannelDescription = (channelType) => {
    switch (channelType) {
      case 'PRICING':
        return 'Services and pricing information'
      case 'TOS':
        return 'Terms of service with accept button'
      case 'TICKETS':
        return '5 ticket creation channels'
      default:
        return ''
    }
  }

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

  const formatDate = (dateString) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (pageLoading) return <Loading />

  return (
    <div className={styles.settings}>
      <PageHead current="System Settings">
        <Head title="System Settings" noButton>
          Configure system behavior and defaults
        </Head>
      </PageHead>
      <Container>
        {/* Payout Configuration */}
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

          <div className={styles.payoutGrid}>
            <div className={styles.payoutItem}>
              <label htmlFor="worker-percentage">Worker Percentage</label>
              <div className={styles.inputGroup}>
                <input
                  id="worker-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={payoutConfig.workerPercentage}
                  onChange={(e) => handlePayoutChange('workerPercentage', e.target.value)}
                />
                <span className={styles.inputSuffix}>%</span>
              </div>
              <div className={styles.helperText}>Percentage paid to the worker</div>
            </div>

            <div className={styles.payoutItem}>
              <label htmlFor="support-percentage">Support Percentage</label>
              <div className={styles.inputGroup}>
                <input
                  id="support-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={payoutConfig.supportPercentage}
                  onChange={(e) => handlePayoutChange('supportPercentage', e.target.value)}
                />
                <span className={styles.inputSuffix}>%</span>
              </div>
              <div className={styles.helperText}>Percentage paid to support staff</div>
            </div>

            <div className={styles.payoutItem}>
              <label htmlFor="system-percentage">System Percentage</label>
              <div className={styles.inputGroup}>
                <input
                  id="system-percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={payoutConfig.systemPercentage}
                  onChange={(e) => handlePayoutChange('systemPercentage', e.target.value)}
                />
                <span className={styles.inputSuffix}>%</span>
              </div>
              <div className={styles.helperText}>Percentage retained by system</div>
            </div>
          </div>

          <div className={styles.payoutSummary}>
            <div className={styles.summaryRow}>
              <span>Total Percentage:</span>
              <span
                className={styles.totalValue}
                style={{ color: getTotalPercentage() === '100.0' ? '#22c55e' : '#ef4444' }}
              >
                {getTotalPercentage()}%
              </span>
            </div>
            {getTotalPercentage() !== '100.0' && (
              <div className={styles.warningText}>
                ⚠️ Total percentage must equal 100% to save
              </div>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              className="btn btn-primary"
              onClick={handleSavePayoutConfig}
              disabled={saving || getTotalPercentage() !== '100.0'}
            >
              <IoSave /> {saving ? 'Saving...' : 'Save Payout Configuration'}
            </button>
          </div>
        </Card>

        {/* Discord Channels Management */}
        <Card>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <FaDiscord />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Discord Channels</h3>
              <p className={styles.sectionDescription}>
                Manually publish content to Discord channels. Changes won't appear until you publish.
              </p>
            </div>
          </div>

          {/* Bot Connection Status */}
          <div className={styles.discordStatus} style={{ marginBottom: '1.5rem' }}>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>Bot Status</div>
                <div className={styles.statusValue}>
                  {discordStatus?.botConnected ? (
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

              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>Bot Username</div>
                <div className={styles.statusValue}>{discordStatus?.botUsername || 'N/A'}</div>
              </div>

              <div className={styles.statusItem}>
                <div className={styles.statusLabel}>Actions</div>
                <div className={styles.statusValue}>
                  <button
                    className="btn btn-secondary"
                    onClick={fetchDiscordChannelsStatus}
                    disabled={loadingStatus}
                    style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                  >
                    <IoRefresh /> {loadingStatus ? 'Loading...' : 'Refresh Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Publish All Button */}
          <div className={styles.discordActions} style={{ marginBottom: '1.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={handlePublishAllChannels}
              disabled={publishingAll || publishingChannel || !discordStatus?.botConnected}
              style={{ minWidth: '200px' }}
            >
              <IoCloudUpload /> {publishingAll ? 'Publishing All...' : 'Publish All Channels'}
            </button>
          </div>

          {/* Channel Cards */}
          <div className={styles.channelsList}>
            {discordChannels.map((channel) => (
              <div key={channel.channelType} className={styles.channelCard}>
                <div className={styles.channelHeader}>
                  <div className={styles.channelInfo}>
                    <h4 className={styles.channelName}>{getChannelDisplayName(channel.channelType)}</h4>
                    <p className={styles.channelDesc}>{getChannelDescription(channel.channelType)}</p>
                  </div>
                  <div className={styles.channelStatus}>
                    {getStatusBadge(channel.status)}
                  </div>
                </div>

                <div className={styles.channelDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Channel ID:</span>
                    <span className={styles.detailValue}>{channel.channelId || 'Not configured'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Channel Name:</span>
                    <span className={styles.detailValue}>{channel.channelName || 'N/A'}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Last Published:</span>
                    <span className={styles.detailValue}>{formatDate(channel.lastPublishedAt)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Messages:</span>
                    <span className={styles.detailValue}>{channel.messageCount || 0}</span>
                  </div>
                  {channel.lastError && (
                    <div className={styles.detailItem} style={{ gridColumn: '1 / -1' }}>
                      <span className={styles.detailLabel}>Last Error:</span>
                      <span className={styles.detailValue} style={{ color: '#ef4444' }}>{channel.lastError}</span>
                    </div>
                  )}
                </div>

                <div className={styles.channelActions}>
                  <button
                    className="btn btn-primary"
                    onClick={() => handlePublishChannel(channel.channelType)}
                    disabled={publishingChannel === channel.channelType || publishingAll || !discordStatus?.botConnected}
                  >
                    <IoCloudUpload /> {publishingChannel === channel.channelType ? 'Publishing...' : 'Publish to Discord'}
                  </button>
                </div>
              </div>
            ))}

            {discordChannels.length === 0 && !loadingStatus && (
              <div className={styles.emptyState}>
                No channels configured. Make sure the Discord bot is running.
              </div>
            )}

            {loadingStatus && discordChannels.length === 0 && (
              <div className={styles.emptyState}>
                Loading channels status...
              </div>
            )}
          </div>

          <div className={styles.infoBox} style={{ marginTop: '20px' }}>
            <h4>Discord Channel Publishing</h4>
            <ul>
              <li><strong>Pricing Channel:</strong> Shows all services with pricing. Publish after updating prices or adding services.</li>
              <li><strong>Terms of Service:</strong> Shows TOS with accept button. Publish after updating TOS content.</li>
              <li><strong>Ticket Channels:</strong> Creates 5 ticket channels (Purchase Services, Purchase Gold, Sell Gold, Swap Crypto, Account Shop).</li>
              <li><strong>Status Colors:</strong> Green = Published, Yellow = Needs Update, Gray = Never Published, Red = Error</li>
            </ul>
          </div>
        </Card>

        {/* Services Configuration */}
        <Card>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <IoServer />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Active Services</h3>
              <p className={styles.sectionDescription}>Manage available services in the system</p>
            </div>
          </div>

          <div className={styles.servicesList}>
            {systemConfig?.services && systemConfig.services.length > 0 ? (
              systemConfig.services.map((service) => (
                <div key={service.id} className={styles.serviceItem}>
                  <div className={styles.serviceName}>{service.name}</div>
                  <Badge type={service.isActive ? 'success' : 'secondary'}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No services configured</div>
            )}
          </div>
        </Card>

        {/* Payment Methods */}
        <Card>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <IoWallet />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Payment Methods</h3>
              <p className={styles.sectionDescription}>Manage available payment methods</p>
            </div>
          </div>

          <div className={styles.servicesList}>
            {systemConfig?.paymentMethods && systemConfig.paymentMethods.length > 0 ? (
              systemConfig.paymentMethods.map((method) => (
                <div key={method.id} className={styles.serviceItem}>
                  <div className={styles.serviceName}>{method.name}</div>
                  <Badge type={method.isActive ? 'success' : 'secondary'}>
                    {method.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>No payment methods configured</div>
            )}
          </div>
        </Card>

        {/* System Information */}
        <Card>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionIcon}>
              <IoSettings />
            </div>
            <div>
              <h3 className={styles.sectionTitle}>System Information</h3>
              <p className={styles.sectionDescription}>Current system configuration</p>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Default Currency</div>
              <div className={styles.infoValue}>USD</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Order Number Format</div>
              <div className={styles.infoValue}>Auto-increment</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Timezone</div>
              <div className={styles.infoValue}>UTC</div>
            </div>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Environment</div>
              <div className={styles.infoValue}>
                <Badge type="info">Development</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Note */}
        <Card>
          <div className={styles.infoBox}>
            <h4>⚙️ Configuration Notes</h4>
            <p>
              Some settings require system restart to take effect. Always test configuration changes in a staging environment before applying to production.
            </p>
            <ul>
              <li>Payout percentages must total exactly 100%</li>
              <li>Changes to payout configuration only affect new orders</li>
              <li>Service and payment method management can be done from their respective pages</li>
              <li>For Discord bot configuration, use environment variables</li>
            </ul>
          </div>
        </Card>
      </Container>

      {/* Publish Confirmation Modal */}
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
              : `You are about to publish ${getChannelDisplayName(pendingPublish?.type)}.`
            }
          </p>

          {/* Clear All Messages Checkbox */}
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
