/**
 * Build the "Updated …" label for the Prices section.
 *
 * The input is CoinGecko's per-coin `last_updated_at` (unix seconds) as
 * returned by the backend, so the label describes real provider data
 * freshness rather than when the component rendered. The oldest displayed
 * coin wins, because the section is only as fresh as its stalest row.
 */
export function formatPriceFreshness(
  timestamps: (number | null)[],
  now: number = Date.now(),
): string | null {
  const known = timestamps.filter(
    (value): value is number => typeof value === 'number' && value > 0,
  )

  if (known.length === 0) {
    return null
  }

  const oldest = Math.min(...known)
  const seconds = Math.floor(now / 1000) - oldest

  if (seconds < 60) {
    return 'Updated just now'
  }

  const minutes = Math.floor(seconds / 60)

  if (minutes < 60) {
    return `Updated ${minutes} min ago`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `Updated ${hours} hr ago`
  }

  const days = Math.floor(hours / 24)

  return `Updated ${days} ${days === 1 ? 'day' : 'days'} ago`
}
