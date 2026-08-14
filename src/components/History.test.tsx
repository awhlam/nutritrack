import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { History } from './History'
import type { Session } from '../lib/types'

function session(overrides: Partial<Session> = {}): Session {
  return {
    id: 's1',
    name: '',
    startedAt: new Date(2026, 7, 10, 7, 0, 0).getTime(),
    endedAt: new Date(2026, 7, 10, 9, 0, 0).getTime(),
    currentMileage: 20,
    entries: [],
    drinkSlots: [
      { presetId: null, fillId: 0 },
      { presetId: null, fillId: 0 },
    ],
    lastActivityAt: 0,
    ...overrides,
  }
}

describe('History', () => {
  it('shows the date without an event-name line when the session is unnamed', () => {
    render(<History sessions={[session()]} onSelect={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText('Aug 10, 2026')).toBeTruthy()
    expect(screen.queryByText(/marathon/i)).toBeNull()
  })

  it('shows the event name alongside the date when set', () => {
    render(
      <History
        sessions={[session({ name: 'Boston Marathon' })]}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.getByText('Aug 10, 2026')).toBeTruthy()
    expect(screen.getByText('Boston Marathon')).toBeTruthy()
  })

  it('selecting a named session passes the full session through', () => {
    const onSelect = vi.fn()
    const named = session({ name: 'Boston Marathon' })
    render(<History sessions={[named]} onSelect={onSelect} onClose={vi.fn()} />)
    fireEvent.click(screen.getByText('Boston Marathon'))
    expect(onSelect).toHaveBeenCalledWith(named)
  })

  it('only lists ended sessions, named or not', () => {
    render(
      <History
        sessions={[session({ id: 'active', name: 'In Progress Run', endedAt: null })]}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    )
    expect(screen.queryByText('In Progress Run')).toBeNull()
    expect(screen.getByText('Completed runs and rides will show up here.')).toBeTruthy()
  })
})
