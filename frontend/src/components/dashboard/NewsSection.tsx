import { SectionCard } from '../common/SectionCard'
import { Skeleton } from '../common/Skeleton'

export function NewsSectionSkeleton() {
  return (
    <ul className="grid gap-3" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <li key={index} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
          <Skeleton className="h-4 w-5/6" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function NewsSection() {
  return (
    <SectionCard title="Market News">
      <NewsSectionSkeleton />
    </SectionCard>
  )
}
