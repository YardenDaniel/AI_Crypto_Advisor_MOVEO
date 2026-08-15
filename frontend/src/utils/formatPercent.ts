export function formatPercent(value: number | null): string {
  if (value === null) {
    return '—'
  }

  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}
