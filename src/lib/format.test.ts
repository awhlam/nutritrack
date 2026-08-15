import { describe, expect, it } from 'vitest'
import {
  applyTimeInput,
  buildTextExport,
  carbsPerHour,
  elapsedMs,
  formatCaffeine,
  formatCarbs,
  formatDuration,
  formatMileage,
  formatMileageNumber,
  formatOptionalExtras,
  formatRate,
  formatSodium,
  pendingCarbsCount,
  timeInputValue,
  totalCaffeine,
  totalCarbs,
  totalSodium,
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
    caffeine: 0,
    sodium: 0,
    presetId: null,
    ...partial,
  }
}

function session(partial: Partial<Session> = {}): Session {
  return {
    id: 's1',
    name: '',
    startedAt: 0,
    endedAt: null,
    currentMileage: 0,
    entries: [],
    drinkSlots: [
      { presetId: null, fillId: 0 },
      { presetId: null, fillId: 0 },
    ],
    lastActivityAt: 0,
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

  it('treats a pending (null) carb count as excluded, not zero-and-silent', () => {
    expect(totalCarbs([entry({ carbs: 25 }), entry({ carbs: null })])).toBe(25)
  })
})

describe('pendingCarbsCount', () => {
  it('counts entries with no carb count yet', () => {
    expect(pendingCarbsCount([entry({ carbs: 25 }), entry({ carbs: null }), entry({ carbs: null })])).toBe(2)
  })

  it('is zero when every entry has a carb count', () => {
    expect(pendingCarbsCount([entry({ carbs: 25 })])).toBe(0)
  })
})

describe('formatCarbs', () => {
  it('rounds a known carb count', () => {
    expect(formatCarbs(24.6)).toBe('25g')
  })

  it('renders a question mark for a pending entry', () => {
    expect(formatCarbs(null)).toBe('?')
  })
})

describe('totalCaffeine', () => {
  it('sums caffeine across entries', () => {
    expect(totalCaffeine([entry({ caffeine: 25 }), entry({ caffeine: 15 })])).toBe(40)
  })

  it('is zero for an empty log or entries with no caffeine', () => {
    expect(totalCaffeine([])).toBe(0)
    expect(totalCaffeine([entry({ caffeine: 0 })])).toBe(0)
  })
})

describe('formatCaffeine', () => {
  it('rounds and appends the unit', () => {
    expect(formatCaffeine(24.6)).toBe('25mg')
  })
})

describe('totalSodium', () => {
  it('sums sodium across entries', () => {
    expect(totalSodium([entry({ sodium: 100 }), entry({ sodium: 50 })])).toBe(150)
  })

  it('is zero for an empty log or entries with no sodium', () => {
    expect(totalSodium([])).toBe(0)
    expect(totalSodium([entry({ sodium: 0 })])).toBe(0)
  })
})

describe('formatSodium', () => {
  it('rounds and appends the unit', () => {
    expect(formatSodium(149.6)).toBe('150mg')
  })
})

describe('formatOptionalExtras', () => {
  it('is empty when neither caffeine nor sodium is tracked', () => {
    expect(formatOptionalExtras(0, 0)).toBe('')
  })

  it('shows only caffeine when sodium is unset', () => {
    expect(formatOptionalExtras(25, 0)).toBe('25mg caffeine')
  })

  it('shows only sodium when caffeine is unset', () => {
    expect(formatOptionalExtras(0, 150)).toBe('150mg sodium')
  })

  it('joins both when both are tracked', () => {
    expect(formatOptionalExtras(25, 150)).toBe('25mg caffeine · 150mg sodium')
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

  it('omits the Total Caffeine and Total Sodium lines when neither is tracked', () => {
    const text = buildTextExport(s)
    expect(text).not.toContain('Total Caffeine')
    expect(text).not.toContain('Total Sodium')
  })

  it('includes the total caffeine and sodium across entries, only when used', () => {
    const withExtras = session({
      startedAt,
      endedAt: startedAt + HOUR,
      entries: [
        entry({ caffeine: 25, sodium: 100 }),
        entry({ caffeine: 15, sodium: 50 }),
      ],
    })
    const text = buildTextExport(withExtras)
    expect(text).toContain('Total Caffeine: 40 mg')
    expect(text).toContain('Total Sodium:   150 mg')
  })

  it('includes each entry caffeine/sodium amount in the table, only when nonzero', () => {
    const withExtras = session({
      startedAt,
      endedAt: startedAt + HOUR,
      entries: [entry({ label: 'Energy Gel', caffeine: 25, sodium: 100 })],
    })
    expect(buildTextExport(withExtras)).toMatch(/Energy Gel\s+25g\s+25mg caffeine · 100mg sodium/)
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

  it('includes the event name in the heading when the session is named', () => {
    const named = session({ startedAt, endedAt: startedAt + HOUR, name: 'Boston Marathon' })
    expect(buildTextExport(named)).toContain('NutriTrack — Boston Marathon')
  })

  it('falls back to the plain heading when the session has no name', () => {
    const unnamed = session({ startedAt, endedAt: startedAt + HOUR, name: '' })
    const text = buildTextExport(unnamed)
    expect(text.split('\n')[0]).toBe('NutriTrack')
  })

  it('flags pending entries and shows a question mark instead of silently zeroing them', () => {
    const withPending = session({
      startedAt,
      endedAt: startedAt + HOUR,
      entries: [entry({ carbs: 25 }), entry({ label: 'Aid station snack', carbs: null })],
    })
    const text = buildTextExport(withPending)
    expect(text).toContain('excludes pending entries')
    expect(text).toContain('Aid station snack')
    expect(text).toMatch(/Aid station snack\s+\?/)
    expect(text).toContain('Total Carbs:    25 g')
  })

  it('shows the percent consumed for a drink log', () => {
    const withDrink = session({
      startedAt,
      endedAt: startedAt + HOUR,
      entries: [entry({ label: 'Water', carbs: 9, drink: { slot: 0, fillId: 1, percent: 25 } })],
    })
    expect(buildTextExport(withDrink)).toContain('Water (+25%)')
  })
})
