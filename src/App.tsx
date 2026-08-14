import { useCallback, useEffect, useState } from 'react'
import { useStore } from './hooks/useStore'
import { useNow } from './hooks/useNow'
import { StartScreen } from './components/StartScreen'
import { Tracker } from './components/Tracker'
import { PresetManager } from './components/PresetManager'
import { History } from './components/History'
import { SessionDetail } from './components/SessionDetail'
import { Toast } from './components/Toast'
import { drinkDeltaCaffeine, drinkDeltaCarbs, slotPercent } from './lib/drinks'
import { uid } from './lib/storage'
import type { Preset } from './lib/types'

type Screen = 'home' | 'presets' | 'history' | 'session-detail'

const DRINK_SLOT_COLORS: [string, string] = ['#38bdf8', '#3b82f6']

function App() {
  const store = useStore()
  const now = useNow()
  const [screen, setScreen] = useState<Screen>('home')
  const [detailSessionId, setDetailSessionId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const flash = useCallback((message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 1800)
  }, [])

  const { autoEndedSessionId, clearAutoEndedSession } = store
  useEffect(() => {
    if (!autoEndedSessionId) return
    flash('Previous session auto-ended after 6h of inactivity')
    clearAutoEndedSession()
  }, [autoEndedSessionId, clearAutoEndedSession, flash])

  const detailSession = store.sessions.find((s) => s.id === detailSessionId) ?? null

  const handleLogPreset = (preset: Preset) => {
    if (!store.activeSession) return
    store.addEntry(store.activeSession.id, {
      timestamp: Date.now(),
      mileage: store.activeSession.currentMileage,
      label: preset.label,
      carbs: preset.carbs,
      caffeine: preset.caffeine,
      presetId: preset.id,
    })
    flash(`Logged ${preset.label} · ${preset.carbs}g carbs`)
  }

  const handleCreatePreset = (data: { label: string; carbs: number; caffeine: number; color: string }) => {
    store.addPreset({ ...data, kind: 'item' })
  }

  const handleLogCustom = (data: {
    label: string
    carbs: number | null
    caffeine: number
    timestamp: number
    mileage: number
  }) => {
    if (!store.activeSession) return
    store.addEntry(store.activeSession.id, {
      timestamp: data.timestamp,
      mileage: data.mileage,
      label: data.label,
      carbs: data.carbs,
      caffeine: data.caffeine,
      presetId: null,
    })
    if (data.mileage !== store.activeSession.currentMileage) {
      store.setSessionMileage(store.activeSession.id, data.mileage)
    }
    flash(
      data.carbs === null
        ? `Logged ${data.label} · add carbs later`
        : `Logged ${data.label} · ${Math.round(data.carbs)}g carbs`,
    )
  }

  const handleAssignDrink = (slotIndex: 0 | 1, presetId: string) => {
    if (!store.activeSession) return
    store.assignDrinkSlot(store.activeSession.id, slotIndex, presetId)
  }

  const handleCreateAndAssignDrink = (
    slotIndex: 0 | 1,
    data: { label: string; carbs: number; caffeine: number },
  ) => {
    if (!store.activeSession) return
    const preset: Preset = {
      id: uid(),
      label: data.label,
      carbs: data.carbs,
      caffeine: data.caffeine,
      color: DRINK_SLOT_COLORS[slotIndex],
      kind: 'drink',
    }
    store.addPresetWithId(preset)
    store.assignDrinkSlot(store.activeSession.id, slotIndex, preset.id)
  }

  const handleClearDrink = (slotIndex: 0 | 1) => {
    if (!store.activeSession) return
    store.clearDrinkSlot(store.activeSession.id, slotIndex)
  }

  const handleLogDrink = (slotIndex: 0 | 1, targetPercent: number) => {
    const session = store.activeSession
    if (!session) return
    const slot = session.drinkSlots[slotIndex]
    const preset = store.presets.find((p) => p.id === slot.presetId)
    if (!preset) return

    const currentPercent = slotPercent(session, slotIndex)
    const delta = Math.round(targetPercent) - currentPercent
    if (delta <= 0) return

    const carbs = drinkDeltaCarbs(preset.carbs, delta)
    const caffeine = drinkDeltaCaffeine(preset.caffeine, delta)
    store.addEntry(session.id, {
      timestamp: Date.now(),
      mileage: session.currentMileage,
      label: preset.label,
      carbs,
      caffeine,
      presetId: preset.id,
      drink: { slot: slotIndex, fillId: slot.fillId, percent: delta },
    })
    flash(`Logged ${preset.label} +${delta}% · ${Math.round(carbs)}g carbs`)
  }

  const handleEndSession = () => {
    if (!store.activeSession) return
    if (!window.confirm('End this session? You can still edit entries and export afterward.')) {
      return
    }
    const id = store.activeSession.id
    store.endSession(id)
    setDetailSessionId(id)
    setScreen('session-detail')
  }

  return (
    <div className="app-shell mx-auto flex min-h-screen max-w-md flex-col bg-slate-950 text-slate-100">
      {screen === 'home' && !store.activeSession && (
        <StartScreen
          onStart={store.startSession}
          onManagePresets={() => setScreen('presets')}
          onHistory={() => setScreen('history')}
        />
      )}

      {screen === 'home' && store.activeSession && (
        <Tracker
          session={store.activeSession}
          presets={store.presets}
          now={now}
          onLogPreset={handleLogPreset}
          onCreatePreset={handleCreatePreset}
          onLogCustom={handleLogCustom}
          onUpdateEntry={(entryId, patch) =>
            store.updateEntry(store.activeSession!.id, entryId, patch)
          }
          onDeleteEntry={(entryId) => store.deleteEntry(store.activeSession!.id, entryId)}
          onMileageChange={(mileage) =>
            store.setSessionMileage(store.activeSession!.id, mileage)
          }
          onNameChange={(name) => store.setSessionName(store.activeSession!.id, name)}
          onStartedAtChange={(startedAt) =>
            store.setSessionStartedAt(store.activeSession!.id, startedAt)
          }
          onManagePresets={() => setScreen('presets')}
          onHistory={() => setScreen('history')}
          onEndSession={handleEndSession}
          onAssignDrink={handleAssignDrink}
          onCreateAndAssignDrink={handleCreateAndAssignDrink}
          onClearDrink={handleClearDrink}
          onLogDrink={handleLogDrink}
        />
      )}

      {screen === 'presets' && (
        <PresetManager
          presets={store.presets}
          onAdd={store.addPreset}
          onUpdate={store.updatePreset}
          onDelete={store.deletePreset}
          onClose={() => setScreen('home')}
        />
      )}

      {screen === 'history' && (
        <History
          sessions={store.sessions}
          onSelect={(session) => {
            setDetailSessionId(session.id)
            setScreen('session-detail')
          }}
          onClose={() => setScreen('home')}
        />
      )}

      {screen === 'session-detail' && detailSession && (
        <SessionDetail
          session={detailSession}
          now={now}
          onUpdateEntry={(entryId, patch) => store.updateEntry(detailSession.id, entryId, patch)}
          onDeleteEntry={(entryId) => store.deleteEntry(detailSession.id, entryId)}
          onNameChange={(name) => store.setSessionName(detailSession.id, name)}
          onStartedAtChange={(startedAt) => store.setSessionStartedAt(detailSession.id, startedAt)}
          onEndedAtChange={(endedAt) => store.setSessionEndedAt(detailSession.id, endedAt)}
          onDeleteSession={() => {
            if (!window.confirm('Delete this session and all its entries?')) return
            store.deleteSession(detailSession.id)
            setDetailSessionId(null)
            setScreen('history')
          }}
          onClose={() => {
            setDetailSessionId(null)
            setScreen('home')
          }}
        />
      )}

      <Toast message={toast} />
    </div>
  )
}

export default App
