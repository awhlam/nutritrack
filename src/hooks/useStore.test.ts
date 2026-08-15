import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStore } from './useStore'
import { DEFAULT_PRESETS } from '../lib/storage'
import { INACTIVITY_TIMEOUT_MS } from '../lib/session'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useStore sessions', () => {
  it('starts with the default presets and no active session', () => {
    const { result } = renderHook(() => useStore())
    expect(result.current.activeSession).toBeNull()
    expect(result.current.presets).toHaveLength(DEFAULT_PRESETS.length)
  })

  it('starting a session makes it active with an empty log', () => {
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.startSession()
    })
    expect(result.current.activeSession).not.toBeNull()
    expect(result.current.activeSession?.entries).toEqual([])
    expect(result.current.activeSession?.currentMileage).toBe(0)
    expect(result.current.activeSession?.endedAt).toBeNull()
    expect(result.current.activeSession?.name).toBe('')
  })

  it('ending a session stamps endedAt and clears the active session', () => {
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      result.current.endSession(id)
    })
    expect(result.current.activeSession).toBeNull()
    expect(result.current.sessions.find((s) => s.id === id)?.endedAt).toBeTypeOf('number')
  })

  it('keeps an ended session in history', () => {
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      result.current.endSession(id)
    })
    expect(result.current.sessions).toHaveLength(1)
  })

  it('deleting a session removes it entirely', () => {
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      result.current.deleteSession(id)
    })
    expect(result.current.sessions).toHaveLength(0)
    expect(result.current.activeSession).toBeNull()
  })

  it('persists sessions across remounts', () => {
    const first = renderHook(() => useStore())
    act(() => {
      first.result.current.startSession()
    })
    first.unmount()

    const second = renderHook(() => useStore())
    expect(second.result.current.sessions).toHaveLength(1)
    expect(second.result.current.activeSession).not.toBeNull()
  })
})

describe('useStore default drink slots', () => {
  it('auto-assigns existing drink presets to both bottle slots on start', () => {
    // The default presets already include two drinks (Water, Carb Drink Mix).
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.startSession()
    })
    const slots = result.current.activeSession!.drinkSlots
    expect(slots[0]).toEqual({ presetId: 'preset-water', fillId: 1 })
    expect(slots[1]).toEqual({ presetId: 'preset-carb-mix', fillId: 1 })
  })

  it('auto-assigns just the first slot when only one drink preset exists', () => {
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.deletePreset('preset-carb-mix')
    })
    act(() => {
      result.current.startSession()
    })
    const slots = result.current.activeSession!.drinkSlots
    expect(slots[0]).toEqual({ presetId: 'preset-water', fillId: 1 })
    expect(slots[1]).toEqual({ presetId: null, fillId: 0 })
  })

  it('leaves both slots empty when there are no drink presets at all', () => {
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.deletePreset('preset-water')
      result.current.deletePreset('preset-carb-mix')
    })
    act(() => {
      result.current.startSession()
    })
    expect(result.current.activeSession!.drinkSlots).toEqual([
      { presetId: null, fillId: 0 },
      { presetId: null, fillId: 0 },
    ])
  })
})

describe('useStore entries', () => {
  function startedStore() {
    const hook = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = hook.result.current.startSession()
    })
    return { hook, id }
  }

  it('logs an entry with its time, mileage and carbs', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.addEntry(id, {
        timestamp: 1234,
        mileage: 6,
        label: 'Energy Gel',
        carbs: 25,
        caffeine: 25,
        sodium: 0,
        presetId: 'preset-gel',
      })
    })
    const entries = hook.result.current.activeSession!.entries
    expect(entries).toHaveLength(1)
    expect(entries[0]).toMatchObject({
      timestamp: 1234,
      mileage: 6,
      label: 'Energy Gel',
      carbs: 25,
      caffeine: 25,
      sodium: 0,
      presetId: 'preset-gel',
    })
    expect(entries[0].id).toBeTruthy()
  })

  it('edits the time and mileage of a past entry', () => {
    const { hook, id } = startedStore()
    let entryId = ''
    act(() => {
      entryId = hook.result.current.addEntry(id, {
        timestamp: 1000,
        mileage: 2,
        label: 'Banana',
        carbs: 27,
        caffeine: 0,
        sodium: 0,
        presetId: null,
      })
    })
    act(() => {
      hook.result.current.updateEntry(id, entryId, { timestamp: 9000, mileage: 14 })
    })
    const entry = hook.result.current.activeSession!.entries[0]
    expect(entry.timestamp).toBe(9000)
    expect(entry.mileage).toBe(14)
    expect(entry.carbs).toBe(27)
    expect(entry.label).toBe('Banana')
  })

  it('deletes an entry without touching the others', () => {
    const { hook, id } = startedStore()
    let firstId = ''
    act(() => {
      firstId = hook.result.current.addEntry(id, {
        timestamp: 1000,
        mileage: 1,
        label: 'Gel',
        carbs: 25,
        caffeine: 0,
        sodium: 0,
        presetId: null,
      })
      hook.result.current.addEntry(id, {
        timestamp: 2000,
        mileage: 2,
        label: 'Chews',
        carbs: 24,
        caffeine: 0,
        sodium: 0,
        presetId: null,
      })
    })
    act(() => {
      hook.result.current.deleteEntry(id, firstId)
    })
    const entries = hook.result.current.activeSession!.entries
    expect(entries).toHaveLength(1)
    expect(entries[0].label).toBe('Chews')
  })

  it('tracks the running mileage on the session', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.setSessionMileage(id, 17)
    })
    expect(hook.result.current.activeSession!.currentMileage).toBe(17)
  })

  it('logs a pending entry with a null carb count', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.addEntry(id, {
        timestamp: 1000,
        mileage: 3,
        label: 'Aid station mystery snack',
        carbs: null,
        caffeine: 0,
        sodium: 0,
        presetId: null,
      })
    })
    expect(hook.result.current.activeSession!.entries[0].carbs).toBeNull()
  })

  it('names the session', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.setSessionName(id, 'Boston Marathon')
    })
    expect(hook.result.current.activeSession!.name).toBe('Boston Marathon')
  })

  it('renames back to unnamed with an empty string', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.setSessionName(id, 'Boston Marathon')
    })
    act(() => {
      hook.result.current.setSessionName(id, '')
    })
    expect(hook.result.current.activeSession!.name).toBe('')
  })
})

