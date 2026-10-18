import React, { useEffect, useState } from 'react'
import Card from '@/components/atoms/cards'
import Button from '@/components/atoms/buttons/button'
import referralRewardController from '@/controllers/referralReward'
import { notify } from '@/config/error'
import styles from './tabs/TabStyles.module.scss'

/**
 * Shows a user's personal referral invite and lets an admin create one, so it
 * can be sent to the user to share. It is the same link /referral gives them:
 * every join through it counts as their referral.
 */
const ReferralLinkCard = ({ userId }) => {
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [info, setInfo] = useState(null)
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false

    const load = async () => {
      setLoading(true)
      const res = await referralRewardController.getUserInvite(userId)
      if (cancelled) return
      if (res?.success) {
        setInfo(res.data)
        setLoadError(null)
      } else {
        setLoadError(res?.error?.message || 'Could not load the referral link')
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const handleGetLink = async () => {
    setWorking(true)
    const res = await referralRewardController.createUserInvite(userId)
    setWorking(false)

    if (!res?.success || !res.data?.inviteUrl) {
      notify(res?.error?.message || 'Could not get the referral link')
      return
    }

    setInfo(prev => ({
      ...(prev || {}),
      invite: { inviteCode: res.data.inviteCode, inviteUrl: res.data.inviteUrl },
    }))
    notify(res.data.created ? 'Referral link created' : 'Referral link is ready', 'success')
  }

  const handleCopy = async () => {
    const url = info?.invite?.inviteUrl
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      notify('Link copied', 'success')
    } catch (e) {
      notify('Could not copy automatically. Select the link and copy it.')
    }
  }

  const invite = info?.invite
  const canCreate = info?.hasDiscord && info?.onboarded

  return (
    <Card>
      <h3 className={styles.sectionTitle}>🔗 Referral Link</h3>

      {loading ? (
        <div className={styles.emptyMessage}>Loading…</div>
      ) : loadError ? (
        <div className={styles.emptyMessage}>{loadError}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invite ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                readOnly
                value={invite.inviteUrl}
                onFocus={e => e.target.select()}
                aria-label="Referral link"
                style={{ flex: '1 1 260px', minWidth: 0, padding: '8px 10px', fontFamily: 'monospace' }}
              />
              <Button primary onClick={handleCopy}>Copy</Button>
              <Button secondary onClick={handleGetLink} disabled={working}>
                {working ? 'Checking…' : 'Check link'}
              </Button>
            </div>
          ) : canCreate ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={styles.emptyMessage} style={{ padding: 0 }}>This user has no referral link yet.</span>
              <Button primary onClick={handleGetLink} disabled={working}>
                {working ? 'Creating…' : 'Create link'}
              </Button>
            </div>
          ) : (
            <div className={styles.emptyMessage}>
              {info?.hasDiscord
                ? 'This user has not completed onboarding, so they cannot have a referral link yet.'
                : 'This user has no linked Discord account.'}
            </div>
          )}

          <span style={{ fontSize: '13px', opacity: 0.7 }}>
            Send this link to the user. Everyone who joins the Discord server through it counts as their
            referral, the same as the link they get from /referral.
            {invite ? ' "Check link" makes a new one if it was deleted in Discord.' : ''}
          </span>
        </div>
      )}
    </Card>
  )
}

export default ReferralLinkCard
