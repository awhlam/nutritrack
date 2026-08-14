import type { Session } from './types'

export const INACTIVITY_TIMEOUT_MS = 6 * 60 * 60 * 1000

export function isSessionStale(session: Session, now: number): boolean {
  return session.endedAt === null && now - session.lastActivityAt >= INACTIVITY_TIMEOUT_MS
}
