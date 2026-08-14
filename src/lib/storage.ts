import type { DrinkSlot, Preset, Session } from './types'

const PRESETS_KEY = 'nutritrack:presets'
const SESSIONS_KEY = 'nutritrack:sessions'
const ACTIVE_SESSION_KEY = 'nutritrack:activeSessionId'
const PRESET_MIGRATION_KEY = 'nutritrack:presetMigrationVersion'

export const DEFAULT_PRESETS: Preset[] = [
  { id: 'preset-gel', label: 'Energy Gel', carbs: 30, caffeine: 0, color: '#f59e0b', kind: 'item' },
  { id: 'preset-water', label: 'Water', carbs: 0, caffeine: 0, color: '#38bdf8', kind: 'drink' },
  { id: 'preset-carb-mix', label: 'Carb Drink Mix', carbs: 50, caffeine: 0, color: '#3b82f6', kind: 'drink' },
]

/**
 * One-time, versioned adjustments to specific default-id presets, so a browser
 * that already saved presets before these defaults changed picks them up too
 * — not just fresh installs. Each step only touches the exact ids it names,
 * runs once (guarded by the stored version), and never re-touches a preset
 * a user re-creates under the same id later.
 */
const PRESET_MIGRATIONS: { version: number; apply: (presets: Preset[]) => Preset[] }[] = [
  {
    version: 1,
    apply: (presets) =>
      presets
        .map((p) => {
          if (p.id === 'preset-gel') return { ...p, carbs: 30 }
          if (p.id === 'preset-carb-mix') return { ...p, carbs: 50 }
          return p
        })
        .filter((p) => !['preset-banana', 'preset-chews', 'preset-sports-drink'].includes(p.id)),
  },
]

function emptyDrinkSlot(): DrinkSlot {
  return { presetId: null, fillId: 0 }
}

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

/** Backfills fields added after a user may already have data saved, so old localStorage keeps working. */
function normalizePreset(preset: Preset): Preset {
  return { ...preset, kind: preset.kind ?? 'item', caffeine: preset.caffeine ?? 0 }
}

function normalizeSession(session: Session): Session {
  const slots = session.drinkSlots
  return {
    ...session,
    name: session.name ?? '',
    drinkSlots: [slots?.[0] ?? emptyDrinkSlot(), slots?.[1] ?? emptyDrinkSlot()],
    entries: session.entries.map((e) => ({ ...e, caffeine: e.caffeine ?? 0 })),
    // Backfill for sessions saved before activity tracking existed — including a
    // stuck-open session, whose most recent entry (or its start time, if none)
    // is the best guess at when it actually ended.
    lastActivityAt:
      session.lastActivityAt ??
      Math.max(
        session.startedAt,
        session.endedAt ?? 0,
        ...session.entries.map((e) => e.timestamp),
      ),
  }
}

export function migratePresets(presets: Preset[]): Preset[] {
  const appliedVersion = Number(localStorage.getItem(PRESET_MIGRATION_KEY) ?? '0')
  const pending = PRESET_MIGRATIONS.filter((m) => m.version > appliedVersion)
  if (pending.length === 0) return presets

  const migrated = pending.reduce((acc, m) => m.apply(acc), presets)
  const latestVersion = Math.max(...PRESET_MIGRATIONS.map((m) => m.version))
  localStorage.setItem(PRESET_MIGRATION_KEY, String(latestVersion))
  return migrated
}

export function loadPresets(): Preset[] {
  return migratePresets(read<Preset[]>(PRESETS_KEY, DEFAULT_PRESETS).map(normalizePreset))
}

export function savePresets(presets: Preset[]) {
  write(PRESETS_KEY, presets)
}

export function loadSessions(): Session[] {
  return read<Session[]>(SESSIONS_KEY, []).map(normalizeSession)
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
