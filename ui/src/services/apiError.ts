export function isZodError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as { name?: unknown }).name === 'ZodError' &&
    Array.isArray((err as { issues?: unknown }).issues)
  )
}

export function toErrorMessage(err: unknown, fallback: string): string {
  if (isZodError(err)) {
    return 'Received unexpected data from the server.'
  }
  return err instanceof Error ? err.message : fallback
}

export async function readErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message ?? `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}
