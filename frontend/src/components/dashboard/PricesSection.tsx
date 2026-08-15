import { SectionCard } from '../common/SectionCard'
import { Skeleton } from '../common/Skeleton'

export function PricesSectionSkeleton() {
  return (
    <ul className="grid gap-3" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <li key={index} className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-14" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function PricesSection() {
  return (
    <SectionCard title="Prices">
      <PricesSectionSkeleton />
    </SectionCard>
  )
}
