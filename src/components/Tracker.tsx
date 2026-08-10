import { useState } from 'react'
import { StatBar } from './StatBar'
import { MileageControl } from './MileageControl'
import { PresetGrid } from './PresetGrid'
import { EntryList } from './EntryList'
import { CustomEntryModal } from './CustomEntryModal'
import { EntryEditModal } from './EntryEditModal'
import { activityLabel } from '../lib/format'
import type { Entry, Preset, Session } from '../lib/types'

interface TrackerProps {
  session: Session
  presets: Preset[]
  now: number
  onLogPreset: (preset: Preset) => void
  onLogCustom: (data: {
    label: string
    carbs: number
    timestamp: number
    mileage: number
  }) => void
  onUpdateEntry: (entryId: string, patch: Partial<Entry>) => void
  onDeleteEntry: (entryId: string) => void
  onMileageChange: (mileage: number) => void
  onManagePresets: () => void
  onEndSession: () => void
}

export function Tracker({
  session,
  presets,
  now,
  onLogPreset,
  onLogCustom,
  onUpdateEntry,
  onDeleteEntry,
  onMileageChange,
  onManagePresets,
  onEndSession,
}: TrackerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-300">
          {session.activity === 'run' ? '🏃' : '🚴'} {activityLabel(session.activity)}
        </span>
        <button
          type="button"
          onClick={onEndSession}
          className="rounded-full bg-red-500/15 px-4 py-1.5 text-sm font-semibold text-red-400 active:bg-red-500/25"
        >
          End
        </button>
      </div>

      <StatBar session={session} now={now} />
      <MileageControl mileage={session.currentMileage} onChange={onMileageChange} />

      <PresetGrid
        presets={presets}
        onLog={onLogPreset}
        onCustom={() => setShowCustom(true)}
        onManage={onManagePresets}
      />

      <div className="flex-1">
        <h2 className="mb-1 mt-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Log
        </h2>
        <EntryList entries={session.entries} onSelect={setEditingEntry} />
      </div>

      {showCustom && (
        <CustomEntryModal
          defaultMileage={session.currentMileage}
          onClose={() => setShowCustom(false)}
          onSave={(data) => {
            onLogCustom(data)
            setShowCustom(false)
          }}
        />
      )}

      {editingEntry && (
        <EntryEditModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={(patch) => {
            onUpdateEntry(editingEntry.id, patch)
            setEditingEntry(null)
          }}
          onDelete={() => {
            onDeleteEntry(editingEntry.id)
            setEditingEntry(null)
          }}
        />
      )}
    </div>
  )
}
