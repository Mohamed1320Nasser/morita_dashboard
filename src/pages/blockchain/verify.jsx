import React, { useState } from 'react'
import styles from './blockchain.module.scss'
import Card from '@/components/atoms/cards'
import Head from '@/components/molecules/head/head'
import Container from '@/components/templates/container'
import PageHead from '@/components/templates/pageHead'
import Button from '@/components/atoms/buttons/button'
import blockchainController from '@/controllers/blockchain'
import { notify } from '@/config/error'

const CURRENCIES = [
    { value: 'BTC', label: 'BTC (Bitcoin)' },
    { value: 'LTC', label: 'LTC (Litecoin)' },
    { value: 'ETH', label: 'ETH (Ethereum)' },
    { value: 'USDT', label: 'USDT (Tether)' },
    { value: 'USDC', label: 'USDC (USD Coin)' },
    { value: 'SOL', label: 'SOL (Solana)' },
    { value: 'XRP', label: 'XRP (Ripple)' },
]

const VerifyTransactionPage = () => {
    const [currency, setCurrency] = useState('BTC')
    const [txid, setTxid] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [showAllInputs, setShowAllInputs] = useState(false)

    const handleVerify = async () => {
        if (!txid.trim()) {
            notify('Please enter a transaction ID')
            return
        }

        try {
            setLoading(true)
            setResult(null)
            setShowAllInputs(false)

            const res = await blockchainController.verifyTransaction(currency, txid.trim())

            if (res && res.success) {
                setResult(res.data)
            } else {
                notify(res?.error?.message || 'Failed to verify transaction')
            }
        } catch (e) {
            notify('Error verifying transaction')
        } finally {
            setLoading(false)
        }
    }

    const getStatusClass = () => {
        if (!result) return ''
        switch (result.status) {
            case 'confirmed': return styles.confirmed
            case 'pending': return styles.pending
            case 'not_found': return styles.notFound
            default: return styles.error
        }
    }

    const getStatusIcon = () => {
        if (!result) return ''
        switch (result.status) {
            case 'confirmed': return '✅'
            case 'pending': return '⏳'
            case 'not_found': return '❓'
            default: return '⚠️'
        }
    }

    const getStatusText = () => {
        if (!result) return ''
        switch (result.status) {
            case 'confirmed': return 'Transaction Confirmed'
            case 'pending': return 'Transaction Pending'
            case 'not_found': return 'Transaction Not Found'
            default: return 'Verification Error'
        }
    }

    const getStatusDescription = () => {
        if (!result) return ''
        switch (result.status) {
            case 'confirmed':
                return `This ${currency} transaction has been confirmed on the blockchain.`
            case 'pending':
                return `This ${currency} transaction is pending confirmation.`
            case 'not_found':
                return 'No transaction found with this ID. Please check the transaction ID and selected currency.'
            default:
                return 'Could not verify this transaction. The blockchain API may be temporarily unavailable.'
        }
    }

    const handleClear = () => {
        setResult(null)
        setTxid('')
        setShowAllInputs(false)
    }

    // Get inputs to display (first 5 or all)
    const displayInputs = showAllInputs
        ? (result?.inputs || [])
        : (result?.inputs || []).slice(0, 5)

    return (
        <div className={styles.blockchain}>
            <PageHead current="Blockchain">
                <Head title="Verify Transaction" />
            </PageHead>

            <Container>
                {/* Verify Form Card */}
                <Card>
                    <div className={styles.configForm}>
                        <div className={styles.formSection}>
                            <div className={styles.sectionTitle}>Transaction Details</div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Currency</label>
                                    <select
                                        value={currency}
                                        onChange={e => setCurrency(e.target.value)}
                                    >
                                        {CURRENCIES.map(c => (
                                            <option key={c.value} value={c.value}>{c.label}</option>
                                        ))}
                                    </select>
                                    <span className={styles.hint}>Select the cryptocurrency type</span>
                                </div>

                                <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                    <label>Transaction ID / Hash</label>
                                    <input
                                        type="text"
                                        value={txid}
                                        onChange={e => setTxid(e.target.value)}
                                        placeholder="Enter transaction ID or hash..."
                                        onKeyDown={e => e.key === 'Enter' && handleVerify()}
                                    />
                                    <span className={styles.hint}>The unique transaction identifier from the blockchain</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.formActions}>
                            {result && (
                                <Button onClick={handleClear}>
                                    Clear
                                </Button>
                            )}
                            <Button
                                primary
                                onClick={handleVerify}
                                disabled={loading}
                            >
                                {loading ? 'Verifying...' : 'Verify Transaction'}
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Result */}
                {result && (
                    <div className={`${styles.resultCard} ${getStatusClass()}`}>
                        <div className={styles.resultHeader}>
                            <div className={`${styles.statusIcon} ${getStatusClass()}`}>
                                {getStatusIcon()}
                            </div>
                            <div className={styles.statusText}>
                                <h3>{getStatusText()}</h3>
                                <p>{getStatusDescription()}</p>
                            </div>
                        </div>

                        {(result.status === 'confirmed' || result.status === 'pending') && (
                            <>
                                {/* Main Amount - Total Received */}
                                {result.totalReceived > 0 && (
                                    <div className={styles.resultAmount}>
                                        <div className={styles.amountLabel}>Total Received</div>
                                        <div className={styles.amountValue}>
                                            {result.totalReceivedFormatted} {currency}
                                        </div>
                                        {result.totalReceivedUsd > 0 && (
                                            <div className={styles.amountUsd}>
                                                ${result.totalReceivedUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Summary Details */}
                                <div className={styles.resultDetails}>
                                    <div className={styles.detailItem}>
                                        <div className={styles.detailLabel}>Confirmations</div>
                                        <div className={styles.detailValue}>{result.confirmations}</div>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <div className={styles.detailLabel}>Network</div>
                                        <div className={styles.detailValue}>{result.network}</div>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <div className={styles.detailLabel}>Total Input</div>
                                        <div className={styles.detailValue}>
                                            {result.totalInputFormatted} {currency}
                                            {result.totalInputUsd > 0 && (
                                                <span className={styles.usdValue}>
                                                    (${result.totalInputUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {result.fee > 0 && (
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailLabel}>Fee</div>
                                            <div className={styles.detailValue}>
                                                {result.feeFormatted} {currency}
                                                {result.feeUsd > 0 && (
                                                    <span className={styles.usdValue}>
                                                        (${result.feeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {result.timestamp && (
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailLabel}>Time</div>
                                            <div className={styles.detailValue}>
                                                {new Date(result.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    )}

                                    {result.blockHeight && (
                                        <div className={styles.detailItem}>
                                            <div className={styles.detailLabel}>Block Height</div>
                                            <div className={styles.detailValue}>
                                                {result.blockHeight.toLocaleString()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Outputs (Recipients) */}
                                {result.outputs && result.outputs.length > 0 && (
                                    <div className={styles.txSection}>
                                        <div className={styles.txSectionTitle}>
                                            Recipients ({result.outputCount} output{result.outputCount > 1 ? 's' : ''})
                                        </div>
                                        <div className={styles.txList}>
                                            {result.outputs.map((output, idx) => (
                                                <div key={idx} className={styles.txItem}>
                                                    <div className={styles.txAddress}>{output.address}</div>
                                                    <div className={styles.txAmount}>
                                                        {output.amountFormatted} {currency}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Inputs (Senders) */}
                                {result.inputs && result.inputs.length > 0 && (
                                    <div className={styles.txSection}>
                                        <div className={styles.txSectionTitle}>
                                            Senders ({result.inputCount} input{result.inputCount > 1 ? 's' : ''} from {result.inputs.length} address{result.inputs.length > 1 ? 'es' : ''})
                                        </div>
                                        <div className={styles.txList}>
                                            {displayInputs.map((input, idx) => (
                                                <div key={idx} className={styles.txItem}>
                                                    <div className={styles.txAddress}>{input.address}</div>
                                                    <div className={styles.txAmount}>
                                                        {input.amountFormatted} {currency}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {result.inputs.length > 5 && (
                                            <button
                                                className={styles.showMoreBtn}
                                                onClick={() => setShowAllInputs(!showAllInputs)}
                                            >
                                                {showAllInputs
                                                    ? 'Show Less'
                                                    : `Show All ${result.inputs.length} Addresses`
                                                }
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Transaction ID */}
                                <div className={styles.txSection}>
                                    <div className={styles.txSectionTitle}>Transaction ID</div>
                                    <div className={`${styles.detailValue} ${styles.mono}`}>
                                        {txid}
                                        {result.explorerUrl && (
                                            <a
                                                href={result.explorerUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.explorerLink}
                                            >
                                                View on Explorer
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Empty State when no search */}
                {!result && !loading && (
                    <Card>
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🔍</div>
                            <div className={styles.emptyText}>Verify Blockchain Transactions</div>
                            <div className={styles.emptyHint}>
                                Enter a transaction ID above to verify payment details on the blockchain
                            </div>
                        </div>
                    </Card>
                )}
            </Container>
        </div>
    )
}

export default VerifyTransactionPage
