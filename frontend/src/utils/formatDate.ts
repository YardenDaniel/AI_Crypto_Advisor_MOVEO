/**
 * Format dashboard dates. News `published_at` is date-only ISO (YYYY-MM-DD)
 * or null when the backend has no verified date.
 */
export function formatDate(value: string | null): string | null {
  if (!value) {
    return null
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)

  if (!dateOnly) {
    return value
  }

  const year = Number(dateOnly[1])
  const month = Number(dateOnly[2])
  const day = Number(dateOnly[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}
