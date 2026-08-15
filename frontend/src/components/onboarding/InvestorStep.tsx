import type { InvestorType } from '../../types/preferences'
import { INVESTOR_OPTIONS } from './options'
import { SelectableCard } from './SelectableCard'

type InvestorStepProps = {
  selected: InvestorType | null
  onSelect: (investorType: InvestorType) => void
}

export function InvestorStep({ selected, onSelect }: InvestorStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">
        How do you invest?
      </h2>
      <p className="mt-2 text-sm text-muted">Pick the profile that fits you best.</p>
      <div
        role="radiogroup"
        aria-label="Investor type"
        className="mt-5 grid gap-3 md:grid-cols-3"
      >
        {INVESTOR_OPTIONS.map((option) => (
          <SelectableCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={selected === option.value}
            onSelect={() => onSelect(option.value)}
            selectionType="single"
          />
        ))}
      </div>
    </div>
  )
}
