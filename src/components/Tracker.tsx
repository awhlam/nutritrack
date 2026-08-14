import { useState } from 'react'
import { StatBar } from './StatBar'
import { MileageControl } from './MileageControl'
import { SessionNameField } from './SessionNameField'
import { SessionTimeField } from './SessionTimeField'
import { DrinkSlots } from './DrinkSlots'
import { PresetGrid } from './PresetGrid'
import { EntryList } from './EntryList'
import { CustomEntryModal } from './CustomEntryModal'
import { EntryEditModal } from './EntryEditModal'
import type { Entry, Preset, Session } from '../lib/types'

interface TrackerProps {
  session: Session
  presets: Preset[]
  now: number
  onLogPreset: (preset: Preset) => void
  onCreatePreset: (data: { label: string; carbs: number; color: string }) => void
  onLogCustom: (data: {
    label: string
    carbs: number | null
    timestamp: number
    mileage: number
  }) => void
  onUpdateEntry: (entryId: string, patch: Partial<Entry>) => void
  onDeleteEntry: (entryId: string) => void
  onMileageChange: (mileage: number) => void
  onNameChange: (name: string) => void
  onStartedAtChange: (startedAt: number) => void
  onManagePresets: () => void
  onHistory: () => void
  onEndSession: () => void
  onAssignDrink: (slotIndex: 0 | 1, presetId: string) => void
  onCreateAndAssignDrink: (slotIndex: 0 | 1, data: { label: string; carbs: number }) => void
  onClearDrink: (slotIndex: 0 | 1) => void
  onLogDrink: (slotIndex: 0 | 1, targetPercent: number) => void
}

export function Tracker({
  session,
  presets,
  now,
  onLogPreset,
  onCreatePreset,
  onLogCustom,
  onUpdateEntry,
  onDeleteEntry,
  onMileageChange,
  onNameChange,
  onStartedAtChange,
  onManagePresets,
  onHistory,
  onEndSession,
  onAssignDrink,
  onCreateAndAssignDrink,
  onClearDrink,
  onLogDrink,
}: TrackerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)

  const itemPresets = presets.filter((p) => p.kind === 'item')
  const drinkPresets = presets.filter((p) => p.kind === 'drink')

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 pb-6 pt-4">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm font-semibold text-slate-300">
          In Progress
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onHistory}
            className="rounded-full bg-slate-800 px-4 py-1.5 text-sm font-semibold text-slate-300 active:bg-slate-700"
          >
            History
          </button>
          <button
            type="button"
            onClick={onEndSession}
            className="rounded-full bg-red-500/15 px-4 py-1.5 text-sm font-semibold text-red-400 active:bg-red-500/25"
          >
            End
          </button>
        </div>
      </div>

      <SessionNameField name={session.name} onChange={onNameChange} className="text-lg" />
      <SessionTimeField label="Started" timestamp={session.startedAt} onChange={onStartedAtChange} />

      <StatBar session={session} now={now} />
      <MileageControl mileage={session.currentMileage} onChange={onMileageChange} />

      <DrinkSlots
        session={session}
        drinkPresets={drinkPresets}
        onAssign={onAssignDrink}
        onCreateAndAssign={onCreateAndAssignDrink}
        onClear={onClearDrink}
        onLog={onLogDrink}
      />

      <PresetGrid presets={itemPresets} onLog={onLogPreset} onCreate={onCreatePreset} onManage={onManagePresets} />

      <button
        type="button"
        onClick={() => setShowCustom(true)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-600 bg-slate-800/80 py-4 text-base font-semibold text-slate-200 active:bg-slate-700"
      >
        <span className="text-xl leading-none">✏️</span>
        Custom Entry
      </button>

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
