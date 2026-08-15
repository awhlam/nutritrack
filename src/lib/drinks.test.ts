import { describe, expect, it } from 'vitest'
import { drinkDeltaCaffeine, drinkDeltaCarbs, drinkDeltaSodium, slotPercent } from './drinks'
import type { Entry, Session } from './types'

function entry(partial: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    timestamp: 0,
    mileage: 0,
    label: 'Water',
    carbs: 0,
    caffeine: 0,
    sodium: 0,
    presetId: 'preset-water',
    ...partial,
  }
}

function session(entries: Entry[], drinkSlots: Session['drinkSlots']): Session {
  return {
    id: 's1',
    name: '',
    startedAt: 0,
    endedAt: null,
    currentMileage: 0,
    entries,
    drinkSlots,
    lastActivityAt: 0,
  }
}

const emptySlots: Session['drinkSlots'] = [
  { presetId: null, fillId: 0 },
  { presetId: null, fillId: 0 },
]

describe('slotPercent', () => {
  it('is zero with no drink entries', () => {
    const s = session([], emptySlots)
    expect(slotPercent(s, 0)).toBe(0)
  })

  it('sums percent deltas logged for that slot and fill', () => {
    const s = session(
      [
        entry({ drink: { slot: 0, fillId: 0, percent: 25 } }),
        entry({ drink: { slot: 0, fillId: 0, percent: 25 } }),
      ],
      emptySlots,
    )
    expect(slotPercent(s, 0)).toBe(50)
  })

  it('does not double count across two independent logs — each entry is a delta, not a running total', () => {
    // Three separate quarter-taps should sum to 75, not be misread as 25+50+75=150.
    const s = session(
      [
        entry({ drink: { slot: 0, fillId: 0, percent: 25 } }),
        entry({ drink: { slot: 0, fillId: 0, percent: 25 } }),
        entry({ drink: { slot: 0, fillId: 0, percent: 25 } }),
      ],
      emptySlots,
    )
    expect(slotPercent(s, 0)).toBe(75)
  })

  it('ignores entries from the other slot', () => {
    const s = session(
      [
        entry({ drink: { slot: 0, fillId: 0, percent: 50 } }),
        entry({ drink: { slot: 1, fillId: 0, percent: 40 } }),
      ],
      emptySlots,
    )
    expect(slotPercent(s, 0)).toBe(50)
    expect(slotPercent(s, 1)).toBe(40)
  })

  it('ignores entries from a previous fill after a refill bumped fillId', () => {
    const s = session(
      [
        entry({ drink: { slot: 0, fillId: 0, percent: 100 } }), // finished the first bottle
        entry({ drink: { slot: 0, fillId: 1, percent: 25 } }), // a quarter into the new one
      ],
      [{ presetId: 'preset-water', fillId: 1 }, emptySlots[1]],
    )
    expect(slotPercent(s, 0)).toBe(25)
  })

  it('recovers automatically when an over-logged entry is deleted, with no separate state to desync', () => {
    // Simulates: log 25%, mistakenly log 75% (=100 total), then delete the mistaken entry.
    const withMistake = session(
      [
        entry({ id: 'a', drink: { slot: 0, fillId: 0, percent: 25 } }),
        entry({ id: 'b', drink: { slot: 0, fillId: 0, percent: 75 } }),
      ],
      emptySlots,
    )
    expect(slotPercent(withMistake, 0)).toBe(100)

    const afterDelete = session(
      withMistake.entries.filter((e) => e.id !== 'b'),
      emptySlots,
    )
    expect(slotPercent(afterDelete, 0)).toBe(25)
  })

  it('clamps to 100 even if logged deltas would exceed it', () => {
    const s = session(
      [
        entry({ drink: { slot: 0, fillId: 0, percent: 80 } }),
        entry({ drink: { slot: 0, fillId: 0, percent: 80 } }),
      ],
      emptySlots,
    )
    expect(slotPercent(s, 0)).toBe(100)
  })

  it('ignores non-drink entries entirely', () => {
    const s = session(
      [entry({ drink: undefined, carbs: 25, label: 'Energy Gel', presetId: 'preset-gel' })],
      emptySlots,
    )
    expect(slotPercent(s, 0)).toBe(0)
  })
})

describe('drinkDeltaCarbs', () => {
  it('computes the proportional share of the container', () => {
    expect(drinkDeltaCarbs(60, 25)).toBe(15)
    expect(drinkDeltaCarbs(60, 100)).toBe(60)
  })

  it('is zero for a zero-carb drink like plain water', () => {
    expect(drinkDeltaCarbs(0, 50)).toBe(0)
  })
})

describe('drinkDeltaCaffeine', () => {
  it('computes the proportional share of the container', () => {
    expect(drinkDeltaCaffeine(80, 25)).toBe(20)
    expect(drinkDeltaCaffeine(80, 100)).toBe(80)
  })

  it('is zero for a caffeine-free drink', () => {
    expect(drinkDeltaCaffeine(0, 50)).toBe(0)
  })
})

describe('drinkDeltaSodium', () => {
  it('computes the proportional share of the container', () => {
    expect(drinkDeltaSodium(400, 25)).toBe(100)
    expect(drinkDeltaSodium(400, 100)).toBe(400)
  })

  it('is zero for a sodium-free drink', () => {
    expect(drinkDeltaSodium(0, 50)).toBe(0)
  })
})
