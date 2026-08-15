import type { ContentType } from '../../types/preferences'
import { CONTENT_OPTIONS } from './options'
import { SelectableCard } from './SelectableCard'

type ContentStepProps = {
  selected: ContentType[]
  onToggle: (contentType: ContentType) => void
}

export function ContentStep({ selected, onToggle }: ContentStepProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight">
        What should your briefing include?
      </h2>
      <p className="mt-2 text-sm text-muted">Choose at least one content type.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {CONTENT_OPTIONS.map((option) => (
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
