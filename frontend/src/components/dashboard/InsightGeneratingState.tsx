import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Skeleton } from '../common/Skeleton'

export const INSIGHT_GENERATION_PHASES = [
  {
    afterSeconds: 0,
    message: 'Generating your personalized insight…',
  },
  {
    afterSeconds: 8,
    message: 'Analyzing your market context…',
  },
  {
    afterSeconds: 20,
    message: 'Still working — putting your briefing together…',
  },
] as const

function messageForElapsed(elapsedSeconds: number): string {
  let message: string = INSIGHT_GENERATION_PHASES[0].message

  for (const phase of INSIGHT_GENERATION_PHASES) {
    if (elapsedSeconds >= phase.afterSeconds) {
      message = phase.message
    }
  }

  return message
}

export function InsightGeneratingState() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    const startedAt = Date.now()
    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div>
      <div className="mb-5 flex gap-3">
        <Sparkles
          className="mt-0.5 h-4 w-4 shrink-0 text-ai motion-safe:animate-pulse"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-1.5">
          <p className="text-sm font-medium text-ai" role="status">
            {messageForElapsed(elapsedSeconds)}
          </p>
          <p className="text-xs text-muted" aria-hidden="true">
            Generating for {elapsedSeconds}s
          </p>
          <p className="text-sm text-muted">
            You can keep browsing while we generate this.
          </p>
        </div>
      </div>
      <InsightSectionSkeleton />
    </div>
  )
}

export function InsightSectionSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      <Skeleton className="h-5 w-3/4 motion-safe:animate-pulse" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full motion-safe:animate-pulse" />
        <Skeleton className="h-3.5 w-5/6 motion-safe:animate-pulse" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-2/3 motion-safe:animate-pulse" />
        <Skeleton className="h-3.5 w-3/5 motion-safe:animate-pulse" />
        <Skeleton className="h-3.5 w-1/2 motion-safe:animate-pulse" />
      </div>
    </div>
  )
}
