export function formatMoney(value: number): string {
  const abs = Math.abs(value)
  const fractionDigits = abs > 0 && abs < 1 ? 4 : 2

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}
