import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatBar } from './StatBar'
import type { Entry, Session } from '../lib/types'

const HOUR = 3_600_000

function entry(partial: Partial<Entry> = {}): Entry {
  return {
    id: 'e1',
    timestamp: 0,
    mileage: 0,
    label: 'Gel',
    carbs: 25,
    caffeine: 0,
    sodium: 0,
    presetId: null,
    ...partial,
  }
}

function session(overrides: Partial<Session> = {}): Session {
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
    ...overrides,
  }
}

describe('StatBar', () => {
  it('always shows Elapsed and Carbs, with carbs/hr folded into the Carbs card', () => {
    render(<StatBar session={session({ entries: [entry({ carbs: 60 })] })} now={2 * HOUR} />)
    expect(screen.getByText('Elapsed')).toBeTruthy()
    expect(screen.getByText('Carbs')).toBeTruthy()
    expect(screen.getByText('60g')).toBeTruthy()
    expect(screen.getByText('30g/hr')).toBeTruthy()
  })

  it('never wraps a stat value onto a second line, even for a multi-day elapsed time', () => {
    const s = session({ startedAt: 0 })
    render(<StatBar session={s} now={108 * HOUR + 59 * 60_000} />)
    const value = screen.getByText('108h 59m')
    expect(value.className).toContain('whitespace-nowrap')
  })

  it('shows no caffeine/sodium stat cards when neither is tracked', () => {
    const untracked = session({ entries: [entry({ carbs: 25, caffeine: 0, sodium: 0 })] })
    render(<StatBar session={untracked} now={0} />)
    expect(screen.queryByText('Caffeine')).toBeNull()
    expect(screen.queryByText('Sodium')).toBeNull()
  })

  it('shows caffeine and sodium as their own compact total+rate cards once tracked', () => {
    const tracked = session({ entries: [entry({ carbs: 25, caffeine: 25, sodium: 150 })] })
    render(<StatBar session={tracked} now={2 * HOUR} />)
    expect(screen.getByText('Caffeine')).toBeTruthy()
    expect(screen.getByText('25mg')).toBeTruthy()
    expect(screen.getByText('13mg/hr')).toBeTruthy()
    expect(screen.getByText('Sodium')).toBeTruthy()
    expect(screen.getByText('150mg')).toBeTruthy()
    expect(screen.getByText('75mg/hr')).toBeTruthy()
  })

  it('shows only the tracked one when just caffeine or just sodium is used', () => {
    const caffeineOnly = session({ entries: [entry({ carbs: 25, caffeine: 25, sodium: 0 })] })
    render(<StatBar session={caffeineOnly} now={0} />)
    expect(screen.getByText('Caffeine')).toBeTruthy()
    expect(screen.queryByText('Sodium')).toBeNull()
  })

  it('shows a dash for the rate before enough time has elapsed to extrapolate', () => {
    render(<StatBar session={session({ entries: [entry({ carbs: 25, caffeine: 25 })] })} now={30_000} />)
    expect(screen.getAllByText('—/hr').length).toBeGreaterThan(0)
  })
})
