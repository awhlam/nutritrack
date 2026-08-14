import type { Session } from './types'

export const QUARTER_MARKS = [25, 50, 75, 100] as const

/**
 * The percent of the current bottle consumed so far, derived from logged
 * entries rather than stored as separate state. Deriving it means editing or
 * deleting a drink log entry automatically keeps this consistent — there's
 * no separate counter that can drift out of sync with the log.
 */
export function slotPercent(session: Session, slotIndex: 0 | 1): number {
  const slot = session.drinkSlots[slotIndex]
  const total = session.entries.reduce((sum, e) => {
    if (e.drink && e.drink.slot === slotIndex && e.drink.fillId === slot.fillId) {
      return sum + e.drink.percent
    }
    return sum
  }, 0)
  return Math.min(100, Math.max(0, total))
}

function proportionalDelta(containerTotal: number, deltaPercent: number): number {
  return (deltaPercent / 100) * containerTotal
}

export function drinkDeltaCarbs(containerCarbs: number, deltaPercent: number): number {
  return proportionalDelta(containerCarbs, deltaPercent)
}

export function drinkDeltaCaffeine(containerCaffeine: number, deltaPercent: number): number {
  return proportionalDelta(containerCaffeine, deltaPercent)
}
