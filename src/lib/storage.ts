import type { Preset, Session } from './types'

const PRESETS_KEY = 'nutritrack:presets'
const SESSIONS_KEY = 'nutritrack:sessions'
const ACTIVE_SESSION_KEY = 'nutritrack:activeSessionId'

export const DEFAULT_PRESETS: Preset[] = [
  { id: 'preset-gel', label: 'Energy Gel', carbs: 25, color: '#f59e0b' },
  { id: 'preset-banana', label: 'Banana', carbs: 27, color: '#eab308' },
  { id: 'preset-chews', label: 'Chews', carbs: 24, color: '#f97316' },
  { id: 'preset-sports-drink', label: 'Sports Drink (bottle)', carbs: 36, color: '#3b82f6' },
]

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function loadPresets(): Preset[] {
  return read<Preset[]>(PRESETS_KEY, DEFAULT_PRESETS)
}

export function savePresets(presets: Preset[]) {
  write(PRESETS_KEY, presets)
}

export function loadSessions(): Session[] {
  return read<Session[]>(SESSIONS_KEY, [])
}

export function saveSessions(sessions: Session[]) {
  write(SESSIONS_KEY, sessions)
}

export function loadActiveSessionId(): string | null {
  return read<string | null>(ACTIVE_SESSION_KEY, null)
}

export function saveActiveSessionId(id: string | null) {
  write(ACTIVE_SESSION_KEY, id)
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
