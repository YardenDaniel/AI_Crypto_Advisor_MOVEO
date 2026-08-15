import { useEffect, useRef, useState } from 'react'
import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useDashboardVote } from '../../hooks/dashboard/useDashboardVote'
import type { DashboardFeedback, FeedbackVoteInput } from '../../types/dashboard'

export const VOTE_SELECTED_VISIBLE_MS = 1000
export const VOTE_THANKS_VISIBLE_MS = 1500

type VoteControlsProps = {
  feedback: DashboardFeedback
  className?: string
}

type Phase = 'controls' | 'thanks' | 'hidden'

export function VoteControls({ feedback, className = '' }: VoteControlsProps) {
  const voteMutation = useDashboardVote()

  // Captured once: a feedback item that arrives already voted must never
  // replay the lifecycle, and the cache patch after a successful vote flips
  // can_vote to false while the animation is still running.
  const votableOnMount = useRef(feedback.can_vote)

  const [phase, setPhase] = useState<Phase>('controls')
  const [sessionVote, setSessionVote] = useState<FeedbackVoteInput | null>(null)

  const pending =
    voteMutation.isPending && voteMutation.variables?.feedbackId === feedback.id
  const canVote = votableOnMount.current && sessionVote === null && !pending

  useEffect(() => {
    if (sessionVote === null) {
      return
    }

    const thanksTimer = window.setTimeout(() => {
      setPhase('thanks')
    }, VOTE_SELECTED_VISIBLE_MS)

    const hiddenTimer = window.setTimeout(() => {
      setPhase('hidden')
    }, VOTE_SELECTED_VISIBLE_MS + VOTE_THANKS_VISIBLE_MS)

    return () => {
      window.clearTimeout(thanksTimer)
      window.clearTimeout(hiddenTimer)
    }
  }, [sessionVote])

  async function handleVote(value: FeedbackVoteInput) {
    if (!canVote) {
      return
    }

    try {
      await voteMutation.mutateAsync({
        feedbackId: feedback.id,
        value,
      })

      // Only a confirmed vote starts the lifecycle.
      setSessionVote(value)
    } catch {
      // Keep the previous cache/feedback. The user can retry while can_vote.
    }
  }

  if (!votableOnMount.current || phase === 'hidden') {
    return null
  }

  if (phase === 'thanks') {
    return (
      <p className={`text-sm font-medium text-muted ${className}`.trim()} role="status">
        Thanks for your feedback!
      </p>
    )
  }

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      <p className="text-sm font-medium text-muted">Was this useful?</p>
      <div
        className="flex gap-2"
        role="group"
        aria-label="Feedback"
        aria-busy={pending || undefined}
      >
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border ${
            sessionVote === 'up'
              ? 'border-up bg-up/15 text-up'
              : 'border-border bg-surface text-muted hover:text-text'
          }`}
          aria-label="Mark as useful"
          aria-pressed={sessionVote === 'up'}
          disabled={!canVote}
          onClick={() => {
            void handleVote('up')
          }}
        >
          <ThumbsUp className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border ${
            sessionVote === 'down'
              ? 'border-down bg-down/15 text-down'
              : 'border-border bg-surface text-muted hover:text-text'
          }`}
          aria-label="Mark as not useful"
          aria-pressed={sessionVote === 'down'}
          disabled={!canVote}
          onClick={() => {
            void handleVote('down')
          }}
        >
          <ThumbsDown className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
