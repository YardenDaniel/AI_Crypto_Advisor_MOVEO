import { useEffect, useState } from 'react'
import { Maximize2, RefreshCw } from 'lucide-react'
import { Button } from '../common/Button'
import { ImageLightbox } from '../common/ImageLightbox'
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
  const [enlarged, setEnlarged] = useState(false)
  const imageUrl = resolveMemeImageUrl(memeQuery.data?.image_url ?? null)
  const showImage = Boolean(imageUrl) && !imageBroken

  useEffect(() => {
    setImageBroken(false)
    setEnlarged(false)
  }, [memeQuery.data?.image_url])

  return (
    <SectionCard
      title="Crypto Meme"
      className="lg:flex lg:h-full lg:min-h-0 lg:flex-col"
      action={
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1.5"
          // Refetches only ['dashboard', 'meme']; the other sections keep
          // their cached data.
          onClick={() => {
            void memeQuery.refetch()
          }}
          disabled={memeQuery.isFetching}
          aria-busy={memeQuery.isFetching || undefined}
        >
          <RefreshCw
            className={`h-4 w-4 ${memeQuery.isFetching ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          New meme
        </Button>
      }
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
              <button
                type="button"
                onClick={() => setEnlarged(true)}
                aria-label={`Enlarge meme: ${memeQuery.data.title}`}
                className="group relative mx-auto flex w-full max-w-sm cursor-zoom-in items-center justify-center rounded-[var(--radius-md)] lg:absolute lg:inset-0 lg:max-w-full"
              >
                <img
                  src={imageUrl ?? undefined}
                  alt={memeQuery.data.title}
                  className="h-auto max-h-56 w-full rounded-[var(--radius-md)] object-contain lg:h-full lg:max-h-none"
                  onError={() => setImageBroken(true)}
                />
                <span
                  className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-card/85 text-muted transition-colors group-hover:text-text"
                  aria-hidden="true"
                >
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
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
              // Keyed so a replacement meme gets its own vote controls
              // instead of inheriting the previous meme's voted state.
              <VoteControls
                key={memeQuery.data.feedback.id}
                feedback={memeQuery.data.feedback}
                className="mt-4"
              />
            ) : null}
          </div>
        </div>
      ) : null}

      {enlarged && showImage && imageUrl && memeQuery.data ? (
        <ImageLightbox
          src={imageUrl}
          alt={memeQuery.data.title}
          caption={memeQuery.data.title}
          onClose={() => setEnlarged(false)}
        />
      ) : null}
    </SectionCard>
  )
}
