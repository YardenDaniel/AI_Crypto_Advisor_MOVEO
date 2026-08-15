export class ApiError extends Error {
  readonly status: number
  readonly detail: unknown

  constructor(status: number, message: string, detail: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}

type FastApiValidationItem = {
  loc?: unknown[]
  msg?: string
  type?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function getErrorMessageFromDetail(detail: unknown): string {
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (isRecord(item) && typeof item.msg === 'string') {
          return item.msg
        }
        return null
      })
      .filter((message): message is string => Boolean(message))

    if (messages.length > 0) {
      return messages.join('. ')
    }
  }

  return 'Something went wrong. Please try again.'
}

export function parseApiError(status: number, payload: unknown): ApiError {
  const detail = isRecord(payload) ? payload.detail : payload
  const message = getErrorMessageFromDetail(detail) || `Request failed (${status})`

  return new ApiError(status, message, detail ?? payload)
}

export function isValidationError(
  detail: unknown,
): detail is FastApiValidationItem[] {
  return Array.isArray(detail)
}
