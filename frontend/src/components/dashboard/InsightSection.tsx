import { SectionCard } from '../common/SectionCard'
import { isApiError } from '../../api/errors'
import { useAiInsight } from '../../hooks/dashboard/useAiInsight'
import { InsightGeneratingState } from './InsightGeneratingState'
import { SectionError } from './SectionStatus'
import { VoteControls } from './VoteControls'

export function InsightSection() {
  const insightQuery = useAiInsight()
  const isProviderUnavailable =
    insightQuery.isError &&
    isApiError(insightQuery.error) &&
    insightQuery.error.status === 502

  return (
    <SectionCard title="AI Insight">
      {insightQuery.isPending ? <InsightGeneratingState /> : null}

      {insightQuery.isError ? (
        <SectionError onRetry={() => insightQuery.refetch()}>
          {isProviderUnavailable
            ? 'AI insight is temporarily unavailable.'
            : 'AI insight could not be loaded. Please try again.'}
        </SectionError>
      ) : null}

      {insightQuery.data ? (
        <div className="min-w-0 space-y-4">
          <h3 className="break-words text-lg font-semibold tracking-tight md:text-xl">
            {insightQuery.data.title}
          </h3>
          <p className="break-words text-sm leading-relaxed text-muted md:text-[0.95rem]">
            {insightQuery.data.summary}
          </p>
          {insightQuery.data.key_points.length > 0 ? (
            <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              {insightQuery.data.key_points.map((point, index) => (
                <li key={index} className="break-words">
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <p className="break-words">
              <span className="font-medium text-text">Watch for: </span>
              <span className="text-muted">{insightQuery.data.watch_for}</span>
            </p>
            <p className="break-words">
              <span className="font-medium text-text">Risk note: </span>
              <span className="text-muted">{insightQuery.data.risk_note}</span>
            </p>
          </div>
          {insightQuery.data.feedback ? (
            <VoteControls feedback={insightQuery.data.feedback} />
          ) : null}
        </div>
      ) : null}
    </SectionCard>
  )
}
