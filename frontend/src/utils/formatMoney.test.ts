import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'
import { formatMoney } from './formatMoney'
import { formatPercent } from './formatPercent'

describe('formatMoney', () => {
  it('formats typical coin prices with two decimals', () => {
    expect(formatMoney(63013.54)).toBe('$63,013.54')
  })

  it('uses more decimals for prices under one dollar', () => {
    expect(formatMoney(0.179)).toBe('$0.1790')
  })
})

describe('formatPercent', () => {
  it('adds a plus sign for positive movement', () => {
    expect(formatPercent(1.5)).toBe('+1.50%')
  })

  it('keeps the minus sign for negative movement', () => {
    expect(formatPercent(-0.8)).toBe('-0.80%')
  })

  it('renders a dash when the backend has no 24h change', () => {
    expect(formatPercent(null)).toBe('—')
  })
})

describe('formatDate', () => {
  it('formats a date-only ISO value without timezone shift', () => {
    expect(formatDate('2026-07-20')).toBe('Jul 20, 2026')
  })

  it('returns null when the backend has no verified date', () => {
    expect(formatDate(null)).toBeNull()
  })
})
