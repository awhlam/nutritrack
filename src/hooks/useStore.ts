import { useCallback, useEffect, useRef, useState } from 'react'
import type { DrinkSlot, Entry, Preset, Session } from '../lib/types'
import { isSessionStale } from '../lib/session'
import {
  loadActiveSessionId,
  loadPresets,
  loadSessions,
  saveActiveSessionId,
  savePresets,
  saveSessions,
  uid,
} from '../lib/storage'

const STALE_CHECK_INTERVAL_MS = 60_000

export function useStore() {
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets())
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions())
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    loadActiveSessionId(),
  )
  const [autoEndedSessionId, setAutoEndedSessionId] = useState<string | null>(null)

  useEffect(() => savePresets(presets), [presets])
  useEffect(() => saveSessions(sessions), [sessions])
  useEffect(() => saveActiveSessionId(activeSessionId), [activeSessionId])

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null

  /** Fills the two bottle slots from whatever drink presets exist, so a session starts ready to log instead of requiring a manual assign every time. */
  const defaultDrinkSlots = useCallback((): [DrinkSlot, DrinkSlot] => {
    const drinkPresets = presets.filter((p) => p.kind === 'drink')
    return [
      { presetId: drinkPresets[0]?.id ?? null, fillId: drinkPresets[0] ? 1 : 0 },
      { presetId: drinkPresets[1]?.id ?? null, fillId: drinkPresets[1] ? 1 : 0 },
    ]
  }, [presets])

  const startSession = useCallback(() => {
    const now = Date.now()
    const session: Session = {
      id: uid(),
      name: '',
      startedAt: now,
      endedAt: null,
      currentMileage: 0,
      entries: [],
      drinkSlots: defaultDrinkSlots(),
      lastActivityAt: now,
    }
    setSessions((prev) => [...prev, session])
    setActiveSessionId(session.id)
    return session.id
  }, [defaultDrinkSlots])

  /** Restarts the clock and clears the log/mileage/drink progress, but keeps the session's id and name so you don't have to retype it. */
  const resetSession = useCallback(
    (sessionId: string) => {
      const now = Date.now()
      const drinkSlots = defaultDrinkSlots()
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, startedAt: now, currentMileage: 0, entries: [], drinkSlots, lastActivityAt: now }
            : s,
        ),
      )
    },
    [defaultDrinkSlots],
  )

  const endSession = useCallback((sessionId: string, endedAt: number = Date.now()) => {
    setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, endedAt } : s)))
    setActiveSessionId((current) => (current === sessionId ? null : current))
  }, [])

  const deleteSession = useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    setActiveSessionId((current) => (current === sessionId ? null : current))
  }, [])

  const addEntry = useCallback(
    (sessionId: string, entry: Omit<Entry, 'id'>) => {
      const newEntry: Entry = { ...entry, id: uid() }
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, entries: [...s.entries, newEntry], lastActivityAt: Date.now() }
            : s,
        ),
      )
      return newEntry.id
    },
    [],
  )

  const updateEntry = useCallback(
    (sessionId: string, entryId: string, patch: Partial<Entry>) => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                entries: s.entries.map((e) =>
                  e.id === entryId ? { ...e, ...patch } : e,
                ),
                lastActivityAt: Date.now(),
              }
            : s,
        ),
      )
    },
    [],
  )

  const deleteEntry = useCallback((sessionId: string, entryId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, entries: s.entries.filter((e) => e.id !== entryId), lastActivityAt: Date.now() }
          : s,
      ),
    )
  }, [])

  const setSessionMileage = useCallback((sessionId: string, mileage: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, currentMileage: mileage, lastActivityAt: Date.now() } : s,
      ),
    )
  }, [])

  const setSessionName = useCallback((sessionId: string, name: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, name, lastActivityAt: Date.now() } : s)),
    )
  }, [])

  const setSessionStartedAt = useCallback((sessionId: string, startedAt: number) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, startedAt, lastActivityAt: Date.now() } : s,
      ),
    )
  }, [])

  const setSessionEndedAt = useCallback((sessionId: string, endedAt: number) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, endedAt, lastActivityAt: Date.now() } : s)),
    )
  }, [])

  /** Assigning a drink (including re-picking the same one for a refill) always bumps fillId, so progress starts over for the new bottle. */
  const assignDrinkSlot = useCallback((sessionId: string, slotIndex: 0 | 1, presetId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const drinkSlots = [...s.drinkSlots] as [DrinkSlot, DrinkSlot]
        drinkSlots[slotIndex] = { presetId, fillId: drinkSlots[slotIndex].fillId + 1 }
        return { ...s, drinkSlots, lastActivityAt: Date.now() }
      }),
    )
  }, [])

  const clearDrinkSlot = useCallback((sessionId: string, slotIndex: 0 | 1) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const drinkSlots = [...s.drinkSlots] as [DrinkSlot, DrinkSlot]
        drinkSlots[slotIndex] = { presetId: null, fillId: drinkSlots[slotIndex].fillId }
        return { ...s, drinkSlots, lastActivityAt: Date.now() }
      }),
    )
  }, [])

  const addPreset = useCallback((preset: Omit<Preset, 'id'>) => {
    setPresets((prev) => [...prev, { ...preset, id: uid() }])
  }, [])

  /** For creating a preset with a caller-chosen id, e.g. so it can be assigned to a drink slot in the same action. */
  const addPresetWithId = useCallback((preset: Preset) => {
    setPresets((prev) => [...prev, preset])
  }, [])

  const updatePreset = useCallback((id: string, patch: Partial<Preset>) => {
    setPresets((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  const deletePreset = useCallback((id: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
  }, [])

  // Keep refs in sync so the interval below always sees current state without
  // having to tear down and recreate itself on every session change.
  const sessionsRef = useRef(sessions)
  const activeSessionIdRef = useRef(activeSessionId)
  useEffect(() => {
    sessionsRef.current = sessions
  }, [sessions])
  useEffect(() => {
    activeSessionIdRef.current = activeSessionId
  }, [activeSessionId])

  useEffect(() => {
    const checkForStaleSession = () => {
      const id = activeSessionIdRef.current
      if (!id) return
      const session = sessionsRef.current.find((s) => s.id === id)
      if (!session || !isSessionStale(session, Date.now())) return
      // Use the last known activity as the end time — the closest honest guess
      // at when the ride actually ended, rather than whenever this check ran.
      endSession(session.id, session.lastActivityAt)
      setAutoEndedSessionId(session.id)
    }

    checkForStaleSession()
    const interval = window.setInterval(checkForStaleSession, STALE_CHECK_INTERVAL_MS)
    return () => window.clearInterval(interval)
  }, [endSession])

  const clearAutoEndedSession = useCallback(() => setAutoEndedSessionId(null), [])

  return {
    presets,
    sessions,
    activeSession,
    startSession,
    endSession,
    resetSession,
    deleteSession,
    addEntry,
    updateEntry,
    deleteEntry,
    setSessionMileage,
    setSessionName,
    setSessionStartedAt,
    setSessionEndedAt,
    assignDrinkSlot,
    clearDrinkSlot,
    addPreset,
    addPresetWithId,
    updatePreset,
    deletePreset,
    autoEndedSessionId,
    clearAutoEndedSession,
  }
}
