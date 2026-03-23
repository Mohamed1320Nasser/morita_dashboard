import React from 'react'
import Card from '@/components/atoms/cards'
import Badge from '@/components/atoms/badge'
import moment from 'moment'
import styles from './TabStyles.module.scss'

const WalletTab = ({ profileData }) => {
  const { financial } = profileData

  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0
    return `$${num.toFixed(2)}`
  }

  // Check if wallet exists
  if (!financial.wallet) {
    return (
      <div className={styles.tabContent}>
        <Card>
          <div className={styles.emptyMessage}>
            User does not have a wallet yet
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.statsGrid}>
        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#10b981' }}>
              {formatCurrency(financial.wallet.balance)}
            </div>
            <div className={styles.statLabel}>Current Balance</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#f59e0b' }}>
              {formatCurrency(financial.wallet.pendingBalance)}
            </div>
            <div className={styles.statLabel}>Pending Balance</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#3b82f6' }}>
              {formatCurrency(financial.totalDeposits)}
            </div>
            <div className={styles.statLabel}>Total Deposits</div>
          </div>
        </Card>

        <Card>
          <div className={styles.statCard}>
            <div className={styles.statValue} style={{ color: '#ef4444' }}>
              {formatCurrency(financial.totalWithdrawals)}
            </div>
            <div className={styles.statLabel}>Total Withdrawals</div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className={styles.sectionTitle}>Wallet Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Wallet Type</span>
            <span className={styles.infoValue}>{financial.wallet.walletType || 'N/A'}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Status</span>
            <span className={styles.infoValue}>
              {financial.wallet.isActive ? (
                <Badge type="success">Active</Badge>
              ) : (
                <Badge type="danger">Inactive</Badge>
              )}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Total Spent</span>
            <span className={styles.infoValue}>{formatCurrency(financial.totalSpent)}</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Total Earned</span>
            <span className={styles.infoValue}>{formatCurrency(financial.totalEarnings)}</span>
          </div>
        </div>
      </Card>

      {financial.recentTransactions && financial.recentTransactions.length > 0 && (
        <Card>
          <h3 className={styles.sectionTitle}>Recent Transactions ({financial.recentTransactions.length})</h3>
          {financial.recentTransactions.map((tx) => (
            <div key={tx.id} className={styles.listItem}>
              <div className={styles.listInfo}>
                <div className={styles.listTitle}>
                  {tx.type}
                  <Badge type={
                    tx.type === 'DEPOSIT' ? 'success' :
                    tx.type === 'WITHDRAWAL' ? 'danger' :
                    tx.type === 'PAYMENT' ? 'warning' : 'secondary'
                  }>
                    {tx.type}
                  </Badge>
                </div>
                <div className={styles.listMeta}>
                  {moment(tx.createdAt).format('DD/MM/YYYY HH:mm')}
                  {tx.description && ` - ${tx.description}`}
                </div>
              </div>
              <div className={styles.listValue} style={{
                color: parseFloat(tx.amount) >= 0 ? '#10b981' : '#ef4444'
              }}>
                {parseFloat(tx.amount) >= 0 ? '+' : ''}
                {formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

export default WalletTab
