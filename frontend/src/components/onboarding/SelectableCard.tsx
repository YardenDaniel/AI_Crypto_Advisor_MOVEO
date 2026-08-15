type SelectableCardProps = {
  label: string
  description?: string
  selected: boolean
  onSelect: () => void
  selectionType: 'multiple' | 'single'
}

export function SelectableCard({
  label,
  description,
  selected,
  onSelect,
  selectionType,
}: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selectionType === 'multiple' ? selected : undefined}
      role={selectionType === 'single' ? 'radio' : undefined}
      aria-checked={selectionType === 'single' ? selected : undefined}
      className={`min-h-14 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors ${
        selected
          ? 'border-accent bg-accent/10'
          : 'border-border bg-surface hover:bg-card-hover'
      }`}
    >
      <span className="block font-medium text-text">{label}</span>
      {description ? (
        <span className="mt-1 block text-sm text-muted">{description}</span>
      ) : null}
    </button>
  )
}
