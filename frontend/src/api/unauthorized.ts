type UnauthorizedHandler = () => void

let handler: UnauthorizedHandler | null = null
let handling = false

export function setUnauthorizedHandler(next: UnauthorizedHandler | null): void {
  handler = next
}

export function resetUnauthorizedHandling(): void {
  handling = false
}

export function notifyUnauthorized(): void {
  if (handling || !handler) {
    return
  }

  handling = true
  handler()
}
