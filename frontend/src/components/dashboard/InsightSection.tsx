import { SectionCard } from '../common/SectionCard'
import { Skeleton } from '../common/Skeleton'

export function InsightSectionSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export function InsightSection() {
  return (
    <SectionCard title="AI Insight">
      <InsightSectionSkeleton />
    </SectionCard>
  )
}
