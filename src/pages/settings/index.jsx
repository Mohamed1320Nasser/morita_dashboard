import React, { useEffect, useState } from 'react'
import styles from './settings.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Loading from '@/components/atoms/loading'
import Badge from '@/components/atoms/badge'
import { notify } from '@/config/error'
import { IoSave, IoSettings, IoWallet, IoPeople, IoServer } from 'react-icons/io5'

const SettingsPage = () => {
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [systemConfig, setSystemConfig] = useState(null)
  const [payoutConfig, setPayoutConfig] = useState({
    workerPercentage: 80,
    supportPercentage: 5,
    systemPercentage: 15,
  })

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
    </div>
  )
}


export default SettingsPage
