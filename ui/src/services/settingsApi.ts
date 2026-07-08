import { settingsSchema } from 'shared'
import type { Settings, UpdateSettingsInput } from 'shared'
import { readErrorMessage } from './apiError'

const API_BASE = '/settings'

export async function getSettings(): Promise<Settings> {
  const response = await fetch(API_BASE)
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return settingsSchema.parse(await response.json())
}

export async function updateSettings(input: UpdateSettingsInput): Promise<Settings> {
  const response = await fetch(API_BASE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }
  return settingsSchema.parse(await response.json())
}
