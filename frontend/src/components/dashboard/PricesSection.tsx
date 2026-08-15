import { SectionCard } from '../common/SectionCard'
import { Skeleton } from '../common/Skeleton'
import { useCoinPrices } from '../../hooks/dashboard/useCoinPrices'
import { formatMoney } from '../../utils/formatMoney'
import { formatPercent } from '../../utils/formatPercent'
import { SectionEmpty, SectionError } from './SectionStatus'
import { VoteControls } from './VoteControls'

export function PricesSectionSkeleton() {
  return (
    <ul
      className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] sm:gap-6"
      aria-hidden="true"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <li key={index} className="space-y-2">
          <Skeleton className="h-3 w-10" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-14" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function PricesSection() {
  const pricesQuery = useCoinPrices()

  return (
    <SectionCard title="Prices" compact>
      {pricesQuery.isPending ? <PricesSectionSkeleton /> : null}

      {pricesQuery.isError ? (
        <SectionError onRetry={() => pricesQuery.refetch()}>
          Prices are unavailable right now. Please try again.
        </SectionError>
      ) : null}

      {pricesQuery.data && pricesQuery.data.prices.length === 0 ? (
        <SectionEmpty>
          No prices to show right now. Market data may be temporarily unavailable.
        </SectionEmpty>
      ) : null}

      {pricesQuery.data && pricesQuery.data.prices.length > 0 ? (
        <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] sm:divide-y-0 sm:gap-x-8 sm:gap-y-3">
          {pricesQuery.data.prices.map((price) => {
            const change = formatPercent(price.change_24h)
            const changeClass =
              price.change_24h === null
                ? 'text-muted'
                : price.change_24h >= 0
                  ? 'text-up'
                  : 'text-down'

            return (
              <li
                key={price.symbol}
                className="flex min-w-0 items-baseline justify-between gap-4 py-2 first:pt-0 last:pb-0 sm:block sm:py-0"
              >
                <span className="font-mono text-xs font-medium tracking-wide text-muted">
                  {price.symbol}
                </span>
                <div className="flex min-w-0 items-baseline gap-3 sm:mt-1">
                  <span className="font-mono text-base tabular-nums">
                    {formatMoney(price.price_usd)}
                  </span>
                  <span
                    className={`font-mono text-sm tabular-nums ${changeClass}`}
                  >
                    {change}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      ) : null}

      {pricesQuery.data?.feedback ? (
        <div className="mt-3 border-t border-border pt-3">
          <VoteControls feedback={pricesQuery.data.feedback} />
        </div>
      ) : null}
    </SectionCard>
  )
}
