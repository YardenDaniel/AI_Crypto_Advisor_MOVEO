import { useEffect, useState } from 'react'
import { SectionCard } from '../common/SectionCard'
import { Skeleton } from '../common/Skeleton'
import { useMeme } from '../../hooks/dashboard/useMeme'
import { resolveMemeImageUrl } from '../../utils/memeUrl'
import { SectionEmpty, SectionError } from './SectionStatus'
import { VoteControls } from './VoteControls'

export function MemeSectionSkeleton() {
  return (
    <div aria-hidden="true">
      <Skeleton className="mx-auto aspect-[4/3] max-h-56 w-full max-w-sm rounded-[var(--radius-md)] lg:max-h-none" />
      <Skeleton className="mt-3 h-4 w-2/3" />
    </div>
  )
}

export function MemeSection() {
  const memeQuery = useMeme()
  const [imageBroken, setImageBroken] = useState(false)
  const imageUrl = resolveMemeImageUrl(memeQuery.data?.image_url ?? null)
  const showImage = Boolean(imageUrl) && !imageBroken

  useEffect(() => {
    setImageBroken(false)
  }, [memeQuery.data?.image_url])

  return (
    <SectionCard
      title="Crypto Meme"
      className="lg:flex lg:h-full lg:min-h-0 lg:flex-col"
    >
      {memeQuery.isPending ? <MemeSectionSkeleton /> : null}

      {memeQuery.isError ? (
        <SectionError onRetry={() => memeQuery.refetch()}>
          The meme is unavailable right now. Please try again.
        </SectionError>
      ) : null}

      {memeQuery.data ? (
        <div className="flex min-h-0 min-w-0 flex-col lg:flex-1">
          {showImage ? (
            <div className="flex justify-center lg:relative lg:min-h-0 lg:flex-1">
              <img
                src={imageUrl ?? undefined}
                alt={memeQuery.data.title}
                className="mx-auto h-auto max-h-56 w-full max-w-sm rounded-[var(--radius-md)] object-contain lg:absolute lg:inset-0 lg:h-full lg:max-h-none lg:w-full lg:max-w-full"
                onError={() => setImageBroken(true)}
              />
            </div>
          ) : (
            <SectionEmpty>Meme image is unavailable.</SectionEmpty>
          )}
          <div className="mt-3 shrink-0">
            <p className="break-words text-sm font-medium">
              {memeQuery.data.title}
            </p>
            {memeQuery.data.source_url ? (
              <a
                href={memeQuery.data.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm text-accent hover:text-accent-hover"
              >
                {memeQuery.data.source}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="mt-1 text-sm text-muted">{memeQuery.data.source}</p>
            )}
            {memeQuery.data.feedback ? (
              <div className="mt-4">
                <VoteControls feedback={memeQuery.data.feedback} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </SectionCard>
  )
}