describe('useStore drink slots', () => {
  // Isolate assign/clear semantics from the default-assignment behavior
  // (covered separately above) by starting with no drink presets, so slots
  // begin unassigned and fillId math is easy to reason about.
  function startedStore() {
    const hook = renderHook(() => useStore())
    act(() => {
      hook.result.current.deletePreset('preset-water')
      hook.result.current.deletePreset('preset-carb-mix')
    })
    let id = ''
    act(() => {
      id = hook.result.current.startSession()
    })
    return { hook, id }
  }

  it('assigns a preset to a slot and bumps fillId from its starting value', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.assignDrinkSlot(id, 0, 'preset-water')
    })
    expect(hook.result.current.activeSession!.drinkSlots[0]).toEqual({
      presetId: 'preset-water',
      fillId: 1,
    })
    // The other slot is untouched.
    expect(hook.result.current.activeSession!.drinkSlots[1]).toEqual({
      presetId: null,
      fillId: 0,
    })
  })

  it('bumps fillId again on reassignment, so a refill resets independent of past entries', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.assignDrinkSlot(id, 1, 'preset-carb-mix')
    })
    act(() => {
      hook.result.current.assignDrinkSlot(id, 1, 'preset-carb-mix')
    })
    expect(hook.result.current.activeSession!.drinkSlots[1].fillId).toBe(2)
  })

  it('clearing a slot removes the preset but keeps fillId', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.assignDrinkSlot(id, 0, 'preset-water')
    })
    act(() => {
      hook.result.current.clearDrinkSlot(id, 0)
    })
    expect(hook.result.current.activeSession!.drinkSlots[0]).toEqual({
      presetId: null,
      fillId: 1,
    })
  })

  it('addPresetWithId uses the caller-supplied id, so it can be assigned in the same action', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.addPresetWithId({
        id: 'custom-drink-1',
        label: 'Electrolyte Mix',
        carbs: 45,
        caffeine: 0,
        sodium: 0,
        color: '#38bdf8',
        kind: 'drink',
      })
      hook.result.current.assignDrinkSlot(id, 0, 'custom-drink-1')
    })
    expect(hook.result.current.presets.map((p) => p.id)).toContain('custom-drink-1')
    expect(hook.result.current.activeSession!.drinkSlots[0].presetId).toBe('custom-drink-1')
  })
})

describe('useStore resetSession', () => {
  it('clears entries, mileage, and re-applies the default drink slots, but keeps the id and name', () => {
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      result.current.setSessionName(id, 'Boston Marathon')
      result.current.setSessionMileage(id, 12)
      result.current.addEntry(id, {
        timestamp: Date.now(),
        mileage: 12,
        label: 'Energy Gel',
        carbs: 30,
        caffeine: 0,
        sodium: 0,
        presetId: 'preset-gel',
      })
      result.current.assignDrinkSlot(id, 0, 'preset-carb-mix')
    })
    expect(result.current.activeSession!.entries).toHaveLength(1)

    act(() => {
      result.current.resetSession(id)
    })

    expect(result.current.activeSession!.id).toBe(id)
    expect(result.current.activeSession!.name).toBe('Boston Marathon')
    expect(result.current.activeSession!.entries).toEqual([])
    expect(result.current.activeSession!.currentMileage).toBe(0)
    expect(result.current.activeSession!.drinkSlots).toEqual([
      { presetId: 'preset-water', fillId: 1 },
      { presetId: 'preset-carb-mix', fillId: 1 },
    ])
  })

  it('restarts the clock', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      vi.setSystemTime(60_000)
    })
    act(() => {
      result.current.resetSession(id)
    })
    expect(result.current.activeSession!.startedAt).toBe(60_000)
    expect(result.current.activeSession!.lastActivityAt).toBe(60_000)
  })

  it('does not end the session — it stays active', () => {
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      result.current.resetSession(id)
    })
    expect(result.current.activeSession?.id).toBe(id)
    expect(result.current.activeSession?.endedAt).toBeNull()
  })
})

