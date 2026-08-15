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

  it('shows caffeine/sodium only as a secondary line, only when tracked', () => {
    const untracked = session({
      entries: [
        { id: 'e1', timestamp: 0, mileage: 0, label: 'Gel', carbs: 25, caffeine: 0, sodium: 0, presetId: null },
      ],
    })
    render(<StatBar session={untracked} now={0} />)
    expect(screen.queryByText(/caffeine|sodium/)).toBeNull()
  })
})
