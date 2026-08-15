import { act, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InsightGeneratingState } from './InsightGeneratingState'

describe('InsightGeneratingState', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('cycles reassuring copy over time without fake percent complete', () => {
    vi.useFakeTimers()
    render(<InsightGeneratingState />)

    expect(
      screen.getByText('Generating your personalized insight…'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('You can keep browsing while we generate this.'),
    ).toBeInTheDocument()
    expect(document.body).toHaveTextContent('Generating for 0s')
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(8_000)
    })

    expect(
      screen.getByText('Analyzing your market context…'),
    ).toBeInTheDocument()
    expect(document.body).toHaveTextContent('Generating for 8s')

    act(() => {
      vi.advanceTimersByTime(12_000)
    })

    expect(
      screen.getByText('Still working — putting your briefing together…'),
    ).toBeInTheDocument()
    expect(document.body).toHaveTextContent('Generating for 20s')
  })

  it('clears timers on unmount', () => {
    vi.useFakeTimers()
    const { unmount } = render(<InsightGeneratingState />)

    unmount()

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(20_000)
      })
    }).not.toThrow()
  })
})
