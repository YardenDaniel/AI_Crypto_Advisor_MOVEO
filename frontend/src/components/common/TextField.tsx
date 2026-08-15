import type { InputHTMLAttributes, ReactNode } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  trailing?: ReactNode
}

export function TextField({
  id,
  label,
  error,
  trailing,
  className = '',
  ...props
}: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${fieldId}-error`

  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <label htmlFor={fieldId} className="font-medium text-text">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-errormessage={error ? errorId : undefined}
          {...props}
          className={`h-11 w-full rounded-[var(--radius-sm)] border bg-surface px-3 text-text placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 ${
            trailing ? 'pr-11' : ''
          } ${error ? 'border-danger' : 'border-border'} ${className}`}
        />
        {trailing ? (
          <div className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? (
        <span id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </div>
  )
}
