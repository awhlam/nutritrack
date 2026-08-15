import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatBar } from './StatBar'
import type { Session } from '../lib/types'

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
  it('keeps the three primary stats in a single row', () => {
    const { container } = render(<StatBar session={session()} now={0} />)
    expect(container.querySelector('.grid-cols-3')).toBeTruthy()
  })

  it('never wraps a stat value onto a second line, even for a multi-day elapsed time', () => {
    const HOUR = 3_600_000
    const s = session({ startedAt: 0 })
    render(<StatBar session={s} now={108 * HOUR + 59 * 60_000} />)
    const value = screen.getByText('108h 59m')
    expect(value.className).toContain('whitespace-nowrap')
  })

  it('shows no caffeine/sodium stat cards when neither is tracked', () => {
    const untracked = session({
      entries: [
        { id: 'e1', timestamp: 0, mileage: 0, label: 'Gel', carbs: 25, caffeine: 0, sodium: 0, presetId: null },
      ],
    })
    render(<StatBar session={untracked} now={0} />)
    expect(screen.queryByText('Caffeine')).toBeNull()
    expect(screen.queryByText('Sodium')).toBeNull()
  })

  it('shows caffeine and sodium as full stat cards, at the top alongside carbs, once tracked', () => {
    const tracked = session({
      entries: [
        { id: 'e1', timestamp: 0, mileage: 0, label: 'Gel', carbs: 25, caffeine: 25, sodium: 150, presetId: null },
      ],
    })
    render(<StatBar session={tracked} now={0} />)
    expect(screen.getByText('Caffeine')).toBeTruthy()
    expect(screen.getByText('25mg')).toBeTruthy()
    expect(screen.getByText('Sodium')).toBeTruthy()
    expect(screen.getByText('150mg')).toBeTruthy()
  })

  it('shows only the tracked one when just caffeine or just sodium is used', () => {
    const caffeineOnly = session({
      entries: [
        { id: 'e1', timestamp: 0, mileage: 0, label: 'Gel', carbs: 25, caffeine: 25, sodium: 0, presetId: null },
      ],
    })
    render(<StatBar session={caffeineOnly} now={0} />)
    expect(screen.getByText('Caffeine')).toBeTruthy()
    expect(screen.queryByText('Sodium')).toBeNull()
  })
})
