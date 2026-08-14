import { describe, expect, it } from 'vitest'
import { INACTIVITY_TIMEOUT_MS, isSessionStale } from './session'
import type { Session } from './types'

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

describe('isSessionStale', () => {
  it('is false right after activity', () => {
    expect(isSessionStale(session({ lastActivityAt: 1000 }), 1000)).toBe(false)
  })

  it('is false just under the timeout', () => {
    const lastActivityAt = 1000
    const now = lastActivityAt + INACTIVITY_TIMEOUT_MS - 1
    expect(isSessionStale(session({ lastActivityAt }), now)).toBe(false)
  })

  it('is true once the timeout has fully elapsed', () => {
    const lastActivityAt = 1000
    const now = lastActivityAt + INACTIVITY_TIMEOUT_MS
    expect(isSessionStale(session({ lastActivityAt }), now)).toBe(true)
  })

  it('is false for a session that has already ended', () => {
    const lastActivityAt = 1000
    const now = lastActivityAt + INACTIVITY_TIMEOUT_MS + 1
    expect(isSessionStale(session({ lastActivityAt, endedAt: 2000 }), now)).toBe(false)
  })
})
