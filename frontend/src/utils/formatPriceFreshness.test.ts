import { describe, expect, it } from 'vitest'
import { formatPriceFreshness } from './formatPriceFreshness'

const now = 1_710_000_000_000

describe('formatPriceFreshness', () => {
  it('returns null when no coin reports a provider timestamp', () => {
    expect(formatPriceFreshness([], now)).toBeNull()
    expect(formatPriceFreshness([null, null], now)).toBeNull()
  })

  it('reports fresh data as just now', () => {
    expect(formatPriceFreshness([1_710_000_000 - 20], now)).toBe(
      'Updated just now',
    )
  })

  it('reports minutes, hours, and days', () => {
    expect(formatPriceFreshness([1_710_000_000 - 120], now)).toBe(
      'Updated 2 min ago',
    )
    expect(formatPriceFreshness([1_710_000_000 - 7200], now)).toBe(
      'Updated 2 hr ago',
    )
    expect(formatPriceFreshness([1_710_000_000 - 86_400], now)).toBe(
      'Updated 1 day ago',
    )
    expect(formatPriceFreshness([1_710_000_000 - 172_800], now)).toBe(
      'Updated 2 days ago',
    )
  })

  it('uses the oldest known timestamp and ignores missing ones', () => {
    expect(
      formatPriceFreshness(
        [1_710_000_000 - 60, null, 1_710_000_000 - 600],
        now,
      ),
    ).toBe('Updated 10 min ago')
  })
})
