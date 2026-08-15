import { act, fireEvent, render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { submitVote } from '../../api/dashboard'
import type { DashboardFeedback } from '../../types/dashboard'
import {
  VOTE_SELECTED_VISIBLE_MS,
  VOTE_THANKS_VISIBLE_MS,
  VoteControls,
} from './VoteControls'

vi.mock('../../api/dashboard', () => ({
  submitVote: vi.fn(),
}))

const votableFeedback: DashboardFeedback = {
  id: 10,
  vote: 'none',
  can_vote: true,
}

function renderVote(feedback: DashboardFeedback) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <VoteControls feedback={feedback} />
    </QueryClientProvider>,
  )
}

function upButton() {
  return screen.getByRole('button', { name: 'Mark as useful' })
}

function downButton() {
  return screen.getByRole('button', { name: 'Mark as not useful' })
}

describe('VoteControls', () => {
  beforeEach(() => {
    vi.mocked(submitVote).mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs the up vote lifecycle: selected, then thanks, then removed', async () => {
    vi.useFakeTimers()
    vi.mocked(submitVote).mockResolvedValue({
      id: 10,
      vote: 'up',
      can_vote: false,
    })

    renderVote(votableFeedback)

    expect(screen.getByText('Was this useful?')).toBeInTheDocument()

    await act(async () => {
      fireEvent.click(upButton())
    })

    expect(submitVote).toHaveBeenCalledWith(10, { value: 'up' })

    // Selected state stays visible and locked.
    expect(upButton()).toHaveAttribute('aria-pressed', 'true')
    expect(upButton()).toBeDisabled()
    expect(downButton()).toHaveAttribute('aria-pressed', 'false')
    expect(downButton()).toBeDisabled()
    expect(
      screen.queryByText('Thanks for your feedback!'),
    ).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VOTE_SELECTED_VISIBLE_MS)
    })

    expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Mark as useful' }),
    ).not.toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VOTE_THANKS_VISIBLE_MS)
    })

    expect(
      screen.queryByText('Thanks for your feedback!'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Was this useful?')).not.toBeInTheDocument()
  })

  it('runs the down vote lifecycle: selected, then thanks, then removed', async () => {
    vi.useFakeTimers()
    vi.mocked(submitVote).mockResolvedValue({
      id: 10,
      vote: 'down',
      can_vote: false,
    })

    renderVote(votableFeedback)

    await act(async () => {
      fireEvent.click(downButton())
    })

    expect(submitVote).toHaveBeenCalledWith(10, { value: 'down' })
    expect(downButton()).toHaveAttribute('aria-pressed', 'true')
    expect(downButton()).toBeDisabled()
    expect(upButton()).toHaveAttribute('aria-pressed', 'false')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VOTE_SELECTED_VISIBLE_MS)
    })

    expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(VOTE_THANKS_VISIBLE_MS)
    })

    expect(
      screen.queryByText('Thanks for your feedback!'),
    ).not.toBeInTheDocument()
  })

  it('hides feedback that already has can_vote false, without any animation', () => {
    renderVote({ id: 10, vote: 'up', can_vote: false })

    expect(screen.queryByText('Was this useful?')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Thanks for your feedback!'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Mark as useful' }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Mark as not useful' }),
    ).not.toBeInTheDocument()
  })

  it('keeps the controls available when the vote request fails', async () => {
    vi.mocked(submitVote).mockRejectedValueOnce(new Error('network'))

    renderVote(votableFeedback)

    await act(async () => {
      fireEvent.click(upButton())
    })

    expect(screen.getByText('Was this useful?')).toBeInTheDocument()
    expect(upButton()).toBeEnabled()
    expect(upButton()).toHaveAttribute('aria-pressed', 'false')
    expect(downButton()).toBeEnabled()
    expect(
      screen.queryByText('Thanks for your feedback!'),
    ).not.toBeInTheDocument()

    // Retry still works and then runs the normal lifecycle.
    vi.mocked(submitVote).mockResolvedValue({
      id: 10,
      vote: 'up',
      can_vote: false,
    })

    await act(async () => {
      fireEvent.click(upButton())
    })

    expect(submitVote).toHaveBeenCalledTimes(2)
    expect(upButton()).toHaveAttribute('aria-pressed', 'true')
  })

  it('clears its timers when unmounted mid-lifecycle', async () => {
    vi.useFakeTimers()
    vi.mocked(submitVote).mockResolvedValue({
      id: 10,
      vote: 'up',
      can_vote: false,
    })

    const { unmount } = renderVote(votableFeedback)

    await act(async () => {
      fireEvent.click(upButton())
    })

    unmount()

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(
          VOTE_SELECTED_VISIBLE_MS + VOTE_THANKS_VISIBLE_MS,
        )
      })
    }).not.toThrow()
  })
})
