import { useCallback, useEffect, useState } from 'react'
import type { DrinkSlot, Entry, Preset, Session } from '../lib/types'
import {
  loadActiveSessionId,
  loadPresets,
  loadSessions,
  saveActiveSessionId,
  savePresets,
  saveSessions,
  uid,
} from '../lib/storage'

export function useStore() {
  const [presets, setPresets] = useState<Preset[]>(() => loadPresets())
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions())
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    loadActiveSessionId(),
  )

  useEffect(() => savePresets(presets), [presets])
  useEffect(() => saveSessions(sessions), [sessions])
  useEffect(() => saveActiveSessionId(activeSessionId), [activeSessionId])

  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null

  const startSession = useCallback(() => {
    const session: Session = {
      id: uid(),
      startedAt: Date.now(),
      endedAt: null,
      currentMileage: 0,
      entries: [],
      drinkSlots: [
        { presetId: null, fillId: 0 },
        { presetId: null, fillId: 0 },
      ],
    }
    setSessions((prev) => [...prev, session])
    setActiveSessionId(session.id)
    return session.id
  }, [])

  const endSession = useCallback((sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, endedAt: Date.now() } : s)),
    )
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
          s.id === sessionId ? { ...s, entries: [...s.entries, newEntry] } : s,
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
          ? { ...s, entries: s.entries.filter((e) => e.id !== entryId) }
          : s,
      ),
    )
  }, [])

  const setSessionMileage = useCallback((sessionId: string, mileage: number) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, currentMileage: mileage } : s)),
    )
  }, [])

  /** Assigning a drink (including re-picking the same one for a refill) always bumps fillId, so progress starts over for the new bottle. */
  const assignDrinkSlot = useCallback((sessionId: string, slotIndex: 0 | 1, presetId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const drinkSlots = [...s.drinkSlots] as [DrinkSlot, DrinkSlot]
        drinkSlots[slotIndex] = { presetId, fillId: drinkSlots[slotIndex].fillId + 1 }
        return { ...s, drinkSlots }
      }),
    )
  }, [])

  const clearDrinkSlot = useCallback((sessionId: string, slotIndex: 0 | 1) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const drinkSlots = [...s.drinkSlots] as [DrinkSlot, DrinkSlot]
        drinkSlots[slotIndex] = { presetId: null, fillId: drinkSlots[slotIndex].fillId }
        return { ...s, drinkSlots }
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

  return {
    presets,
    sessions,
    activeSession,
    startSession,
    endSession,
    deleteSession,
    addEntry,
    updateEntry,
    deleteEntry,
    setSessionMileage,
    assignDrinkSlot,
    clearDrinkSlot,
    addPreset,
    addPresetWithId,
    updatePreset,
    deletePreset,
  }
}
