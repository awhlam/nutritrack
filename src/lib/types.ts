export type PresetKind = 'item' | 'drink'

export interface Preset {
  id: string
  label: string
  /** Carbs per serving for an 'item' preset; total carbs in the full container for a 'drink' preset. */
  carbs: number
  /** Caffeine (mg), same per-serving/per-container convention as carbs. */
  caffeine: number
  color: string
  kind: PresetKind
}

export interface DrinkEntryInfo {
  slot: 0 | 1
  /** Which fill of the bottle this belongs to — bumped on reassign/refill so a new bottle starts its progress over. */
  fillId: number
  /** The percentage of the container consumed by this log event (a delta, not a running total). */
  percent: number
}

export interface Entry {
  id: string
  timestamp: number
  mileage: number | null
  label: string
  /** null = carb count not entered yet ("figure it out later"). */
  carbs: number | null
  /** Caffeine (mg). Unlike carbs, always a known number — defaults to 0 rather than pending. */
  caffeine: number
  presetId: string | null
  drink?: DrinkEntryInfo
}

export interface DrinkSlot {
  presetId: string | null
  fillId: number
}

export interface Session {
  id: string
  /** Optional event name (e.g. "Boston Marathon"). Empty string = unnamed. */
  name: string
  startedAt: number
  endedAt: number | null
  currentMileage: number
  entries: Entry[]
  drinkSlots: [DrinkSlot, DrinkSlot]
  /** Bumped on start and on every entry/edit; used to auto-end a session left running with no activity. */
  lastActivityAt: number
}