describe('useStore session times', () => {
  function startedStore() {
    const hook = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = hook.result.current.startSession()
    })
    return { hook, id }
  }

  it('edits the start time of the active session', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.setSessionStartedAt(id, 5000)
    })
    expect(hook.result.current.activeSession!.startedAt).toBe(5000)
  })

  it('edits the end time of an ended session', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.endSession(id)
    })
    act(() => {
      hook.result.current.setSessionEndedAt(id, 9000)
    })
    expect(hook.result.current.sessions.find((s) => s.id === id)?.endedAt).toBe(9000)
  })

  it('ending a session accepts an explicit end time instead of always using now', () => {
    const { hook, id } = startedStore()
    act(() => {
      hook.result.current.endSession(id, 12345)
    })
    expect(hook.result.current.sessions.find((s) => s.id === id)?.endedAt).toBe(12345)
  })
})

describe('useStore auto-end on inactivity', () => {
  it('auto-ends the active session after 6h of inactivity, using last activity as the end time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      vi.advanceTimersByTime(INACTIVITY_TIMEOUT_MS)
    })
    expect(result.current.activeSession).toBeNull()
    const ended = result.current.sessions.find((s) => s.id === id)
    expect(ended?.endedAt).toBe(0)
    expect(result.current.autoEndedSessionId).toBe(id)
  })

  it('does not auto-end a session that had activity inside the last 6h', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      vi.advanceTimersByTime(INACTIVITY_TIMEOUT_MS - 60_000)
    })
    act(() => {
      result.current.addEntry(id, {
        timestamp: Date.now(),
        mileage: 1,
        label: 'Gel',
        carbs: 25,
        caffeine: 0,
        sodium: 0,
        presetId: null,
      })
    })
    act(() => {
      vi.advanceTimersByTime(INACTIVITY_TIMEOUT_MS - 60_000)
    })
    expect(result.current.activeSession).not.toBeNull()
  })

  it('ends an already-stale session immediately on mount, without waiting for the next interval tick', () => {
    const staleSession = {
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
    }
    localStorage.setItem('nutritrack:sessions', JSON.stringify([staleSession]))
    localStorage.setItem('nutritrack:activeSessionId', JSON.stringify('s1'))

    vi.useFakeTimers()
    vi.setSystemTime(INACTIVITY_TIMEOUT_MS + 1)
    const { result } = renderHook(() => useStore())
    expect(result.current.activeSession).toBeNull()
    expect(result.current.sessions[0].endedAt).toBe(0)
    expect(result.current.autoEndedSessionId).toBe('s1')
  })

  it('clearAutoEndedSession resets it back to null', () => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
    const { result } = renderHook(() => useStore())
    let id = ''
    act(() => {
      id = result.current.startSession()
    })
    act(() => {
      vi.advanceTimersByTime(INACTIVITY_TIMEOUT_MS)
    })
    expect(result.current.autoEndedSessionId).toBe(id)
    act(() => {
      result.current.clearAutoEndedSession()
    })
    expect(result.current.autoEndedSessionId).toBeNull()
  })
})

describe('useStore presets', () => {
  it('adds a preset with a generated id', () => {
    const { result } = renderHook(() => useStore())
    act(() => {
      result.current.addPreset({
        label: 'Waffle',
        carbs: 21,
        caffeine: 0,
        sodium: 0,
        color: '#22c55e',
        kind: 'item',
      })
    })
    const added = result.current.presets.at(-1)!
    expect(added).toMatchObject({
      label: 'Waffle',
      carbs: 21,
      caffeine: 0,
      sodium: 0,
      color: '#22c55e',
      kind: 'item',
    })
    expect(added.id).toBeTruthy()
  })

  it('updates an existing preset', () => {
    const { result } = renderHook(() => useStore())
    const target = result.current.presets[0]
    act(() => {
      result.current.updatePreset(target.id, { carbs: 30 })
    })
    expect(result.current.presets[0].carbs).toBe(30)
    expect(result.current.presets[0].label).toBe(target.label)
  })

  it('deletes a preset', () => {
    const { result } = renderHook(() => useStore())
    const target = result.current.presets[0]
    act(() => {
      result.current.deletePreset(target.id)
    })
    expect(result.current.presets.map((p) => p.id)).not.toContain(target.id)
  })

  it('persists preset edits across remounts', () => {
    const first = renderHook(() => useStore())
    act(() => {
      first.result.current.addPreset({
        label: 'Rice Cake',
        carbs: 18,
        caffeine: 0,
        sodium: 0,
        color: '#14b8a6',
        kind: 'item',
      })
    })
    first.unmount()

    const second = renderHook(() => useStore())
    expect(second.result.current.presets.map((p) => p.label)).toContain('Rice Cake')
  })
})
