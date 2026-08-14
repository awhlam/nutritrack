import { beforeEach, describe, expect, it } from 'vitest'
import {
  DEFAULT_PRESETS,
  loadPresets,
  loadSessions,
  migratePresets,
  savePresets,
} from './storage'
import type { Preset } from './types'

beforeEach(() => {
  localStorage.clear()
})

function preset(partial: Partial<Preset> = {}): Preset {
  return { id: 'p1', label: 'Something', carbs: 10, color: '#000000', kind: 'item', ...partial }
}

describe('DEFAULT_PRESETS', () => {
  it('seeds exactly Energy Gel, Water, and Carb Drink Mix for a fresh install', () => {
    expect(DEFAULT_PRESETS.map((p) => p.id).sort()).toEqual(
      ['preset-carb-mix', 'preset-gel', 'preset-water'].sort(),
    )
  })

  it('defaults Energy Gel to 30g and Carb Drink Mix to 50g', () => {
    expect(DEFAULT_PRESETS.find((p) => p.id === 'preset-gel')?.carbs).toBe(30)
    expect(DEFAULT_PRESETS.find((p) => p.id === 'preset-carb-mix')?.carbs).toBe(50)
  })
})

describe('migratePresets', () => {
  it('updates a saved Energy Gel to 30g and Carb Drink Mix to 50g', () => {
    const saved = [
      preset({ id: 'preset-gel', label: 'Energy Gel', carbs: 25 }),
      preset({ id: 'preset-carb-mix', label: 'Carb Drink Mix', carbs: 60, kind: 'drink' }),
    ]
    const migrated = migratePresets(saved)
    expect(migrated.find((p) => p.id === 'preset-gel')?.carbs).toBe(30)
    expect(migrated.find((p) => p.id === 'preset-carb-mix')?.carbs).toBe(50)
  })

  it('removes the old banana/chews/sports-drink defaults by id', () => {
    const saved = [
      preset({ id: 'preset-gel' }),
      preset({ id: 'preset-banana', label: 'Banana' }),
      preset({ id: 'preset-chews', label: 'Chews' }),
      preset({ id: 'preset-sports-drink', label: 'Sports Drink (bottle)' }),
    ]
    const migrated = migratePresets(saved)
    expect(migrated.map((p) => p.id)).toEqual(['preset-gel'])
  })

  it('leaves presets the user created under other ids untouched', () => {
    const saved = [preset({ id: 'preset-gel' }), preset({ id: 'user-waffle', label: 'Waffle', carbs: 21 })]
    const migrated = migratePresets(saved)
    expect(migrated.find((p) => p.id === 'user-waffle')).toEqual(saved[1])
  })

  it('only runs once — reapplying does not re-touch a preset the user restores under the same id', () => {
    const saved = [preset({ id: 'preset-gel', carbs: 25 })]
    migratePresets(saved) // marks the migration version as applied

    // User manually re-adds a "Banana" preset with the old id after the migration ran once.
    const later = [preset({ id: 'preset-gel', carbs: 30 }), preset({ id: 'preset-banana', label: 'Banana' })]
    const result = migratePresets(later)
    expect(result).toEqual(later)
  })

  it('is a no-op for a fresh set of defaults', () => {
    expect(migratePresets(DEFAULT_PRESETS)).toEqual(DEFAULT_PRESETS)
  })
})

describe('loadPresets', () => {
  it('applies the migration to whatever was actually saved', () => {
    savePresets([preset({ id: 'preset-gel', carbs: 25 }), preset({ id: 'preset-chews', label: 'Chews' })])
    const loaded = loadPresets()
    expect(loaded.map((p) => p.id)).toEqual(['preset-gel'])
    expect(loaded[0].carbs).toBe(30)
  })
})

describe('loadSessions', () => {
  it('backfills name as an empty string for sessions saved before naming existed', () => {
    const oldSession = {
      id: 's1',
      startedAt: 0,
      endedAt: null,
      currentMileage: 0,
      entries: [],
      drinkSlots: [
        { presetId: null, fillId: 0 },
        { presetId: null, fillId: 0 },
      ],
      // no `name` field — simulates data saved before this feature existed
    }
    localStorage.setItem('nutritrack:sessions', JSON.stringify([oldSession]))
    const loaded = loadSessions()
    expect(loaded[0].name).toBe('')
  })

  it('preserves an existing name', () => {
    const named = {
      id: 's1',
      name: 'Boston Marathon',
      startedAt: 0,
      endedAt: null,
      currentMileage: 0,
      entries: [],
      drinkSlots: [
        { presetId: null, fillId: 0 },
        { presetId: null, fillId: 0 },
      ],
    }
    localStorage.setItem('nutritrack:sessions', JSON.stringify([named]))
    expect(loadSessions()[0].name).toBe('Boston Marathon')
  })

  it('backfills lastActivityAt from the most recent entry, for sessions saved before activity tracking existed', () => {
    const oldSession = {
      id: 's1',
      name: '',
      startedAt: 1000,
      endedAt: null,
      currentMileage: 0,
      entries: [{ id: 'e1', timestamp: 5000, mileage: 1, label: 'Gel', carbs: 25, presetId: null }],
      drinkSlots: [
        { presetId: null, fillId: 0 },
        { presetId: null, fillId: 0 },
      ],
      // no `lastActivityAt` field — simulates data saved before this feature existed
    }
    localStorage.setItem('nutritrack:sessions', JSON.stringify([oldSession]))
    expect(loadSessions()[0].lastActivityAt).toBe(5000)
  })

  it('backfills lastActivityAt from startedAt when there are no entries', () => {
    const oldSession = {
      id: 's1',
      name: '',
      startedAt: 1000,
      endedAt: null,
      currentMileage: 0,
      entries: [],
      drinkSlots: [
        { presetId: null, fillId: 0 },
        { presetId: null, fillId: 0 },
      ],
    }
    localStorage.setItem('nutritrack:sessions', JSON.stringify([oldSession]))
    expect(loadSessions()[0].lastActivityAt).toBe(1000)
  })

  it('preserves an existing lastActivityAt', () => {
    const session = {
      id: 's1',
      name: '',
      startedAt: 1000,
      endedAt: null,
      currentMileage: 0,
      entries: [],
      drinkSlots: [
        { presetId: null, fillId: 0 },
        { presetId: null, fillId: 0 },
      ],
      lastActivityAt: 4242,
    }
    localStorage.setItem('nutritrack:sessions', JSON.stringify([session]))
    expect(loadSessions()[0].lastActivityAt).toBe(4242)
  })
})
