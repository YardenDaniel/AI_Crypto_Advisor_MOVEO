import type { InputHTMLAttributes } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
}

export function TextField({
  id,
  label,
  error,
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
      <input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-errormessage={error ? errorId : undefined}
        {...props}
        className={`h-11 rounded-[var(--radius-sm)] border bg-surface px-3 text-text placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-50 ${
          error ? 'border-danger' : 'border-border'
        } ${className}`}
      />
      {error ? (
        <span id={errorId} role="alert" className="text-sm text-danger">
          {error}
        </span>
      ) : null}
    </div>
  )
}
