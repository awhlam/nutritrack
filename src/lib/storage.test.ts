import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_PRESETS, loadPresets, migratePresets, savePresets } from './storage'
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
