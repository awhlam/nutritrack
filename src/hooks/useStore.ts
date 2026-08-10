import { useCallback, useEffect, useState } from 'react'
import type { Activity, Entry, Preset, Session } from '../lib/types'
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

  const startSession = useCallback((activity: Activity) => {
    const session: Session = {
      id: uid(),
      activity,
      startedAt: Date.now(),
      endedAt: null,
      currentMileage: 0,
      entries: [],
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

  const addPreset = useCallback((preset: Omit<Preset, 'id'>) => {
    setPresets((prev) => [...prev, { ...preset, id: uid() }])
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
    addPreset,
    updatePreset,
    deletePreset,
  }
}
