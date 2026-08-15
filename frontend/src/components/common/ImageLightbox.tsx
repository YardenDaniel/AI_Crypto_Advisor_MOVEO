import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ImageLightboxProps = {
  src: string
  alt: string
  caption?: string
  onClose: () => void
}

export function ImageLightbox({
  src,
  alt,
  caption,
  onClose,
}: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      trigger?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 md:p-8"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={alt}
        className="flex max-h-full w-full max-w-3xl flex-col items-center gap-3"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close image"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-[var(--radius-sm)] border border-border bg-card text-muted transition-colors hover:bg-card-hover hover:text-text"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <img
          src={src}
          alt={alt}
          className="max-h-[75svh] w-auto max-w-full rounded-[var(--radius-md)] object-contain"
        />
        {caption ? (
          <p className="max-w-full break-words text-center text-sm text-muted">
            {caption}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
