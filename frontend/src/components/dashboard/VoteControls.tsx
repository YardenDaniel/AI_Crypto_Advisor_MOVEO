import { ThumbsDown, ThumbsUp } from 'lucide-react'
import { useDashboardVote } from '../../hooks/dashboard/useDashboardVote'
import type { DashboardFeedback, FeedbackVoteInput } from '../../types/dashboard'

type VoteControlsProps = {
  feedback: DashboardFeedback
}

export function VoteControls({ feedback }: VoteControlsProps) {
  const voteMutation = useDashboardVote()
  const pending =
    voteMutation.isPending && voteMutation.variables?.feedbackId === feedback.id
  const canVote = feedback.can_vote && feedback.vote === 'none' && !pending
  const voted = feedback.vote !== 'none'

  async function handleVote(value: FeedbackVoteInput) {
    if (!canVote) {
      return
    }

    try {
      await voteMutation.mutateAsync({
        feedbackId: feedback.id,
        value,
      })
    } catch {
      // Keep the previous cache/feedback. The user can retry while can_vote.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <p className="text-sm font-medium text-muted">
        {voted
          ? feedback.vote === 'up'
            ? 'You marked this as useful'
            : 'You marked this as not useful'
          : 'Was this useful?'}
      </p>
      <div
        className="flex gap-2"
        role="group"
        aria-label="Feedback"
        aria-busy={pending || undefined}
      >
        <button
          type="button"
          className={`inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] border ${
            feedback.vote === 'up'
              ? 'border-up bg-up/15 text-up'
              : 'border-border bg-surface text-muted hover:text-text'
          }`}
          aria-label="Mark as useful"
          aria-pressed={feedback.vote === 'up'}
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
            feedback.vote === 'down'
              ? 'border-down bg-down/15 text-down'
              : 'border-border bg-surface text-muted hover:text-text'
          }`}
          aria-label="Mark as not useful"
          aria-pressed={feedback.vote === 'down'}
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
