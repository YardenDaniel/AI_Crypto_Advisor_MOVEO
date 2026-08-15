import type { AssetSymbol } from '../../types/preferences'
import { ASSET_OPTIONS } from './options'
import { SelectableCard } from './SelectableCard'

type AssetStepProps = {
  selected: AssetSymbol[]
  onToggle: (asset: AssetSymbol) => void
}

export function AssetStep({ selected, onToggle }: AssetStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">
        Which assets do you follow?
      </h2>
      <p className="mt-2 text-sm text-muted">Choose at least one.</p>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {ASSET_OPTIONS.map((option) => (
          <SelectableCard
            key={option.value}
            label={option.label}
            description={option.description}
            selected={selected.includes(option.value)}
            onSelect={() => onToggle(option.value)}
            selectionType="multiple"
          />
        ))}
      </div>
    </div>
  )
}
