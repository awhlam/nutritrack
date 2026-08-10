import { describe, expect, it } from 'vitest'
import {
  applyTimeInput,
  buildTextExport,
  carbsPerHour,
  elapsedMs,
  formatDuration,
  formatMileage,
  formatMileageNumber,
  formatRate,
  timeInputValue,
  totalCarbs,
} from './format'
import type { Entry, Session } from './types'

const HOUR = 3_600_000

function entry(partial: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    timestamp: Date.now(),
    mileage: 0,
    label: 'Energy Gel',
    carbs: 25,
    presetId: null,
    ...partial,
  }
}

function session(partial: Partial<Session> = {}): Session {
  return {
    id: 's1',
    startedAt: 0,
    endedAt: null,
    currentMileage: 0,
    entries: [],
    ...partial,
  }
}

describe('formatDuration', () => {
  it('shows minutes only under an hour', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(45 * 60_000)).toBe('45m')
  })

  it('shows hours and minutes past an hour', () => {
    expect(formatDuration(HOUR)).toBe('1h 0m')
    expect(formatDuration(2 * HOUR + 30 * 60_000)).toBe('2h 30m')
  })

  it('floors partial minutes and clamps negatives', () => {
    expect(formatDuration(90_999)).toBe('1m')
    expect(formatDuration(-5000)).toBe('0m')
  })
})

describe('formatMileageNumber', () => {
  it('renders whole miles without a decimal', () => {
    expect(formatMileageNumber(0)).toBe('0')
    expect(formatMileageNumber(12)).toBe('12')
  })

  it('keeps one decimal for fractional values', () => {
    expect(formatMileageNumber(12.5)).toBe('12.5')
  })
})

describe('formatMileage', () => {
  it('appends the unit', () => {
    expect(formatMileage(8)).toBe('8 mi')
  })

  it('renders an em dash with no unit when mileage was not recorded', () => {
    expect(formatMileage(null)).toBe('—')
  })
})

describe('totalCarbs', () => {
  it('sums carbs across entries', () => {
    expect(totalCarbs([entry({ carbs: 25 }), entry({ carbs: 27 })])).toBe(52)
  })

  it('is zero for an empty log', () => {
    expect(totalCarbs([])).toBe(0)
  })
})

describe('elapsedMs', () => {
  it('measures against now while the session is open', () => {
    expect(elapsedMs(session({ startedAt: 1000 }), 5000)).toBe(4000)
  })

  it('freezes at endedAt once the session is closed', () => {
    expect(elapsedMs(session({ startedAt: 1000, endedAt: 3000 }), 99_999)).toBe(2000)
  })

  it('never returns a negative elapsed time', () => {
    expect(elapsedMs(session({ startedAt: 5000 }), 1000)).toBe(0)
  })
})

describe('carbsPerHour', () => {
  it('returns null before a minute has elapsed, to avoid absurd extrapolation', () => {
    const s = session({ startedAt: 0, entries: [entry({ carbs: 25 })] })
    expect(carbsPerHour(s, 30_000)).toBeNull()
  })

  it('computes the hourly rate once enough time has passed', () => {
    const s = session({
      startedAt: 0,
      entries: [entry({ carbs: 30 }), entry({ carbs: 30 })],
    })
    expect(carbsPerHour(s, 2 * HOUR)).toBe(30)
  })

  it('extrapolates a partial hour', () => {
    const s = session({ startedAt: 0, entries: [entry({ carbs: 25 })] })
    expect(carbsPerHour(s, HOUR / 2)).toBe(50)
  })
})

describe('formatRate', () => {
  it('renders an em dash for an unavailable rate', () => {
    expect(formatRate(null)).toBe('—')
  })

  it('rounds to whole grams', () => {
    expect(formatRate(63.4)).toBe('63g')
  })
})

describe('time inputs', () => {
  it('round-trips a time through the input value and back', () => {
    const base = new Date(2026, 7, 10, 9, 15, 30).getTime()
    expect(timeInputValue(base)).toBe('09:15:30')
    expect(applyTimeInput(base, '09:15:30')).toBe(base)
  })

  it('applies a new time while keeping the original date', () => {
    const base = new Date(2026, 7, 10, 9, 15, 30).getTime()
    const moved = applyTimeInput(base, '11:45:00')
    const d = new Date(moved)
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(7)
    expect(d.getDate()).toBe(10)
    expect(d.getHours()).toBe(11)
    expect(d.getMinutes()).toBe(45)
    expect(d.getSeconds()).toBe(0)
  })
})

describe('buildTextExport', () => {
  const startedAt = new Date(2026, 7, 10, 8, 0, 0).getTime()
  const s = session({
    startedAt,
    endedAt: startedAt + 2 * HOUR,
    entries: [
      entry({ id: 'b', timestamp: startedAt + 45 * 60_000, mileage: 8, label: 'Banana', carbs: 27 }),
      entry({ id: 'a', timestamp: startedAt + 20 * 60_000, mileage: 3, label: 'Energy Gel', carbs: 25 }),
    ],
  })

  it('includes the summary totals', () => {
    const text = buildTextExport(s)
    expect(text).toContain('NutriTrack')
    expect(text).toContain('Duration:       2h 0m')
    expect(text).toContain('Total Carbs:    52 g')
    expect(text).toContain('Avg Carbs/hr:   26 g/hr')
    expect(text).toContain('Entries:        2')
  })

  it('lists entries in chronological order', () => {
    const text = buildTextExport(s)
    expect(text.indexOf('Energy Gel')).toBeLessThan(text.indexOf('Banana'))
  })

  it('includes each entry mileage and carbs', () => {
    const text = buildTextExport(s)
    expect(text).toContain('3 mi')
    expect(text).toContain('8 mi')
    expect(text).toContain('25g')
    expect(text).toContain('27g')
  })

  it('shows a dash for the rate when the session is too short', () => {
    const short = session({ startedAt, endedAt: startedAt + 10_000, entries: [entry()] })
    expect(buildTextExport(short)).toContain('Avg Carbs/hr:   —')
  })
})
