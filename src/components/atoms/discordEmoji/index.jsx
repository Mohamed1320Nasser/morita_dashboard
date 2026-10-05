import React, { useState } from 'react'

// <:name:id>, <a:name:id>, name:id or a:name:id
const CUSTOM_EMOJI = /^<?(a)?:?([A-Za-z0-9_~]+):(\d{15,25})>?$/

export const parseDiscordEmoji = (emoji) => {
    const match = String(emoji || '').trim().match(CUSTOM_EMOJI)
    if (!match) return null
    return { animated: !!match[1], name: match[2], id: match[3] }
}

/**
 * Shows an admin-entered icon the way Discord does: custom emojis as their
 * image from Discord's CDN, unicode emojis as text. Falls back to the
 * emoji's name if the image cannot load (deleted emoji, typo in the id).
 */
const DiscordEmoji = ({ emoji, size = 22, fallback = null }) => {
    const [failed, setFailed] = useState(false)
    const trimmed = String(emoji || '').trim()

    if (!trimmed) return fallback

    const custom = parseDiscordEmoji(trimmed)
    if (!custom) {
        return <span style={{ fontSize: size * 0.85, lineHeight: 1 }}>{trimmed}</span>
    }

    if (failed) {
        return (
            <span title={`Emoji image not found: ${trimmed}`} style={{ fontSize: 12, color: '#666' }}>
                :{custom.name}:
            </span>
        )
    }

    return (
        <img
            src={`https://cdn.discordapp.com/emojis/${custom.id}.${custom.animated ? 'gif' : 'png'}?size=64`}
            alt={`:${custom.name}:`}
            title={`:${custom.name}:`}
            width={size}
            height={size}
            loading="lazy"
            style={{ objectFit: 'contain', verticalAlign: 'middle' }}
            onError={() => setFailed(true)}
        />
    )
}

export default DiscordEmoji
