export function normalizeIncomingEmoji(value) {
  if (!value) return { unicode: '', shortcode: '' }
  if (typeof value === 'string') {
    // assume unicode coming from backend
    return { unicode: value, shortcode: '' }
  }
  return { unicode: value.unicode || '', shortcode: value.shortcode || '' }
}

export function valueForSubmit(emojiState) {
  // always submit unicode
  if (!emojiState) return ''
  if (typeof emojiState === 'string') return emojiState
  return emojiState.unicode || ''
}


