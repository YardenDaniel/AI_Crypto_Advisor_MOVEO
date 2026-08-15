import { ExternalLink } from 'lucide-react'
import { Badge } from '../common/Badge'
import { SectionCard } from '../common/SectionCard'
import { Skeleton } from '../common/Skeleton'
import { useMarketNews } from '../../hooks/dashboard/useMarketNews'
import { formatDate } from '../../utils/formatDate'
import type { MarketNewsItem } from '../../types/dashboard'
import { SectionEmpty, SectionError } from './SectionStatus'
import { VoteControls } from './VoteControls'

export function NewsSectionSkeleton() {
  return (
    <ul className="divide-y divide-border" aria-hidden="true">
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="py-4 first:pt-0 last:pb-0">
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

function NewsItem({ item }: { item: MarketNewsItem }) {
  const published = formatDate(item.published_at)
  const titleClass = 'break-words font-semibold leading-snug text-text'

  return (
    <article className="min-w-0 border-b border-border py-5 first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1 basis-64">
          <h3 className="text-[0.95rem] md:text-base">
            {item.url ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`${titleClass} inline-flex items-start gap-1.5 hover:text-accent`}
              >
                <span>{item.title}</span>
                <ExternalLink
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            ) : (
              <span className={titleClass}>{item.title}</span>
            )}
          </h3>
          <p className="mt-1.5 text-xs text-muted md:text-sm">
            {item.source.title}
            {published ? ` · ${published}` : ''}
          </p>
        </div>
        {item.instruments.length > 0 ? (
          <div className="flex shrink-0 flex-wrap gap-1.5 sm:justify-end">
            {item.instruments.map((instrument) => (
              <Badge key={instrument.code}>{instrument.code}</Badge>
            ))}
          </div>
        ) : null}
      </div>
      {item.description ? (
        <p className="mt-2 max-w-3xl break-words text-sm leading-relaxed text-muted">
          {item.description}
        </p>
      ) : null}
      {item.feedback ? (
        <VoteControls feedback={item.feedback} className="mt-3" />
      ) : null}
    </article>
  )
}

export function NewsSection() {
  const newsQuery = useMarketNews()

  return (
    <SectionCard title="Market News">
      {newsQuery.isPending ? <NewsSectionSkeleton /> : null}

      {newsQuery.isError ? (
        <SectionError onRetry={() => newsQuery.refetch()}>
          Market news is unavailable right now. Please try again.
        </SectionError>
      ) : null}

      {newsQuery.data && newsQuery.data.news.length === 0 ? (
        <SectionEmpty>No market news to show right now.</SectionEmpty>
      ) : null}

      {newsQuery.data && newsQuery.data.news.length > 0 ? (
        <div>
          {newsQuery.data.news.map((item) => (
            <NewsItem key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </SectionCard>
  )
}
