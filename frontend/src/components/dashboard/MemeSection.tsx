import { SectionCard } from '../common/SectionCard'
import { Skeleton } from '../common/Skeleton'

export function MemeSectionSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-[var(--radius-md)]" />
      <Skeleton className="mt-3 h-4 w-2/3" />
    </div>
  )
}

export function MemeSection() {
  return (
    <SectionCard title="Crypto Meme">
      <MemeSectionSkeleton />
    </SectionCard>
  )
}
