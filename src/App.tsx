import { useCallback, useState } from 'react'
import { useStore } from './hooks/useStore'
import { useNow } from './hooks/useNow'
import { StartScreen } from './components/StartScreen'
import { Tracker } from './components/Tracker'
import { PresetManager } from './components/PresetManager'
import { History } from './components/History'
import { SessionDetail } from './components/SessionDetail'
import { Toast } from './components/Toast'
import type { Preset } from './lib/types'

type Screen = 'home' | 'presets' | 'history' | 'session-detail'

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

  const detailSession = store.sessions.find((s) => s.id === detailSessionId) ?? null

  const handleLogPreset = (preset: Preset) => {
    if (!store.activeSession) return
    store.addEntry(store.activeSession.id, {
      timestamp: Date.now(),
      mileage: store.activeSession.currentMileage,
      label: preset.label,
      carbs: preset.carbs,
      presetId: preset.id,
    })
    flash(`Logged ${preset.label} · ${preset.carbs}g carbs`)
  }

  const handleLogCustom = (data: {
    label: string
    carbs: number
    timestamp: number
    mileage: number
  }) => {
    if (!store.activeSession) return
    store.addEntry(store.activeSession.id, {
      timestamp: data.timestamp,
      mileage: data.mileage,
      label: data.label,
      carbs: data.carbs,
      presetId: null,
    })
    if (data.mileage !== store.activeSession.currentMileage) {
      store.setSessionMileage(store.activeSession.id, data.mileage)
    }
    flash(`Logged ${data.label} · ${Math.round(data.carbs)}g carbs`)
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
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-slate-950 text-slate-100">
      {screen === 'home' &&
        (store.activeSession ? (
          <Tracker
            session={store.activeSession}
            presets={store.presets}
            now={now}
            onLogPreset={handleLogPreset}
            onLogCustom={handleLogCustom}
            onUpdateEntry={(entryId, patch) =>
              store.updateEntry(store.activeSession!.id, entryId, patch)
            }
            onDeleteEntry={(entryId) => store.deleteEntry(store.activeSession!.id, entryId)}
            onMileageChange={(mileage) =>
              store.setSessionMileage(store.activeSession!.id, mileage)
            }
            onManagePresets={() => setScreen('presets')}
            onEndSession={handleEndSession}
          />
        ) : (
          <StartScreen onStart={store.startSession} />
        ))}

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
          onDeleteSession={() => {
            if (!window.confirm('Delete this session and all its entries?')) return
            store.deleteSession(detailSession.id)
            setDetailSessionId(null)
            setScreen('history')
          }}
          onClose={() => {
            setDetailSessionId(null)
            setScreen(store.activeSession ? 'home' : 'history')
          }}
        />
      )}

      {screen === 'home' && !store.activeSession && (
        <button
          type="button"
          onClick={() => setScreen('history')}
          className="mx-auto mb-6 rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-300"
        >
          View History
        </button>
      )}

      <Toast message={toast} />
    </div>
  )
}

export default App
